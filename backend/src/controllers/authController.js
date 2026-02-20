"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Signs a JWT for the given user ID.
 * Secret and expiry are pulled from environment variables — never hard-coded.
 * JWT_SECRET presence is guaranteed by the startup guard in app.js.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    algorithm: "HS256",
  });

/**
 * Returns a safe user payload — no password, no internal fields.
 */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new user account. Passwords are hashed in the User model pre-save hook.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email before attempting to insert (gives a clearer
    // error message than relying solely on the Mongoose duplicate-key error).
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Validates credentials and returns a signed JWT.
 * Deliberately uses a single generic error message for wrong email/password
 * to prevent user-enumeration attacks.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly opt-in to password field (select: false on schema)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // Unified branch: invalid email OR invalid password → same 401 response
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me   (protected route — requires valid JWT via authMiddleware)
 * Returns the currently authenticated user's profile.
 * req.user is fully populated by protect — no additional DB call needed.
 */
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
