"use strict";

const rateLimit = require("express-rate-limit");

/**
 * authLimiter — applied exclusively to authentication endpoints.
 *
 * Caps each IP at 10 requests per 15-minute window to slow brute-force
 * and credential-stuffing attacks.
 *
 * Override the defaults via environment variables:
 *   AUTH_RATE_LIMIT_WINDOW_MS  — window size in milliseconds (default: 900000)
 *   AUTH_RATE_LIMIT_MAX        — max requests per window    (default: 10)
 */
const authLimiter = rateLimit({
  windowMs: parseInt(
    process.env.AUTH_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000),
    10,
  ),
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "10", 10),
  standardHeaders: true, // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again in 15 minutes.",
  },
});

module.exports = { authLimiter };
