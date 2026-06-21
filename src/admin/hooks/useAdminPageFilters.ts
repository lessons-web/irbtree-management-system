import { useEffect, useMemo, useState, type DependencyList } from 'react'

type UseAdminPageFiltersOptions<T> = {
  rows: T[]
  pageSize: number
  predicate: (row: T) => boolean
  resetDeps?: DependencyList
}

export function useAdminPageFilters<T>({
  rows,
  pageSize,
  predicate,
  resetDeps = [],
}: UseAdminPageFiltersOptions<T>) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, resetDeps)

  const filteredRows = useMemo(() => rows.filter((row) => predicate(row)), [predicate, rows])
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, pageSize, safePage])

  return {
    page,
    setPage,
    safePage,
    filteredRows,
    pagedRows,
  }
}
