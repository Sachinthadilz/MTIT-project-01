import { useCallback, useRef, useState } from "react";

/**
 * useFormFields — shared form state for auth pages.
 *
 * Manages: field values, per-field errors, touched tracking, and
 * the double-submit guard ref. Extracted to avoid duplicating ~35 lines
 * of identical boilerplate in LoginPage and RegisterPage.
 *
 * @param {Object}    initialFields — e.g. { email: "", password: "" }
 * @param {Function}  [onAnyChange] — called on every keystroke
 *                                    (used to clear the global auth error)
 */
export function useFormFields(initialFields, onAnyChange) {
  const [fields, setFields] = useState(initialFields);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  /** Prevents duplicate API calls from rapid double-clicks. */
  const submittingRef = useRef(false);

  /** Synced onChange handler — updates value, marks field touched, clears its error. */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFields((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      // Only trigger a set when the error actually exists (avoids pointless re-renders)
      setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
      onAnyChange?.();
    },
    [onAnyChange],
  );

  /** Focuses the first DOM element whose id matches the first error key. */
  const focusFirstError = useCallback((errors) => {
    document.getElementById(Object.keys(errors)[0])?.focus();
  }, []);

  /**
   * Stamps a set of errors into state and marks every errored field as touched
   * so the valid/invalid indicators display correctly.
   */
  const markErrors = useCallback((errors) => {
    setFieldErrors(errors);
    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.keys(errors).map((k) => [k, true])),
    }));
  }, []);

  /**
   * Returns true when a field has been touched, is non-empty, and has no error.
   * Used to show the green valid checkmark on the Input component.
   */
  const isValid = useCallback(
    (name) => !!(touched[name] && fields[name] && !fieldErrors[name]),
    [touched, fields, fieldErrors],
  );

  return {
    fields,
    setFields,
    fieldErrors,
    setFieldErrors,
    touched,
    submittingRef,
    handleChange,
    focusFirstError,
    markErrors,
    isValid,
  };
}
