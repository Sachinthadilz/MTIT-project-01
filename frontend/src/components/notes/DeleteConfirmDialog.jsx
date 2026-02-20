import { useEffect, useRef } from "react";
import Spinner from "../ui/Spinner";

/**
 * DeleteConfirmDialog
 *
 * Small confirmation dialog before deleting a note.
 * Traps focus and closes on Escape.
 *
 * Props:
 *  note     — { _id, title } | null — note to be deleted
 *  onConfirm — async () => void
 *  onCancel  — () => void
 *  saving   — bool: in-flight delete
 */
export default function DeleteConfirmDialog({
  note,
  onConfirm,
  onCancel,
  saving,
}) {
  const cancelRef = useRef(null);

  // Focus "Cancel" (the safe option) as soon as the dialog opens
  useEffect(() => {
    if (note) setTimeout(() => cancelRef.current?.focus(), 0);
  }, [note]);

  // Escape closes without action
  useEffect(() => {
    if (!note) return;
    const fn = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [note, onCancel]);

  if (!note) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Panel */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
        {/* Icon */}
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2
          id="delete-dialog-title"
          className="mb-1 text-base font-semibold text-gray-900"
        >
          Delete note?
        </h2>
        <p id="delete-dialog-desc" className="mb-6 text-sm text-gray-500">
          <span className="font-medium text-gray-700">"{note.title}"</span> will
          be permanently deleted. This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            aria-busy={saving}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Spinner size="h-3.5 w-3.5" />
                Deleting…
              </>
            ) : (
              "Yes, delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
