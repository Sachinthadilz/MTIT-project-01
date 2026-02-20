"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const { protect } = require("./middlewares/authMiddleware");

// Load env variables before anything else
dotenv.config();

// ── Fix #4: Fail fast on missing critical secrets ─────────────────────────────
// The server must never start with undefined signing secrets.
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `[FATAL] Missing required environment variables: ${missingEnv.join(", ")}\n` +
      "        Ensure your .env file is present and complete.",
  );
  process.exit(1);
}

const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Fix #1: HTTP security headers via helmet ──────────────────────────────────
// Sets: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
//       Strict-Transport-Security (HSTS), Content-Security-Policy, and more.
app.use(helmet());

// ── Restrict CORS to a known set of origins ───────────────────────────────────
// ALLOWED_ORIGIN may be a single origin or a comma-separated list.
// Example: ALLOWED_ORIGIN=http://localhost:3000,https://app.example.com
//
// Each value is trimmed and normalised (trailing slashes stripped) so that
// minor formatting differences in the env file don't cause silent failures.
//
// Robustness rules applied here:
//  1. Parse into a Set so look-up is O(1) regardless of list length.
//  2. Use callback(null, false) — NOT callback(new Error(...)) — for rejections.
//     Passing an Error object routes the rejection through Express's error
//     handler and returns 500; passing `false` returns a correct 403 with
//     no Access-Control-Allow-Origin header (the cors package spec).
//  3. Server-side console.warn on rejection for observability without crashing.
//  4. !origin allows same-origin and server-to-server requests (curl, Postman,
//     health checks) that carry no Origin header.
const rawOrigins = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
const allowedOrigins = new Set(
  rawOrigins
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, "")) // trim whitespace + trailing slashes
    .filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin header → same-origin or non-browser request → allow
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        // BUG FIX: callback(null, false) → 403, NOT callback(new Error()) → 500
        console.warn(`[CORS] Rejected origin: ${origin}`);
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── Fix #5: Body size limit — prevents large-payload DoS ─────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Fix #3: Rate limiting on authentication routes ────────────────────────────
// Caps each IP at 10 auth attempts per 15 minutes (adjustable via env).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max attempts per window per IP
  standardHeaders: true, // return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again in 15 minutes.",
  },
  skipSuccessfulRequests: false, // count all requests, not just failures
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Auth limiter scoped only to authentication endpoints — does not throttle
// other parts of the API.
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

// Notes routes — protect applied at mount so every sub-route is
// automatically authenticated. No individual route can be exposed accidentally.
app.use("/api/notes", protect, require("./routes/noteRoutes"));

// ── 404 handler (must come after all routes) ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `[SERVER] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
