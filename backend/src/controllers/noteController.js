"use strict";

const Note = require("../models/Note");

// ── Pagination constants ──────────────────────────────────────────────────────
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50; // hard cap — prevents a single request returning thousands of docs

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * parsePagination(query) → { page, limit, skip }
 * Sanitises and clamps page/limit query params from the request.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/notes
 *
 * Security:
 *  - Only allowed fields (title, content) are destructured — `user` is never
 *    read from req.body, blocking mass-assignment of ownership.
 *  - `user` is always set from req.user._id (established by the JWT in protect).
 */
const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const note = await Note.create({
      title,
      content,
      user: req.user._id, // server-side only — never trust the client for this
    });

    return res.status(201).json({
      success: true,
      message: "Note created",
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notes
 *
 * Returns paginated notes for the authenticated user only.
 * Query params: ?page=1&limit=10
 *
 * Security:
 *  - Scoped exclusively to req.user._id — cross-user reads are structurally
 *    impossible; there is no parameter that can override this.
 *  - Pagination prevents memory exhaustion from unbounded result sets.
 *  - Total count and notes are fetched in parallel to minimise latency.
 */
const getNotes = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const userFilter = { user: req.user._id };

    // Parallel queries: data + count in one round-trip
    const [notes, total] = await Promise.all([
      Note.find(userFilter)
        .sort({ updatedAt: -1 }) // most recently updated first
        .skip(skip)
        .limit(limit),
      Note.countDocuments(userFilter),
    ]);

    return res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notes/:id
 *
 * Partially or fully updates a note.
 *
 * Security (ownership validation — the core pattern):
 *  - findOneAndUpdate({ _id: req.params.id, user: req.user._id }) combines the
 *    lookup and ownership check into a single atomic DB operation.
 *  - If the note does not exist, OR exists but belongs to another user, MongoDB
 *    returns null. Both cases respond with 404 — this deliberately prevents an
 *    attacker from inferring resource existence via status-code enumeration (IDOR).
 *  - Only whitelisted fields (title, content) are placed in the update object.
 *    An attacker cannot inject { user: "victim_id" } through req.body.
 *  - runValidators: true re-applies the schema constraints on every update.
 */
const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // Build update object from only the fields that were actually provided.
    // This supports partial updates (e.g. updating only title) without wiping content.
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    // Validation middleware ensures at least one field is present,
    // but defend-in-depth catches it here too.
    if (Object.keys(updates).length === 0) {
      return res.status(422).json({
        success: false,
        message:
          "No updatable fields provided. Send at least title or content.",
      });
    }

    // Single atomic query: ownership check + update fused together.
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // ownership enforced here
      updates,
      { returnDocument: "after", runValidators: true }, // return the updated document
    );

    // 404 for both "doesn't exist" and "belongs to someone else" — no leakage.
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated",
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notes/:id
 *
 * Security:
 *  - Same atomic ownership pattern as updateNote.
 *  - findOneAndDelete({ _id, user }) — if either condition fails, null is
 *    returned and the document is NOT deleted. 404 in both cases.
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // ownership enforced here
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createNote, getNotes, updateNote, deleteNote };
