/**
 * Alert — dismissible success or error banner.
 *
 * Props:
 *  type      — "error" | "success"
 *  message   — string to display
 *  onDismiss — optional callback when the × is clicked
 */
export default function Alert({ type = "error", message, onDismiss }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "bg-green-50 border-green-400 text-green-800"
      : "bg-red-50 border-red-400 text-red-800";

  const iconPath =
    type === "success"
      ? "M5 13l4 4L19 7" // checkmark
      : "M6 18L18 6M6 6l12 12"; // ✕

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {/* Icon */}
      <svg
        className="mt-0.5 h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
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
          className="ml-auto shrink-0 opacity-60 hover:opacity-100 focus:outline-none"
          aria-label="Dismiss"
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
