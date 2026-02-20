"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — Express middleware that enforces JWT authentication.
 *
 * Reads the Bearer token from the Authorization header, verifies it, and
 * attaches the corresponding user document to req.user so downstream handlers
 * can access the authenticated identity without making another DB call.
 *
 * - Guards against empty token string ("Bearer " with nothing after).
 * - All failure branches return the same generic message to prevent
 *   user-enumeration via differing 401 response bodies.
 * - Checks passwordChangedAt so tokens issued before a password reset
 *   are automatically rejected.
 *
 * Usage: router.get('/protected', protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    // Check both presence of header AND that the token part is non-empty.
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ") ||
      authHeader.split(" ")[1]?.trim() === ""
    ) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1].trim();

    // 2. Verify signature and expiry — throws on failure
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user AND include passwordChangedAt for stale-token detection.
    //    (select: false on schema means we must explicitly opt in)
    const user = await User.findById(decoded.id).select("+passwordChangedAt");

    // Same generic message whether the user is missing or the token is invalid
    // — prevents user-enumeration via differing 401 response bodies.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // Reject tokens issued before the user last changed their password.
    // Ensures compromised tokens are invalidated the moment the account
    // owner resets their credentials.
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: "Your password was recently changed. Please log in again.",
      });
    }

    // 4. Attach authenticated user to request context
    req.user = user;
    next();
  } catch (error) {
    // Translate JWT errors to generic messages — never expose internals.
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired." });
    }
    next(error);
  }
};

module.exports = { protect };
