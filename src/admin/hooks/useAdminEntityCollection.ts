import { useCallback, useMemo, useState } from 'react'

type UseAdminEntityCollectionOptions<T> = {
  getId?: (entity: T) => string
}

const defaultGetId = <T extends { id: string }>(entity: T) => entity.id

export function useAdminEntityCollection<T extends { id: string }>(
  initialRows: T[],
  options?: UseAdminEntityCollectionOptions<T>,
) {
  const getId = options?.getId ?? defaultGetId<T>
  const [rows, setRows] = useState(initialRows)
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null)

  const activeRow = useMemo(
    () => rows.find((row) => getId(row) === activeEntityId) ?? null,
    [activeEntityId, getId, rows],
  )

  const setActiveRow = useCallback(
    (row: T | null) => {
      setActiveEntityId(row ? getId(row) : null)
    },
    [getId],
  )

  const api = useMemo(
    () => ({
      createEntity(entity: T) {
        setRows((current) => [entity, ...current])
      },
      updateEntity(entityId: string, updater: (current: T) => T) {
        setRows((current) => current.map((row) => (getId(row) === entityId ? updater(row) : row)))
      },
      removeEntity(entityId: string) {
        setRows((current) => current.filter((row) => getId(row) !== entityId))
        setActiveEntityId((current) => (current === entityId ? null : current))
      },
      replaceRows(nextRows: T[]) {
        setRows(nextRows)
        setActiveEntityId((current) => (nextRows.some((row) => getId(row) === current) ? current : null))
      },
    }),
    [getId],
  )

  return {
    rows,
    setRows,
    activeRow,
    setActiveRow,
    ...api,
  }
}
