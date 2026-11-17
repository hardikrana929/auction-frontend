import { useEffect, useMemo, useState } from "react";

/**
 * Client-side pagination for an already-loaded list.
 *
 * - `resetKey` (any value / array) sends the user back to page 1 when filters
 *   or the selected auction change.
 * - The page is clamped, so deleting the last item of the last page moves you
 *   back instead of showing an empty page.
 */
export default function usePagination(items, { initialPageSize = 10, resetKey } = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const key = Array.isArray(resetKey) ? resetKey.join("|") : resetKey;
  useEffect(() => {
    setPage(1);
  }, [key]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const changePageSize = (size) => {
    setPageSize(Number(size));
    setPage(1);
  };

  return {
    page: safePage,
    pageSize,
    totalPages,
    total,
    pageItems,
    setPage,
    setPageSize: changePageSize,
    from: total === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, total),
  };
}
