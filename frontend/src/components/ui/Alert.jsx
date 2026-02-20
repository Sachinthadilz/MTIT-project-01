/**
 * Alert — dismissible success or error banner.
 *
 * Improvements:
 *  - role="status" / aria-live="polite" for success (non-urgent announcement)
 *  - role="alert"  / aria-live="assertive" for error (immediate announcement)
 *  - aria-atomic="true" so screen readers read the whole message on update
 *  - fade-in animation so the banner draws attention without being jarring
 *
 * Props:
 *  type      — "error" | "success"
 *  message   — string to display
 *  onDismiss — optional callback when the × is clicked
 */
export default function Alert({ type = "error", message, onDismiss }) {
  if (!message) return null;

  const isSuccess = type === "success";

  const styles = isSuccess
    ? "bg-green-50 border-green-500 text-green-800"
    : "bg-red-50 border-red-500 text-red-800";

  const iconPath = isSuccess
    ? "M5 13l4 4L19 7" // checkmark
    : "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"; // error triangle

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      aria-atomic="true"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-fade-in ${styles}`}
    >
      {/* Icon */}
      <svg
        className="mt-0.5 h-5 w-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>

      {/* Message */}
      <span className="flex-1">{message}</span>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto shrink-0 rounded opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Dismiss alert"
          type="button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
