import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAdminEntityCollection } from './useAdminEntityCollection'

type HarnessRow = {
  id: string
  title: string
  version: number
}

function EntityCollectionHarness() {
  const { activeRow, rows, replaceRows, setActiveRow, updateEntity } = useAdminEntityCollection<HarnessRow>([
    { id: 'message-1', title: '初始消息', version: 1 },
  ])

  return (
    <div>
      <div data-testid="row-version">{String(rows[0]?.version ?? 0)}</div>
      <div data-testid="active-version">{String(activeRow?.version ?? 0)}</div>
      <button
        type="button"
        onClick={() => setActiveRow({ id: 'message-1', title: '过期快照', version: 10 })}
      >
        设置旧快照
      </button>
      <button
        type="button"
        onClick={() =>
          updateEntity('message-1', (current) => ({
            ...current,
            version: current.version + 1,
          }))
        }
      >
        更新实体
      </button>
      <button type="button" onClick={() => replaceRows([{ id: 'message-2', title: '替换消息', version: 3 }])}>
        替换集合
      </button>
    </div>
  )
}

describe('useAdminEntityCollection', () => {
  it('keeps activeRow aligned with the collection row when updateEntity runs', () => {
    render(<EntityCollectionHarness />)

    fireEvent.click(screen.getByRole('button', { name: '设置旧快照' }))
    expect(screen.getByTestId('active-version')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: '更新实体' }))

    expect(screen.getByTestId('row-version')).toHaveTextContent('2')
    expect(screen.getByTestId('active-version')).toHaveTextContent('2')
  })

  it('clears activeRow when replaceRows removes the active entity', () => {
    render(<EntityCollectionHarness />)

    fireEvent.click(screen.getByRole('button', { name: '设置旧快照' }))
    expect(screen.getByTestId('active-version')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: '替换集合' }))

    expect(screen.getByTestId('row-version')).toHaveTextContent('3')
    expect(screen.getByTestId('active-version')).toHaveTextContent('0')
  })
})
