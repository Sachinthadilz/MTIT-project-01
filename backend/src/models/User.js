"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12; // High work factor — safe for production

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // enforces uniqueness at DB level (creates index)
      lowercase: true, // normalise before storing
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries unless explicitly requested
    },
    // Tracks the last time the password was changed so protect middleware
    // can reject tokens that were issued before a password reset.
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt managed automatically
    toJSON: {
      // scrub internal fields from any JSON representation
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ── Pre-save hook: hash password only when it has been modified ──────────────
// Mongoose 7+ async pre-hooks resolve by returning — do NOT call next().
// Mongoose treats the resolved promise as the signal to continue the chain.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);

  // Record the moment of password change so protect middleware can
  // invalidate tokens issued before this point. Skip on initial creation
  // (isNew) because createdAt already covers that window.
  if (!this.isNew) {
    // Subtract 1 second to account for potential clock skew between
    // DB write and token generation.
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

// ── Instance method: timing-safe comparison via bcrypt ───────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: check whether a JWT was issued before a password change ──
// iat is the 'issued at' Unix timestamp from the JWT payload.
userSchema.methods.changedPasswordAfter = function (iatSeconds) {
  if (this.passwordChangedAt) {
    const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return iatSeconds < changedAt; // token is older than the password change
  }
  return false; // password never changed → token is still valid
};

module.exports = mongoose.model("User", userSchema);
