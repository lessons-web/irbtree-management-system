import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../features/auth/AuthContext'
import { AuthContext, type AuthState } from '../../features/auth/state'
import CompletedCourseDrawer, { type CompletedCourseItem } from './CompletedCourseDrawer'
import FloatingConsultButton from './FloatingConsultButton'
import LoginModal from './LoginModal'
import ReviewDrawer from './ReviewDrawer'
import UserFooter from './UserFooter'
import UserHeader from './UserHeader'

function renderWithAuth(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  )
}

const loggedInAuthState: AuthState = {
  user: { id: 'u_logged_in', email: 'demo@irbtree.com', roles: ['student'] },
  loginAs: vi.fn(),
  logout: vi.fn(),
}

function renderLoggedIn(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={loggedInAuthState}>{ui}</AuthContext.Provider>
    </MemoryRouter>,
  )
}

function ControlledCompletedDrawerHarness() {
  const [courses, setCourses] = useState<CompletedCourseItem[]>([])

  return (
    <>
      <div data-testid="completed-count">{String(courses.length)}</div>
      <CompletedCourseDrawer open value={courses} onChange={setCourses} onClose={vi.fn()} />
    </>
  )
}

describe('task3 user shells', () => {
  it('renders header navigation and footer links', () => {
    renderWithAuth(
      <>
        <UserHeader onOpenLogin={vi.fn()} />
        <UserFooter />
      </>,
    )

    expect(screen.getByRole('link', { name: 'IRBTree Forum' })).toBeInTheDocument()
    expect(document.querySelector('img[src="/favicon.svg"]')).not.toBeNull()
    expect(screen.getByRole('link', { name: '首页' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '课程列表' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '选课推荐' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '个人中心' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '联系支持' })).toBeInTheDocument()
  })

  it('falls back to the courses link instead of opening a placeholder review flow from header', () => {
    renderLoggedIn(<UserHeader onOpenLogin={vi.fn()} onOpenCompleted={vi.fn()} />)

    expect(screen.queryByRole('link', { name: '写评价' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '写评价' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '已修课程' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '我的' })).not.toBeInTheDocument()
    expect(screen.getByText('消息中心')).toBeInTheDocument()
    expect(screen.getByText('Alex Student')).toBeInTheDocument()
    expect(screen.getByText('学生认证')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /alex student/i })).not.toHaveClass('border')
  })

  it('opens the logged-in user dropdown with admin, profile and logout entries', () => {
    renderLoggedIn(<UserHeader onOpenLogin={vi.fn()} onOpenCompleted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /alex student/i }))

    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('link', { name: '进入 Admin 系统' })).toHaveAttribute('href', '/admin')
    expect(within(menu).getByRole('link', { name: '个人中心' })).toHaveAttribute('href', '/profile')
    expect(within(menu).getByRole('menuitem', { name: '退出登录' })).toBeInTheDocument()
  })

  it('submits mock login and closes the modal', () => {
    const handleClose = vi.fn()

    renderWithAuth(<LoginModal open onClose={handleClose} />)

    fireEvent.click(screen.getByRole('button', { name: '立即登录' }))

    expect(handleClose).toHaveBeenCalled()
    expect(screen.getByText(/当前用户：Alex Student · alex\.student@irbtree\.com/i)).toBeInTheDocument()
  })

  it('submits review payload from the drawer', () => {
    const handleSubmit = vi.fn()
    const { rerender } = render(
      <MemoryRouter>
        <ReviewDrawer open courseName="COMP9021 Principles of Programming" onClose={vi.fn()} onSubmit={handleSubmit} />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('评论内容'), { target: { value: '课程内容很扎实。' } })
    fireEvent.click(screen.getByRole('button', { name: '提交评价' }))

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '课程内容很扎实。',
        courseName: 'COMP9021 Principles of Programming',
      }),
    )

    rerender(
      <MemoryRouter>
        <ReviewDrawer open={false} courseName="COMP9021 Principles of Programming" onClose={vi.fn()} onSubmit={handleSubmit} />
      </MemoryRouter>,
    )

    rerender(
      <MemoryRouter>
        <ReviewDrawer open courseName="COMP9311 Database Systems" onClose={vi.fn()} onSubmit={handleSubmit} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('dialog', { name: '写评价' })).toHaveTextContent('COMP9311 Database Systems')
    expect(screen.getByLabelText('评论内容')).toHaveValue('')
  })

  it('adds a completed course through the controlled drawer interface', () => {
    render(<ControlledCompletedDrawerHarness />)

    fireEvent.change(screen.getByLabelText('搜索课程'), { target: { value: 'COMP9021' } })
    fireEvent.click(screen.getByRole('button', { name: /添加 COMP9021/i }))

    expect(screen.getByTestId('completed-count')).toHaveTextContent('1')
    expect(screen.getByText(/COMP9021/i)).toBeInTheDocument()
  })

  it('toggles floating consult panel', () => {
    render(<FloatingConsultButton />)

    fireEvent.click(screen.getByRole('button', { name: '报名咨询' }))
    expect(screen.getByText('联系教务完成报名')).toBeInTheDocument()
    expect(screen.getByText('扫码添加教务')).toBeInTheDocument()
    expect(screen.getByText('二维码为示意图，请复制微信号搜索添加')).toBeInTheDocument()
  })
})
