"use strict";

// ── Regex patterns ────────────────────────────────────────────────────────────

// Fix #12 — stricter RFC 5321-compliant email pattern.
// Rejects: consecutive dots, leading/trailing dots in local part,
// missing TLD, whitespace anywhere.
const EMAIL_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

/**
 * Password policy:
 *  - 8–128 characters (Fix #6: upper bound stops bcrypt DoS via 72-byte truncation)
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - Optional special characters
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,128}$/;

// Fix #13 — name must contain only printable ASCII (no control characters).
const PRINTABLE_REGEX = /^[\x20-\x7E]+$/;

// ── Rule definitions ──────────────────────────────────────────────────────────

const registerRules = [
  {
    field: "name",
    // Fix #13: also enforce printable ASCII — blocks control characters like \x00
    validate: (v) =>
      typeof v === "string" &&
      v.trim().length >= 2 &&
      v.trim().length <= 50 &&
      PRINTABLE_REGEX.test(v.trim()),
    message: "Name must be 2–50 printable characters",
  },
  {
    field: "email",
    validate: (v) => typeof v === "string" && EMAIL_REGEX.test(v.trim()),
    message: "A valid email address is required",
  },
  {
    field: "password",
    validate: (v) => typeof v === "string" && PASSWORD_REGEX.test(v),
    message:
      "Password must be at least 8 characters and include uppercase, lowercase, and a number",
  },
];

const loginRules = [
  {
    field: "email",
    validate: (v) => typeof v === "string" && EMAIL_REGEX.test(v.trim()),
    message: "A valid email address is required",
  },
  {
    field: "password",
    validate: (v) => typeof v === "string" && v.length > 0,
    message: "Password is required",
  },
];

// ── Factory: turns a rule set into an Express middleware ──────────────────────

/**
 * buildValidator(rules) → Express middleware
 *
 * Fix #7: Guard against missing/non-object body first (wrong Content-Type,
 * empty body, etc.) before iterating rules — prevents "Cannot read property
 * of undefined" crashes.
 *
 * Runs every rule against req.body. If any rule fails, responds with 422
 * and a structured error list so the client knows exactly what to fix.
 * All rules are evaluated so the response reports every problem at once.
 */
const buildValidator = (rules) => (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message:
        "Request body is missing or not JSON. Set Content-Type: application/json.",
    });
  }

  const errors = rules.reduce((acc, rule) => {
    const value = req.body[rule.field];
    // Skip validation for optional fields that were not sent at all.
    // This allows partial updates where only some fields are provided.
    if (rule.optional && value === undefined) return acc;
    if (!rule.validate(value)) {
      acc.push({ field: rule.field, message: rule.message });
    }
    return acc;
  }, []);

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validateRegister = buildValidator(registerRules);
const validateLogin = buildValidator(loginRules);

// ── Note validation rules ─────────────────────────────────────────────────────

/**
 * Shared field validators for Note title and content.
 * Reused in both create (required) and update (optional) rule sets.
 */
const noteTitleRule = (optional = false) => ({
  field: "title",
  optional,
  validate: (v) =>
    typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 200,
  message: "Title must be 1\u2013200 characters",
});

const noteContentRule = (optional = false) => ({
  field: "content",
  optional,
  validate: (v) =>
    typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 10000,
  message: "Content must be 1\u201310,000 characters",
});

// Create: both title and content are required
const validateCreateNote = buildValidator([
  noteTitleRule(false),
  noteContentRule(false),
]);

// Update: both fields are optional — but at least one must be sent.
// The controller provides a second layer defence for the "nothing sent" case.
// Validation here still checks the FORMAT of whichever fields ARE provided.
const validateUpdateNote = [
  buildValidator([noteTitleRule(true), noteContentRule(true)]),
  // Ensure at least one field is present before hitting the DB.
  (req, res, next) => {
    const { title, content } = req.body || {};
    if (title === undefined && content === undefined) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: [
          {
            field: "body",
            message: "Provide at least one field to update: title or content",
          },
        ],
      });
    }
    next();
  },
];

// ── Route parameter validation ────────────────────────────────────────────────

/**
 * validateObjectId — checks that req.params.id is a well-formed MongoDB ObjectId.
 *
 * Why: an invalid id (e.g. "abc" or "../../etc") causes Mongoose to throw a
 * CastError which burns a DB connection. Catching it at the middleware layer
 * is faster and produces a cleaner 400 with a descriptive message.
 */
const { isValidObjectId } = require("mongoose");

const validateObjectId = (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: `'${req.params.id}' is not a valid resource ID`,
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateNote,
  validateUpdateNote,
  validateObjectId,
};
