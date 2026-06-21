type PaginationProps = {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function getVisiblePages(currentPage: number, totalPages: number, maxVisiblePages: number) {
  if (totalPages <= maxVisiblePages) return range(1, totalPages)

  const half = Math.floor(maxVisiblePages / 2)
  let start = Math.max(1, currentPage - half)
  const end = Math.min(totalPages, start + maxVisiblePages - 1)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }

  return range(start, end)
}

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages(currentPage, totalPages, maxVisiblePages)
  const showLeadingEllipsis = visiblePages[0] > 1
  const showTrailingEllipsis = visiblePages[visiblePages.length - 1] < totalPages

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="分页">
      <button
        type="button"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="上一页"
      >
        上一页
      </button>

      {visiblePages[0] > 1 ? (
        <PageButton page={1} currentPage={currentPage} onPageChange={onPageChange} />
      ) : null}
      {showLeadingEllipsis ? <span className="px-1 text-slate-400">...</span> : null}

      {visiblePages.map((page) => (
        <PageButton key={page} page={page} currentPage={currentPage} onPageChange={onPageChange} />
      ))}

      {showTrailingEllipsis ? <span className="px-1 text-slate-400">...</span> : null}
      {visiblePages[visiblePages.length - 1] < totalPages ? (
        <PageButton page={totalPages} currentPage={currentPage} onPageChange={onPageChange} />
      ) : null}

      <button
        type="button"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="下一页"
      >
        下一页
      </button>
    </nav>
  )
}

type PageButtonProps = {
  page: number
  currentPage: number
  onPageChange: (page: number) => void
}

function PageButton({ page, currentPage, onPageChange }: PageButtonProps) {
  const active = page === currentPage

  return (
    <button
      type="button"
      className={`min-w-10 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-600'
      }`}
      onClick={() => onPageChange(page)}
      aria-label={`第 ${page} 页`}
      aria-current={active ? 'page' : undefined}
    >
      {page}
    </button>
  )
}
