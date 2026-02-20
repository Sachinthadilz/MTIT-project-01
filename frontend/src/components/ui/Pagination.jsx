/**
 * Pagination
 *
 * Renders Previous / page-number buttons / Next.
 *
 * Props:
 *  page    — current page (1-based)
 *  pages   — total number of pages
 *  onPage  — (newPage: number) => void
 */
export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;

  // Build the page-number array with ellipsis: always show first, last, and ±1 from current
  const range = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      range.push(i);
    } else if (range[range.length - 1] !== "…") {
      range.push("…");
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 pt-4"
    >
      {/* Previous */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-gray-500 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Page numbers */}
      {range.map((item, idx) =>
        item === "…" ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPage(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-400
              ${
                item === page
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {item}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-gray-500 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </nav>
  );
}
