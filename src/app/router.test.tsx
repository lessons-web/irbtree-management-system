import { render, screen } from '@testing-library/react'
import type { RouteObject } from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { router } from './router'

describe('router', () => {
  it('renders home', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)
    expect(await screen.findByRole('heading', { name: /拒绝挂科/ })).toBeInTheDocument()
  })

  it('shows enroll helper on home only', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

    render(<RouterProvider router={memoryRouter} />)
    expect(await screen.findByRole('button', { name: /报名咨询/ })).toBeInTheDocument()
  })

  it('does not show enroll helper on non-home routes', async () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/review'] })

    render(<RouterProvider router={memoryRouter} />)
    expect(await screen.findByRole('link', { name: /评课/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /报名咨询/ })).not.toBeInTheDocument()
  })
})
