"use strict";

const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Protected route — requires valid Bearer token
router.get("/me", protect, getMe);

module.exports = router;
