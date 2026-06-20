import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Drawer from './Drawer'
import Modal from './Modal'
import Pagination from './Pagination'

describe('task3 common containers', () => {
  it('renders modal content only when open and closes from backdrop', () => {
    const handleClose = vi.fn()
    const { rerender } = render(
      <Modal open={false} title="请先登录" onClose={handleClose}>
        <div>登录内容</div>
      </Modal>,
    )

    expect(screen.queryByRole('dialog', { name: '请先登录' })).not.toBeInTheDocument()

    rerender(
      <Modal open title="请先登录" onClose={handleClose}>
        <div>登录内容</div>
      </Modal>,
    )

    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog', { name: '请先登录' })).toHaveTextContent('登录内容')
  })

  it('renders drawer actions and closes from explicit button', () => {
    const handleClose = vi.fn()

    render(
      <Drawer open title="写评价" onClose={handleClose}>
        <button type="button">提交评价</button>
      </Drawer>,
    )

    fireEvent.click(screen.getByRole('button', { name: '关闭抽屉' }))
    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog', { name: '写评价' })).toHaveTextContent('提交评价')
  })

  it('renders pagination around current page and fires page changes', () => {
    const handlePageChange = vi.fn()

    render(<Pagination currentPage={4} pageSize={10} totalItems={95} onPageChange={handlePageChange} />)

    fireEvent.click(screen.getByRole('button', { name: '上一页' }))
    fireEvent.click(screen.getByRole('button', { name: '下一页' }))
    fireEvent.click(screen.getByRole('button', { name: '第 5 页' }))

    expect(handlePageChange).toHaveBeenNthCalledWith(1, 3)
    expect(handlePageChange).toHaveBeenNthCalledWith(2, 5)
    expect(handlePageChange).toHaveBeenNthCalledWith(3, 5)
    expect(screen.getByRole('button', { name: '第 4 页' })).toHaveAttribute('aria-current', 'page')
  })
})
