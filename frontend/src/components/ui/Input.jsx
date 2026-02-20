/**
 * Input — controlled, accessible form field.
 *
 * Props mirror standard <input> attributes plus:
 *  label   — visible label text
 *  error   — validation error string (shown beneath the field in red)
 *  hint    — helper text shown beneath the field when no error is present
 */
export default function Input({
  label,
  id,
  error,
  hint,
  className = "",
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        aria-invalid={error ? "true" : undefined}
        className={`
          block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900
          placeholder:text-gray-400 outline-none transition
          focus:ring-2 focus:ring-offset-0
          ${
            error
              ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200"
          }
          disabled:cursor-not-allowed disabled:opacity-50
        `}
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
