# 全站未登录拦截后再导航实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 让用户从首页点击任意非首页入口时，未登录先弹出站内登录弹窗，登录成功后再继续跳转；同时用路由守卫兜底直接访问非首页地址。

**架构：** 保留现有 `UserOverlayProvider` 作为登录弹窗和 `afterLogin` 回调的唯一来源，在 `features/auth` 中新增一个“受保护导航”钩子，把“未登录先打开弹窗、已登录再 navigate”的行为封装起来。UI 层把首页、头部导航和页面内 CTA 全部改成调用这个钩子；路由层再把除 `/` 与 `/auth` 之外的用户页放进 `RequireAuth`，保证地址栏直达也不会绕过登录。

**技术栈：** React 19、React Router 7、Vitest、Testing Library

---

## 文件结构

- 创建：`src/features/auth/useProtectedNavigation.ts`
- 创建：`src/features/auth/useProtectedNavigation.test.tsx`
- 修改：`src/components/user/UserHeader.tsx`
- 修改：`src/pages/home/HomePage.tsx`
- 修改：`src/components/user/CourseCard.tsx`
- 修改：`src/pages/home/components/LearningSummary.tsx`
- 修改：`src/pages/recommendation/RecommendationPage.tsx`
- 修改：`src/app/router.tsx`
- 修改：`src/app/router.test.tsx`

### 任务 1：抽出受保护导航能力

**文件：**
- 创建：`src/features/auth/useProtectedNavigation.ts`
- 测试：`src/features/auth/useProtectedNavigation.test.tsx`

- [ ] **步骤 1：编写失败的测试**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthContext'
import { UserOverlayProvider } from '../../components/user/UserOverlayContext'
import { useProtectedNavigation } from './useProtectedNavigation'

function Probe() {
  const navigateTo = useProtectedNavigation()
  const location = useLocation()

  return (
    <>
      <div data-testid="pathname">{location.pathname}</div>
      <button type="button" onClick={() => navigateTo('/courses')}>
        去课程列表
      </button>
    </>
  )
}

describe('useProtectedNavigation', () => {
  it('opens login first and resumes navigation after login', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <UserOverlayProvider>
            <Routes>
              <Route path="/" element={<Probe />} />
              <Route path="/courses" element={<div>课程列表页</div>} />
            </Routes>
          </UserOverlayProvider>
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '去课程列表' }))

    expect(screen.getByRole('dialog', { name: '请先登录' })).toBeInTheDocument()
    expect(screen.getByTestId('pathname')).toHaveTextContent('/')

    fireEvent.click(screen.getByRole('button', { name: '立即登录' }))

    expect(await screen.findByText('课程列表页')).toBeInTheDocument()
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/features/auth/useProtectedNavigation.test.tsx`
预期：FAIL，报错 `Cannot find module './useProtectedNavigation'` 或 `useProtectedNavigation is not exported`

- [ ] **步骤 3：编写最少实现代码**

```ts
import { useCallback } from 'react'
import { type NavigateOptions, useNavigate } from 'react-router'
import { useRequireAuthAction } from './useRequireAuthAction'

export function useProtectedNavigation() {
  const navigate = useNavigate()
  const requireAuth = useRequireAuthAction()

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      return requireAuth(() => {
        navigate(to, options)
      })
    },
    [navigate, requireAuth],
  )
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/features/auth/useProtectedNavigation.test.tsx`
预期：PASS，`opens login first and resumes navigation after login`

- [ ] **步骤 5：Commit**

```bash
git add src/features/auth/useProtectedNavigation.ts src/features/auth/useProtectedNavigation.test.tsx
git commit -m "feat: add auth-gated navigation hook"
```

### 任务 2：把首页和共享导航入口切到受保护跳转

**文件：**
- 修改：`src/components/user/UserHeader.tsx`
- 修改：`src/pages/home/HomePage.tsx`
- 修改：`src/components/user/CourseCard.tsx`
- 修改：`src/pages/home/components/LearningSummary.tsx`
- 修改：`src/pages/recommendation/RecommendationPage.tsx`
- 测试：`src/app/router.test.tsx`

- [ ] **步骤 1：先写集成测试，覆盖头部导航和首页入口**

```tsx
it('keeps users on home when unauthenticated header navigation is clicked and resumes after login', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

  render(<RouterProvider router={memoryRouter} />)
  await screen.findByRole('heading', { name: /拒绝挂科/ })

  fireEvent.click(screen.getByRole('link', { name: '课程列表' }))

  expect(screen.getByRole('dialog', { name: '请先登录' })).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/')

  fireEvent.click(screen.getByRole('button', { name: '立即登录' }))

  expect(await screen.findByLabelText('搜索课程')).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/courses')
})

