/**
 * NoteSkeletons
 *
 * Renders N shimmer placeholder cards while the notes list is loading.
 * Keeps layout shift minimal by matching the NoteCard dimensions.
 *
 * Props:
 *  count — number of skeleton cards to render (default 6)
 */
export default function NoteSkeletons({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 animate-pulse"
        >
          {/* Title line */}
          <div className="mb-3 h-4 w-3/4 rounded-full bg-gray-200" />
          {/* Content lines */}
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-full bg-gray-100" />
            <div className="h-3 rounded-full bg-gray-100" />
            <div className="h-3 w-2/3 rounded-full bg-gray-100" />
          </div>
          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="h-3 w-20 rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </>
  );
}
