"use strict";

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content cannot be empty"],
      maxlength: [10000, "Content cannot exceed 10,000 characters"],
    },
    user: {
      // Hard reference to the owning user — set server-side only, never from input.
      // Indexed because every query on this collection filters by user first.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound index: speeds up paginated queries that sort on updatedAt
// while scoped to a specific user (the common read pattern for GET /notes).
noteSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
