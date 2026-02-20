/**
 * Client-side validation rules.
 * Mirrors the backend validate.js rules exactly so error messages are consistent.
 */

/** RFC 5321-compliant email pattern */
export const EMAIL_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

/** Password: 8-128 chars, requires uppercase, lowercase, and digit */
export const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,128}$/;

/** Name must contain only printable ASCII — blocks control characters */
export const PRINTABLE_RE = /^[\x20-\x7E]+$/;

/**
 * Validates login form fields.
 * @param {{ email: string, password: string }} fields
 * @returns {Object} errors — empty object means valid
 */
export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  }
  return errors;
}

/**
 * Validates registration form fields.
 * @param {{ name: string, email: string, password: string, confirmPassword: string }} fields
 * @returns {Object} errors — empty object means valid
 */
export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};

  const trimmedName = name.trim();
  if (!trimmedName) {
    errors.name = "Name is required";
  } else if (trimmedName.length < 2 || trimmedName.length > 50) {
    errors.name = "Name must be 2-50 characters";
  } else if (!PRINTABLE_RE.test(trimmedName)) {
    errors.name = "Name contains invalid characters";
  }

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (!PASSWORD_RE.test(password)) {
    errors.password =
      "Password must be 8-128 characters with uppercase, lowercase, and a number";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
