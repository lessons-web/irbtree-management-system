import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthState } from '../../features/auth/state'
import { ReviewProvider } from '../../features/review/reviewProvider'
import ReviewIndexPage from './ReviewIndexPage'

const authState: AuthState = {
  user: { id: 'u_mock', email: 'demo@irbtree.com', roles: ['student'] },
  loginAs: () => {},
  logout: () => {},
}

describe('ReviewIndexPage', () => {
  it('acts as a thin proxy to the current courses page and preserves query filtering', async () => {
    render(
      <AuthContext.Provider value={authState}>
        <MemoryRouter initialEntries={['/review?query=SQL']}>
          <Routes>
            <Route
              path="/review"
              element={
                <ReviewProvider>
                  <ReviewIndexPage />
                </ReviewProvider>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole('heading', { name: '课程列表' })).toBeInTheDocument()
    expect(await screen.findByText('Database Systems')).toBeInTheDocument()
    expect(screen.getByLabelText('搜索课程')).toHaveValue('SQL')
    expect(screen.queryByText('Principles of Programming')).not.toBeInTheDocument()
  })

  it('reuses the new list pagination behavior from the current courses page', async () => {
    render(
      <AuthContext.Provider value={authState}>
        <MemoryRouter initialEntries={['/review?pageSize=1&page=1']}>
          <Routes>
            <Route
              path="/review"
              element={
                <ReviewProvider>
                  <ReviewIndexPage />
                </ReviewProvider>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole('button', { name: '第 2 页' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '第 2 页' }))

    const summary = (await screen.findByText(/显示第/i)).closest('section')
    expect(summary).toHaveTextContent('显示第')
    expect(summary).toHaveTextContent('2')
  })
})
