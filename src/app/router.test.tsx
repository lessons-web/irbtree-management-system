import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { RouteObject } from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { router } from './router'

describe('router', () => {
  it('renders home', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    const { container } = render(<RouterProvider router={memoryRouter} />)
    expect(await screen.findByRole('heading', { name: /拒绝挂科/ })).toBeInTheDocument()
    expect(container.querySelector('main')).not.toHaveClass('max-w-6xl')
    expect(container.querySelector('main')).not.toHaveClass('px-4')
    expect(container.querySelector('main')).not.toHaveClass('py-8')
  })

  it('shows only one shared consult entry on home', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)
    await screen.findByRole('heading', { name: /拒绝挂科/ })
    expect(screen.getAllByRole('button', { name: /课程咨询|报名咨询/ })).toHaveLength(1)
  })

  it('navigates from the home header to courses without requiring login', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)
    await screen.findByRole('heading', { name: /拒绝挂科/ })

    fireEvent.click(screen.getByRole('link', { name: '课程列表' }))

    expect(await screen.findByLabelText('搜索课程')).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/courses')
  })

  it('opens featured course cards directly from home', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)
    await screen.findByRole('heading', { name: /拒绝挂科/ })

    fireEvent.click(screen.getByRole('link', { name: /COMP9021/i }))

    expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
  })

  it('keeps the floating consult button on non-home routes', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/courses'] })

    render(<RouterProvider router={memoryRouter} />)
    await act(async () => {
      await memoryRouter.navigate('/review')
    })

    expect(await screen.findByLabelText('搜索课程')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /报名咨询/ })).toBeInTheDocument()
  })

  it('persists shared review state across routes in the same router', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/course/COMP9021'] })

    render(<RouterProvider router={memoryRouter} />)

    expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
    expect(screen.getByText('2 条评价')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: '写评价' })[0])
    const reviewDialog = await screen.findByRole('dialog', { name: '写评价' })
    fireEvent.change(within(reviewDialog).getByLabelText('评论内容'), { target: { value: '跨页状态复用集成测试新增的一条评价内容。' } })
    fireEvent.click(within(reviewDialog).getByRole('button', { name: '提交评价' }))

    expect(await screen.findByText('3 条评价')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'IRBTree Forum' }))

    const homeCourseCard = await screen.findByRole('link', { name: /COMP9021/i })
    expect(within(homeCourseCard).getByText('3 条评价')).toBeInTheDocument()
  })

  it('keeps alias routes landing on the new implementations', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)

    await act(async () => {
      await memoryRouter.navigate('/review/COMP9021')
    })

    expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
    expect(screen.getByText('学生评价')).toBeInTheDocument()

    await act(async () => {
      await memoryRouter.navigate('/me')
    })

    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
    expect(screen.getByText('2026 T1 求职冲刺计划')).toBeInTheDocument()

    await act(async () => {
      await memoryRouter.navigate('/recommend')
    })

    expect(await screen.findByRole('heading', { name: '选课推荐' })).toBeInTheDocument()
    expect(screen.getByText('2026 T1 求职冲刺计划')).toBeInTheDocument()
  })

  it('preserves query and hash when legacy alias routes redirect', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)

    await act(async () => {
      await memoryRouter.navigate('/review/COMP9021?from=legacy#notes')
    })

    expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/course/COMP9021')
    expect(memoryRouter.state.location.search).toBe('?from=legacy')
    expect(memoryRouter.state.location.hash).toBe('#notes')

    await act(async () => {
      await memoryRouter.navigate('/me?tab=completed#history')
    })

    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/profile')
    expect(memoryRouter.state.location.search).toBe('?tab=completed')
    expect(memoryRouter.state.location.hash).toBe('#history')

    await act(async () => {
      await memoryRouter.navigate('/recommend?year=2026#result')
    })

    expect(await screen.findByRole('heading', { name: '选课推荐' })).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/recommendation')
    expect(memoryRouter.state.location.search).toBe('?year=2026')
    expect(memoryRouter.state.location.hash).toBe('#result')
  })

  it('allows direct visits to non-home user routes without redirecting to auth', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/courses?query=COMP9311#filters'] })

    render(<RouterProvider router={memoryRouter} />)

    expect(await screen.findByLabelText('搜索课程')).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/courses')
    expect(memoryRouter.state.location.search).toBe('?query=COMP9311')
    expect(memoryRouter.state.location.hash).toBe('#filters')
  })

  it('preserves query and hash for the legacy review list alias', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)

    await act(async () => {
      await memoryRouter.navigate('/review?query=COMP9311&page=2#filters')
    })

    expect(await screen.findByLabelText('搜索课程')).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/courses')
    expect(memoryRouter.state.location.search).toBe('?query=COMP9311&page=2')
    expect(memoryRouter.state.location.hash).toBe('#filters')
    expect(screen.getByLabelText('搜索课程')).toHaveValue('COMP9311')
  })

  it('lets the fixed demo account reach the admin system by default', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/admin'] })

    render(<RouterProvider router={memoryRouter} />)

    expect((await screen.findAllByRole('heading', { name: '课程列表' })).length).toBeGreaterThan(0)
    expect(memoryRouter.state.location.pathname).toBe('/admin/course-center')
    expect(screen.getByRole('link', { name: '课程中心' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '课程列表' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '系统管理' })).toBeInTheDocument()
  })

  it('shows the system submenu and admin header actions', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/admin/system-management/messages'] })

    render(<RouterProvider router={memoryRouter} />)

    expect((await screen.findAllByRole('heading', { name: '消息管理' })).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '通知' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '管理员菜单' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '消息管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '系统日志' })).toBeInTheDocument()
  })

  it('redirects the legacy auth path back to home', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/auth'] })

    render(<RouterProvider router={memoryRouter} />)

    expect(await screen.findByRole('heading', { name: /拒绝挂科/ })).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/')
  })
})
