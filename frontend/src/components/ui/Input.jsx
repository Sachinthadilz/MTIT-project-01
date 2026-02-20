import { useState } from "react";

/**
 * Input — controlled, accessible form field.
 *
 * Improvements over v1:
 *  - Built-in password-visibility toggle (rendered when type="password")
 *  - "Valid" state — green border + checkmark when the field is dirty and error-free
 *  - aria-required attribute wired to the required prop
 *  - aria-describedby chains both hint and error IDs when both exist
 *  - Focus ring colour is now consistent with valid/error/default states
 *
 * Props mirror standard <input> attributes plus:
 *  label   — visible label text
 *  error   — validation error string (shown beneath the field in red)
 *  hint    — helper text shown beneath the field when no error is present
 *  valid   — boolean: mark field as explicitly valid (green check)
 */
export default function Input({
  label,
  id,
  error,
  hint,
  valid = false,
  className = "",
  type = "text",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  // Build aria-describedby — may reference hint AND/OR error
  const describedBy =
    [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  // Border / ring colour logic
  const fieldState = error
    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
    : valid
      ? "border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200"
      : "border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="flex items-center gap-1 text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && (
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          )}
          {valid && !error && (
            <svg
              className="ml-auto h-4 w-4 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8.5 12.086l6.79-6.79a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={error ? "true" : "false"}
          aria-required={props.required ? "true" : undefined}
          aria-describedby={describedBy}
          className={`
            block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900
            placeholder:text-gray-400 outline-none transition
            focus:ring-2 focus:ring-offset-0
            ${fieldState}
            ${isPassword ? "pr-10" : ""}
            disabled:cursor-not-allowed disabled:opacity-50
          `}
          {...props}
        />

        {/* Password visibility toggle — only for type="password" inputs */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              // Eye-off icon
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.294.577-2.51 1.56-3.538M6.343 6.343A9.956 9.956 0 0112 5c5 0 9 4 9 7 0 1.02-.31 2-.857 2.857M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                />
              </svg>
            ) : (
              // Eye icon
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Hint — always visible (before error takes over) */}
      {hint && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}

      {/* Inline error — role="alert" so screen readers announce it immediately */}
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-1 text-xs text-red-600"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
