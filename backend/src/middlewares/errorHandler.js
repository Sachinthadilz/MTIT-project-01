"use strict";

/**
 * Global error-handling middleware.
 *
 * Must be registered LAST in the Express middleware chain (after all routes).
 * Express identifies error handlers by their 4-argument signature: (err, req, res, next).
 *
 * Normalises common Mongoose and JWT errors into structured JSON responses
 * and ensures stack traces are never leaked in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose: duplicate key (e.g. unique email) ──────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const pretty = field.charAt(0).toUpperCase() + field.slice(1);
    message = `${pretty} is already in use`;
  }

  // ── Mongoose: schema validation errors ───────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── Mongoose: invalid ObjectId (e.g. GET /users/not-an-id) ──────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // ── JWT errors ───────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // ── Build response — stack trace only in development ────────────────────
  const body = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Log server errors (5xx) for operational visibility
  if (statusCode >= 500) {
    console.error("[ERROR]", new Date().toISOString(), err);
  }

  res.status(statusCode).json(body);
};

module.exports = errorHandler;
