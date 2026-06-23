import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../../features/auth/AuthContext'
import { useRequireAuthAction } from '../../features/auth/useRequireAuthAction'
import { UserOverlayProvider } from './UserOverlayContext'
import { useUserOverlay } from './useUserOverlay'

function ProtectedActionProbe() {
  const requireAuth = useRequireAuthAction()
  const [count, setCount] = useState(0)

  return (
    <>
      <div data-testid="protected-count">{String(count)}</div>
      <button type="button" onClick={() => requireAuth(() => setCount((value) => value + 1))}>
        触发受保护动作
      </button>
    </>
  )
}

function ReviewFlowProbe() {
  const { openReview } = useUserOverlay()
  const [submittedContent, setSubmittedContent] = useState('')

  return (
    <>
      <div data-testid="review-content">{submittedContent}</div>
      <button
        type="button"
        onClick={() =>
          openReview({
            courseName: 'COMP9021 Principles of Programming',
            onSubmit: (payload) => setSubmittedContent(payload.content),
          })
        }
      >
        打开写评价
      </button>
    </>
  )
}

function CompletedFlowProbe() {
  const { completedCourses, openCompleted, setCompletedCourses } = useUserOverlay()
  const firstCourse = completedCourses[0]

  return (
    <>
      <div data-testid="completed-count">{String(completedCourses.length)}</div>
      <div data-testid="completed-first-id">{firstCourse?.universityCourseId ?? 'none'}</div>
      <div data-testid="completed-first-term">{firstCourse?.term ?? 'none'}</div>
      <button type="button" onClick={() => setCompletedCourses([])}>
        清空已修课程
      </button>
      <button type="button" onClick={openCompleted}>
        打开已修课程
      </button>
    </>
  )
}

function renderWithOverlay(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/courses']}>
      <AuthProvider>
        <UserOverlayProvider>{ui}</UserOverlayProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('UserOverlayProvider', () => {
  it('runs protected actions directly without opening a login modal', () => {
    renderWithOverlay(<ProtectedActionProbe />)

    fireEvent.click(screen.getByRole('button', { name: '触发受保护动作' }))

    expect(screen.queryByRole('dialog', { name: '请先登录' })).not.toBeInTheDocument()
    expect(screen.getByTestId('protected-count')).toHaveTextContent('1')
  })

  it('opens the shared review drawer directly', () => {
    renderWithOverlay(<ReviewFlowProbe />)

    fireEvent.click(screen.getByRole('button', { name: '打开写评价' }))

    expect(screen.queryByRole('dialog', { name: '请先登录' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: '写评价' })).toHaveTextContent('COMP9021 Principles of Programming')

    fireEvent.change(screen.getByLabelText('评论内容'), { target: { value: '登录后直接进入公共写评价抽屉。' } })
    fireEvent.click(screen.getByRole('button', { name: '提交评价' }))

    expect(screen.getByTestId('review-content')).toHaveTextContent('登录后直接进入公共写评价抽屉。')
  })

  it('opens completed drawer directly and keeps shared completed state readable and writable', () => {
    renderWithOverlay(<CompletedFlowProbe />)

    expect(screen.getByTestId('completed-count')).toHaveTextContent('4')

    fireEvent.click(screen.getByRole('button', { name: '清空已修课程' }))
    expect(screen.getByTestId('completed-count')).toHaveTextContent('0')

    fireEvent.click(screen.getByRole('button', { name: '打开已修课程' }))
    expect(screen.queryByRole('dialog', { name: '请先登录' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: '我已修的课程' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('学期'), { target: { value: 'S1' } })
    fireEvent.change(screen.getByLabelText('搜索课程'), { target: { value: 'COMP2017' } })
    fireEvent.click(screen.getByRole('button', { name: /添加 COMP2017/i }))

    expect(screen.getByTestId('completed-count')).toHaveTextContent('1')
    expect(screen.getByTestId('completed-first-id')).toHaveTextContent('uc_2017')
    expect(screen.getByTestId('completed-first-term')).toHaveTextContent('S1')
    expect(screen.getByText('COMP2017')).toBeInTheDocument()
  })
})
