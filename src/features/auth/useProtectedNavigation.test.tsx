import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useProtectedNavigation } from './useProtectedNavigation'

function ProtectedNavigationProbe() {
  const protectedNavigate = useProtectedNavigation()
  const location = useLocation()

  return (
    <>
      <div data-testid="pathname">{location.pathname}</div>
      <button type="button" onClick={() => protectedNavigate('/courses')}>
        去课程列表
      </button>
    </>
  )
}

describe('useProtectedNavigation', () => {
  it('navigates directly without opening a login modal', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<ProtectedNavigationProbe />} />
            <Route path="/courses" element={<div>课程列表页</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '去课程列表' }))

    expect(screen.queryByRole('dialog', { name: '请先登录' })).not.toBeInTheDocument()
    expect(await screen.findByText('课程列表页')).toBeInTheDocument()
  })
})
