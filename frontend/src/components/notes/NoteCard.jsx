/**
 * NoteCard
 *
 * Displays a single note in a card layout.
 * Surfaces Edit and Delete action buttons.
 *
 * Props:
 *  note      — { _id, title, content, createdAt, updatedAt }
 *  onEdit    — called with the note object when Edit is clicked
 *  onDelete  — called with the note object when Delete is clicked
 *  disabled  — grays out actions while a save is in-flight
 */
export default function NoteCard({ note, onEdit, onDelete, disabled }) {
  const date = new Date(note.updatedAt ?? note.createdAt);
  const formatted = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Truncate long content for the card preview (full text in edit modal)
  const preview =
    note.content.length > 180
      ? note.content.slice(0, 180).trimEnd() + "…"
      : note.content;

  return (
    <article
      className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-indigo-200 focus-within:ring-2 focus-within:ring-indigo-400"
      aria-label={`Note: ${note.title}`}
    >
      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 leading-snug">
        {note.title}
      </h3>

      {/* Content preview */}
      <p className="flex-1 text-xs leading-relaxed text-gray-500 whitespace-pre-wrap break-words">
        {preview}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <time dateTime={date.toISOString()} className="text-xs text-gray-400">
          {formatted}
        </time>

        {/* Action buttons — visible on hover/focus for cleaner card layout */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            onClick={() => onEdit(note)}
            disabled={disabled}
            aria-label={`Edit note: ${note.title}`}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:pointer-events-none disabled:opacity-40"
          >
            {/* Pencil icon */}
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(note)}
            disabled={disabled}
            aria-label={`Delete note: ${note.title}`}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:pointer-events-none disabled:opacity-40"
          >
            {/* Trash icon */}
            <svg
              className="h-4 w-4"
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
          </button>
        </div>
      </div>
    </article>
  );
}
