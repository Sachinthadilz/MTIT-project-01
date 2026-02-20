"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

// Load environment variables before any module that reads process.env.
dotenv.config();

// ── Startup guard — fail fast if critical env vars are missing ────────────────
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `[FATAL] Missing required environment variables: ${missingEnv.join(", ")}\n` +
      "        Ensure your .env file is present and complete.",
  );
  process.exit(1);
}

const connectDB = require("./config/db");
const corsOptions = require("./config/cors");
const { authLimiter } = require("./config/rateLimiter");
const errorHandler = require("./middlewares/errorHandler");
const { protect } = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
// helmet sets secure HTTP headers: X-Content-Type-Options, X-Frame-Options,
// HSTS, Content-Security-Policy, and more.
app.use(helmet());
app.use(cors(corsOptions));

// ── Body parsing ──────────────────────────────────────────────────────────────
// 10 kb cap prevents large-payload denial-of-service.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

// ── API routes ────────────────────────────────────────────────────────────────
// authLimiter is scoped to auth endpoints only — does not throttle other routes.
app.use("/api/auth", authLimiter, authRoutes);

// protect is applied at mount level so every notes sub-route requires a valid
// JWT automatically — no individual route can be exposed by omission.
app.use("/api/notes", protect, noteRoutes);

// ── 404 handler (must come after all routes) ──────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `[SERVER] ${process.env.NODE_ENV || "development"} | port ${PORT}`,
  );
});
