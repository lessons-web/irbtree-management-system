import type { RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'
import { router } from './router'

function normalizePath(path: string) {
  const normalized = path.replace(/\/+/g, '/').replace(/\/$/, '')
  return normalized === '' ? '/' : normalized
}

function collectPaths(routes: RouteObject[], parentPath = ''): string[] {
  const paths: string[] = []

  for (const route of routes) {
    const currentPath = route.path
      ? route.path.startsWith('/')
        ? route.path
        : parentPath === '' || parentPath === '/'
          ? `/${route.path}`
          : `${parentPath}/${route.path}`
      : parentPath

    if (route.index) paths.push(normalizePath(currentPath || '/'))
    if (route.path) paths.push(normalizePath(currentPath))
    if (route.children) paths.push(...collectPaths(route.children, currentPath))
  }

  return paths
}

describe('router', () => {
  it('包含预期的路由路径', () => {
    const routes = (router as unknown as { routes: RouteObject[] }).routes
    const paths = collectPaths(routes)

    expect(paths).toContain('/')
    expect(paths).toContain('/auth')
    expect(paths).toContain('/review')
    expect(paths).toContain('/recommend')
    expect(paths).toContain('/learn')
    expect(paths).toContain('/me')
    expect(paths).toContain('/admin')
    expect(paths).toContain('/admin/reviews')
    expect(paths).toContain('/admin/students')
    expect(paths).toContain('/admin/content')
    expect(paths).toContain('/admin/system')
  })
})
