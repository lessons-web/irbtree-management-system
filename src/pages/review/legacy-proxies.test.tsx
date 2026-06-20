import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { UserOverlayProvider } from '../../components/user/UserOverlayContext'
import { AuthContext, type AuthState } from '../../features/auth/state'
import { ReviewProvider } from '../../features/review/reviewProvider'
import ReviewDrawer from './components/ReviewDrawer'
import ReviewDetailPage from './ReviewDetailPage'

const authValue: AuthState = {
  user: {
    id: 'u_mock',
    email: 'student@uni.edu.au',
    roles: ['student'],
  },
  loginAs: () => undefined,
  logout: () => undefined,
}

function renderWithProviders(ui: ReactNode, initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthContext.Provider value={authValue}>
        <ReviewProvider>
          <UserOverlayProvider>{ui}</UserOverlayProvider>
        </ReviewProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('review legacy proxies', () => {
  it('keeps legacy ReviewDetailPage aligned with the new course detail implementation', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/review/:code" element={<ReviewDetailPage />} />
      </Routes>,
      '/review/COMP9021',
    )

    expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
    expect(screen.getByText('关联学习课')).toBeInTheDocument()
    expect(screen.getByText('红黑树 COMP9021 学习课')).toBeInTheDocument()
  })

  it('keeps legacy review drawer as a thin wrapper over the shared drawer shell', () => {
    const handleSubmit = vi.fn()

    render(
      <MemoryRouter>
        <ReviewDrawer open courseLabel="COMP9311 Database Systems" userLabel="student@uni.edu.au" onClose={vi.fn()} onSubmit={handleSubmit} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('dialog', { name: '写评价' })).toHaveTextContent('COMP9311 Database Systems')

    fireEvent.change(screen.getByLabelText('评论内容'), { target: { value: '旧路径也应该走共享抽屉实现。' } })
    fireEvent.click(screen.getByRole('button', { name: '提交评价' }))

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '旧路径也应该走共享抽屉实现。',
        user: 'student@uni.edu.au',
      }),
    )
  })
})
