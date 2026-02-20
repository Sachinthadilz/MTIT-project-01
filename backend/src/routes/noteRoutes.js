"use strict";

const express = require("express");
const router = express.Router();

const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const {
  validateCreateNote,
  validateUpdateNote,
  validateObjectId,
} = require("../middlewares/validate");

// All routes in this file are protected — the `protect` middleware
// is applied at the mount point in app.js, covering every route below.

// POST   /api/notes        — create a new note
router.post("/", validateCreateNote, createNote);

// GET    /api/notes        — list own notes (paginated)
router.get("/", getNotes);

// PUT    /api/notes/:id    — update own note
router.put("/:id", validateObjectId, validateUpdateNote, updateNote);

// DELETE /api/notes/:id   — delete own note
router.delete("/:id", validateObjectId, deleteNote);

module.exports = router;
