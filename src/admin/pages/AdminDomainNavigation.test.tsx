import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { RouteObject } from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { getAdminPageTitle } from '../config/navigation'
import { router } from '../../app/router'

async function renderAdminRoute(initialEntry: string) {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: [initialEntry] })
  const renderResult = render(<RouterProvider router={memoryRouter} />)

  return { memoryRouter, ...renderResult }
}

describe('Admin domain navigation', () => {
  it('renders five top-level admin groups and defaults to course center', async () => {
    const { memoryRouter } = await renderAdminRoute('/admin')

    const courseCenterLink = await screen.findByRole('link', { name: '课程中心' })
    expect(courseCenterLink).toBeInTheDocument()
    expect(courseCenterLink).toHaveAttribute('href', '/admin/course-center')
    expect(screen.queryByRole('link', { name: '课程列表' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '课程关系视图' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '评课管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '学员管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '题库管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '系统管理' })).toBeInTheDocument()

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/admin/course-center')
    })
  })

  it.each([
    ['课程中心', '/admin/course-center', '课程列表'],
    ['评课管理', '/admin/review-management/reviews', '评价管理'],
    ['学员管理', '/admin/student-management/students', '学员列表'],
    ['题库管理', '/admin/problem-bank/tags', '标签管理'],
    ['系统管理', '/admin/system-management/users', '用户管理'],
  ])('uses the correct link target and navigates to the default child when clicking %s', async (label, targetPath, heading) => {
    const { memoryRouter } = await renderAdminRoute('/admin')

    const groupLink = await screen.findByRole('link', { name: label })
    expect(groupLink).toHaveAttribute('href', targetPath)

    fireEvent.click(groupLink)

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe(targetPath)
    })
    expect((await screen.findAllByRole('heading', { name: heading })).length).toBeGreaterThan(0)
  })

  it('redirects the legacy admin course path into the course center domain', async () => {
    const { memoryRouter } = await renderAdminRoute('/admin/courses')

    expect(await screen.findByRole('heading', { name: '课程列表' })).toBeInTheDocument()

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/admin/course-center')
    })
  })

  it('renders the student management submenu and lands on the students route', async () => {
    const { memoryRouter } = await renderAdminRoute('/admin/student-management')

    expect(await screen.findByRole('link', { name: '学员列表' })).toBeInTheDocument()
    expect((await screen.findAllByRole('heading', { name: '学员列表' })).length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/admin/student-management/students')
    })
  })

  it.each([
    ['/admin/reviews', '评价管理', '/admin/review-management/reviews'],
    ['/admin/universities', '院校管理', '/admin/review-management/universities'],
    ['/admin/teachers', '教师管理', '/admin/review-management/teachers'],
    ['/admin/semesters', '学期管理', '/admin/review-management/semesters'],
    ['/admin/tags', '标签管理', '/admin/problem-bank/tags'],
    ['/admin/users', '用户管理', '/admin/system-management/users'],
    ['/admin/messages', '消息管理', '/admin/system-management/messages'],
    ['/admin/logs', '系统日志', '/admin/system-management/logs'],
  ])('redirects legacy admin path %s into grouped domains', async (legacyPath, heading, groupedPath) => {
    const { memoryRouter } = await renderAdminRoute(legacyPath)

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe(groupedPath)
    })
  })

  it.each([
    ['/admin/reviews?tab=pending#queue', '/admin/review-management/reviews', '?tab=pending', '#queue'],
    ['/admin/users?role=admin#detail', '/admin/system-management/users', '?role=admin', '#detail'],
    ['/admin/messages?audience=all#composer', '/admin/system-management/messages', '?audience=all', '#composer'],
  ])('preserves search and hash when redirecting legacy admin path %s', async (legacyPath, groupedPath, search, hash) => {
    const { memoryRouter } = await renderAdminRoute(legacyPath)

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe(groupedPath)
      expect(memoryRouter.state.location.search).toBe(search)
      expect(memoryRouter.state.location.hash).toBe(hash)
    })
  })

  it.each([
    ['/admin/course-center', '课程列表'],
    ['/admin/review-management', '评价管理'],
    ['/admin/student-management', '学员列表'],
    ['/admin/problem-bank', '标签管理'],
    ['/admin/system-management', '用户管理'],
    ['/admin/courses', '课程列表'],
    ['/admin/reviews', '评价管理'],
    ['/admin/universities', '院校管理'],
    ['/admin/teachers', '教师管理'],
    ['/admin/semesters', '学期管理'],
    ['/admin/tags', '标签管理'],
    ['/admin/users', '用户管理'],
    ['/admin/messages', '消息管理'],
    ['/admin/logs', '系统日志'],
  ])('maps legacy admin path %s to the page title %s', (legacyPath, expectedTitle) => {
    expect(getAdminPageTitle(legacyPath)).toBe(expectedTitle)
  })

  it('renders a flat white sidebar shell with aligned top bars', async () => {
    const { container } = await renderAdminRoute('/admin')

    const sidebar = container.querySelector('aside')
    const brandBar = container.querySelector('aside > div')
    const header = container.querySelector('header')
    const reviewSubmenuContainer = screen.getByRole('link', { name: '评价管理' }).parentElement
    const courseCenterLink = screen.getByRole('link', { name: '课程中心' })

    expect(sidebar).toHaveClass('bg-white')
    expect(brandBar).toHaveClass('h-16')
    expect(header).toHaveClass('h-16')
    expect(reviewSubmenuContainer).not.toHaveClass('rounded-2xl')
    expect(courseCenterLink.className).not.toContain('rounded-2xl')
  })
})
