import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/** Page numbers with ellipsis, e.g. 1 … 4 5 [6] 7 8 … 20 */
const buildPages = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) {
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
  }
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
};

const navBtn =
  "inline-flex size-10 items-center justify-center rounded-xl border border-white/70 bg-white/50 text-slate-700 backdrop-blur-xl transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10";

/**
 * Responsive pagination bar.
 *  - Phones: "Prev · Page 2 of 8 · Next" with big touch targets.
 *  - Tablets/desktops: numbered buttons + "Showing 11–20 of 84" + page-size picker.
 *
 * Props come straight from usePagination().
 */
export default function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  label = "items",
}) {
  if (total === 0) return null;

  const pages = buildPages(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
        <p>
          Showing{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {from}–{to}
          </span>{" "}
          of <span className="font-bold text-slate-900 dark:text-white">{total}</span>{" "}
          {label}
        </p>
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">Per page</span>
            <select
              aria-label="Items per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(e.target.value)}
              className="input !w-auto !py-1.5 !pr-8"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="sm:hidden">per page</span>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <>
          {/* Mobile: compact */}
          <div className="flex w-full items-center justify-between gap-3 sm:hidden">
            <button
              type="button"
              className={`${navBtn} !w-auto gap-1 px-4 text-sm font-bold`}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <FiChevronLeft /> Prev
            </button>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className={`${navBtn} !w-auto gap-1 px-4 text-sm font-bold`}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next <FiChevronRight />
            </button>
          </div>

          {/* Tablet / desktop: numbered */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              aria-label="Previous page"
              className={navBtn}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <FiChevronLeft />
            </button>
            {pages.map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} className="px-1 text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  onClick={() => onPageChange(p)}
                  className={`size-10 rounded-xl text-sm font-bold transition ${
                    p === page
                      ? "bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "border border-white/70 bg-white/50 text-slate-700 backdrop-blur-xl hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              className={navBtn}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
