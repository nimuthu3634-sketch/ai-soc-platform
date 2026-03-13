type PaginationControlsProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
};

function buildVisiblePages(page: number, totalPages: number) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function PaginationControls({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  itemLabel = 'logs',
}: PaginationControlsProps) {
  const visiblePages = buildVisiblePages(page, totalPages);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-4 border-t border-white/5 pt-5 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm text-slate-400">
        Showing {startItem}-{endItem} of {total} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="aegis-button-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          Previous
        </button>

        {visiblePages.map((pageNumber) => (
          <button
            className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
              pageNumber === page
                ? 'bg-aegis-500 text-slate-950'
                : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:border-aegis-500/30 hover:text-white'
            }`}
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            type="button"
          >
            {pageNumber}
          </button>
        ))}

        <button
          className="aegis-button-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
