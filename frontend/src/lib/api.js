/**
 * Utility helpers for working with Axios API responses.
 */

/**
 * Extracts a user-facing error message from an Axios error.
 * Falls back to the provided default when the server returns no message.
 *
 * @param {unknown} err      — the caught error (Axios error or other)
 * @param {string}  fallback — message to return if no server message is present
 * @returns {string}
 */
export function extractApiError(
  err,
  fallback = "Something went wrong. Please try again.",
) {
  return err?.response?.data?.message || fallback;
}

/**
 * Extracts per-field validation errors from a server error response.
 * Returns an empty array when the server returned no field-level errors.
 *
 * @param {unknown} err
 * @returns {{ field: string, message: string }[]}
 */
export function extractFieldErrors(err) {
  return err?.response?.data?.errors ?? [];
}
