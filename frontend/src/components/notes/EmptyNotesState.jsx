/**
 * EmptyNotesState
 *
 * Shown when the user has no notes yet or a search yields nothing.
 *
 * Props:
 *  message — optional override text
 */
export default function EmptyNotesState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      {/* Illustration */}
      <svg
        className="mb-5 h-20 w-20 text-gray-200"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <rect
          x="10"
          y="8"
          width="44"
          height="52"
          rx="4"
          strokeLinecap="round"
        />
        <line x1="20" y1="22" x2="44" y2="22" strokeLinecap="round" />
        <line x1="20" y1="31" x2="44" y2="31" strokeLinecap="round" />
        <line x1="20" y1="40" x2="34" y2="40" strokeLinecap="round" />
      </svg>

      <p className="text-sm font-medium text-gray-500">
        {message ?? "No notes yet"}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Click the <strong className="text-gray-500">New note</strong> button
        above to create your first one.
      </p>
    </div>
  );
}
