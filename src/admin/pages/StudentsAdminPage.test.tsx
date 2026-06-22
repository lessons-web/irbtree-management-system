import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Outlet, RouterProvider, createMemoryRouter, type InitialEntry, type RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'
import { router } from '../../app/router'
import { AuthContext, type AuthState } from '../../features/auth/state'
import { buildStudentListRows } from './students/studentsAdminData'

const adminAuthState: AuthState = {
  user: {
    id: 'admin-user',
    email: 'admin@irbtree.com',
    name: 'Admin User',
    roles: ['admin'],
    canAccessAdmin: true,
    avatarText: 'AU',
  },
  loginAs: () => {},
  logout: () => {},
}

function renderAdminAt(initialEntry: InitialEntry) {
  const wrapRootWithAdminAuth = (routes: RouteObject[]): RouteObject[] =>
    routes.map((route, index) => {
      const clonedRoute: RouteObject = {
        ...route,
        children: route.children ? wrapRootWithAdminAuth(route.children) : undefined,
      }

      if (index !== 0 || route.path !== '/') {
        return clonedRoute
      }

      return {
        ...clonedRoute,
        element: (
          <AuthContext.Provider value={adminAuthState}>
            <Outlet />
          </AuthContext.Provider>
        ),
      }
    })

  const memoryRouter = createMemoryRouter(wrapRootWithAdminAuth(router.routes), { initialEntries: [initialEntry] })

  render(<RouterProvider router={memoryRouter} />)

  return memoryRouter
}

describe('Students admin page', () => {
  it('derives list course count and summary from the same enrollment set', () => {
    const rows = buildStudentListRows({
      students: [
        {
          id: 'student-custom',
          name: 'Custom Student',
          email: 'custom@student.com',
          phone: '0400 000 099',
          status: 'active',
          registeredAt: '2026-01-01',
          enrolledCourseCount: 99,
        },
      ],
      enrollments: [
        {
          id: 'enrollment-custom-course',
          studentId: 'student-custom',
          courseId: 'course-custom',
          validFrom: '2026-02-01',
          validUntil: '2026-08-01',
          status: 'active',
          source: '人工开通',
        },
      ],
      payments: [],
      courses: [
        {
          id: 'course-custom',
          code: 'COMP9999',
          name: 'Custom Systems',
          university: 'UNSW',
          credits: 6,
          teacher: 'Dr. Custom',
          tutor: 'Tutor Custom',
          summary: 'custom',
          status: '已上线',
          statusTone: 'success',
          searchText: 'COMP9999 Custom Systems',
        },
      ],
    })

    expect(rows[0]?.courseCount).toBe(1)
    expect(rows[0]?.courseCountLabel).toBe('1 门课程')
    expect(rows[0]?.courseSummary).toBe('COMP9999 Custom Systems')
  })

  it('renders student list with enrollment and payment summary', async () => {
    renderAdminAt('/admin/student-management/students')

    expect(await screen.findByRole('heading', { name: '学员列表' })).toBeInTheDocument()
    expect(screen.getByText('Alex Student')).toBeInTheDocument()
    expect(screen.getByText('2 门课程')).toBeInTheDocument()
    expect(screen.getByText(/2 笔已支付/)).toBeInTheDocument()
    expect(screen.getByText('最近缴费：2026-03-15 14:10')).toBeInTheDocument()
  })

  it('restores list query context when navigating back from student detail', async () => {
    const memoryRouter = renderAdminAt('/admin/student-management/students')

    await screen.findByRole('heading', { name: '学员列表' })
    fireEvent.change(screen.getByRole('textbox', { name: '搜索' }), { target: { value: 'Alex' } })
    fireEvent.click(screen.getAllByRole('link', { name: '查看详情' })[0] as HTMLElement)

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/admin/student-management/students/student-alex')
    })

    fireEvent.click(await screen.findByRole('link', { name: '返回学员列表' }))

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/admin/student-management/students')
    })
    expect(screen.getByRole('textbox', { name: '搜索' })).toHaveValue('Alex')
  })

  it('renders student detail timeline and payment records', async () => {
    renderAdminAt('/admin/student-management/students/student-alex')

    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '课程权限' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '缴费记录' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '跟进备注' })).toBeInTheDocument()
    expect(screen.getByText('COMP9021 · Principles of Programming')).toBeInTheDocument()
    expect(screen.getByText('首期报名缴费')).toBeInTheDocument()
  })
})