it('keeps users on home when unauthenticated featured course card is clicked and resumes after login', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

  render(<RouterProvider router={memoryRouter} />)
  await screen.findByRole('heading', { name: /拒绝挂科/ })

  fireEvent.click(screen.getByRole('link', { name: /COMP9021/i }))

  expect(screen.getByRole('dialog', { name: '请先登录' })).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/')

  fireEvent.click(screen.getByRole('button', { name: '立即登录' }))

  expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/app/router.test.tsx`
预期：FAIL，断言显示地址已经变成 `/courses` 或 `/course/COMP9021`，说明点击时仍然直接切页

- [ ] **步骤 3：按入口逐个接入 `useProtectedNavigation`**

```tsx
// src/components/user/UserHeader.tsx
const protectedNavigate = useProtectedNavigation()

<NavLink
  to={item.to}
  end={item.end}
  onClick={(event) => {
    if (item.to === '/') return
    if (user) return
    event.preventDefault()
    protectedNavigate(item.to)
  }}
>
```

```tsx
// src/pages/home/HomePage.tsx
const protectedNavigate = useProtectedNavigation()

<HeroSearch
  onSearch={(keyword) => {
    const params = new URLSearchParams()
    if (keyword) params.set('query', keyword)
    protectedNavigate(`/courses${params.toString() ? `?${params.toString()}` : ''}`)
  }}
/>

<Link
  to="/courses"
  onClick={(event) => {
    event.preventDefault()
    protectedNavigate('/courses')
  }}
>
```

```tsx
// src/components/user/CourseCard.tsx
const protectedNavigate = useProtectedNavigation()

<Link
  to={`/course/${course.code}`}
  onClick={(event) => {
    event.preventDefault()
    protectedNavigate(`/course/${course.code}`)
  }}
>
```

```tsx
// src/pages/home/components/LearningSummary.tsx
const { openLogin } = useUserOverlay()
const protectedNavigate = useProtectedNavigation()

<button type="button" onClick={() => openLogin()}>
  去登录
</button>

<Link
  to="/learn"
  onClick={(event) => {
    event.preventDefault()
    protectedNavigate('/learn')
  }}
>
```

```tsx
// src/pages/recommendation/RecommendationPage.tsx
const protectedNavigate = useProtectedNavigation()

<button
  type="button"
  onClick={() => protectedNavigate('/profile?tab=completed')}
>
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/features/auth/useProtectedNavigation.test.tsx src/app/router.test.tsx`
预期：PASS，未登录点击首页任意非首页入口时仍停留在 `/`，登录后跳到对应目标页

- [ ] **步骤 5：Commit**

```bash
git add src/components/user/UserHeader.tsx src/pages/home/HomePage.tsx src/components/user/CourseCard.tsx src/pages/home/components/LearningSummary.tsx src/pages/recommendation/RecommendationPage.tsx src/app/router.test.tsx
git commit -m "feat: gate shared navigation behind login modal"
```

### 任务 3：用路由守卫兜底所有非首页地址

**文件：**
- 修改：`src/app/router.tsx`
- 测试：`src/app/router.test.tsx`

- [ ] **步骤 1：先写失败测试，验证直接访问非首页地址会被守卫拦住**

```tsx
it('redirects unauthenticated direct visits for all non-home user routes to auth', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/courses?query=COMP9311#filters'] })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: /进入 IRBTree 演示系统/ })).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/auth')
  expect(memoryRouter.state.location.state?.from).toEqual({
    pathname: '/courses',
    search: '?query=COMP9311',
    hash: '#filters',
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/app/router.test.tsx`
预期：FAIL，当前会直接渲染课程列表页，说明 `/courses` 与 `/course/:code` 仍然是公开路由

- [ ] **步骤 3：把全部非首页用户路由收进 `RequireAuth`**

```tsx
{
  element: <RequireAuth />,
  children: [
    { path: 'review', element: <PathAlias to="/courses" /> },
    { path: 'review/:code', Component: CourseDetailAlias },
    { path: 'me', element: <PathAlias to="/profile" /> },
    { path: 'recommend', element: <PathAlias to="/recommendation" /> },
    { path: 'courses', Component: CoursesPage },
    { path: 'course/:code', Component: CourseDetailPage },
    { path: 'recommendation', Component: RecommendationPage },
    { path: 'profile', Component: ProfilePage },
    { path: 'learn', Component: LearnIndexPage },
  ],
}
```

- [ ] **步骤 4：运行完整验证**

运行：`npm test -- src/features/auth/useProtectedNavigation.test.tsx src/app/router.test.tsx src/pages/task5-user-pages.test.tsx`
预期：PASS，直接访问所有非首页路由会进 `/auth`，首页点击入口仍然是“先弹窗、后跳转”，原有已登录页面测试继续通过

再运行：`npm run lint`
预期：PASS，无新增 ESLint 错误

- [ ] **步骤 5：Commit**

```bash
git add src/app/router.tsx src/app/router.test.tsx
git commit -m "feat: require login for all non-home routes"
```
