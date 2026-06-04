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
    expect(await screen.findByText('拒绝挂科，选课不踩雷')).toBeInTheDocument()
  })
})
