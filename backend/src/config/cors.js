"use strict";

/**
 * CORS configuration.
 *
 * ALLOWED_ORIGIN may be a single origin or a comma-separated list.
 * Example: ALLOWED_ORIGIN=http://localhost:3000,https://app.example.com
 *
 * Each entry is trimmed and has trailing slashes stripped so minor
 * formatting differences in .env never cause silent failures.
 *
 * Rejection uses callback(null, false) — not callback(new Error()) — so
 * the cors package returns a 403 without an ACAO header, which is correct
 * per the CORS spec. Passing an Error would route through the global error
 * handler and return a 500 with a potential stack trace.
 */

const rawOrigins = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

const allowedOrigins = new Set(
  rawOrigins
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),
);

const corsOptions = {
  origin: (origin, callback) => {
    // No Origin header → same-origin or non-browser request (curl, Postman) → allow.
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[CORS] Rejected origin: ${origin}`);
      }
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

module.exports = corsOptions;
