# 移除 Auth 页面并收敛为默认演示态实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 删除 `auth` 页面与登录守卫，让系统默认以固定演示用户直达所有页面，同时清理登录弹窗、登录入口和来源页跳转逻辑。

**架构：** 路由层去掉 `RequireAuth` / `RequireRole`，并把 `/auth` 收敛为兼容跳转到首页；状态层让 `AuthProvider` 从应用启动起就提供固定演示用户。组件层删除 Header 登录入口和 `LoginModal` 链路，同时让 `useRequireAuthAction`、`useProtectedNavigation` 退化为直接执行动作的薄封装。

**技术栈：** React 19、React Router 7、TypeScript、Vitest、Testing Library

---

## 文件结构

### 需要修改

- `src/app/router.tsx`
  - 删除 `AuthPage` 页面挂载和 `RequireAuth` / `RequireRole` 的路由接入
  - 把 `/auth` 改为兼容跳转到 `/`
- `src/features/auth/AuthContext.tsx`
  - 把用户态改成固定演示用户，应用启动即有 `user`
- `src/features/auth/state.ts`
  - 视实现需要保留或收窄 `loginAs` / `logout` 签名，确保展示层继续可用
- `src/components/user/UserHeader.tsx`
  - 移除“登录 / 注册”按钮与退出登录按钮，始终展示演示用户菜单
- `src/layouts/UserLayout.tsx`
  - 去掉对 `openLogin` 的依赖
- `src/components/user/UserOverlayContext.tsx`
  - 删除登录弹窗状态、`openLogin` 和 `afterLogin` 链路
  - 保留评价抽屉和已修课程抽屉
- `src/components/user/userOverlayShared.ts`
  - 移除 `LoginOptions` 和 `openLogin`
- `src/features/auth/useRequireAuthAction.ts`
  - 改成直接执行动作，不再依赖 overlay 或 `/auth`
- `src/features/auth/useProtectedNavigation.ts`
  - 改成直接导航
- `src/app/PublicLayout.tsx`
  - 去掉登录 / 退出按钮的 auth 依赖，避免残留 `/auth` 入口
- `src/app/router.test.tsx`
  - 收敛路由测试为默认可访问行为
- `src/features/auth/useProtectedNavigation.test.tsx`
  - 收敛为直接导航测试
- `src/components/user/userOverlay.test.tsx`
  - 收敛为直接打开评价/已修课程抽屉
- `src/components/user/task3-shells.test.tsx`
  - 删除 `LoginModal` 与登录入口相关断言，改成默认用户态断言

### 需要删除

- `src/pages/auth/AuthPage.tsx`
- `src/features/auth/guards.tsx`
- `src/components/user/LoginModal.tsx`

### 参考文件

- `src/components/user/useUserOverlay.ts`
  - 如 context value 调整，需要确认 hook API 与调用方一致
- `docs/superpowers/specs/2026-06-22-auth-removal-design.md`
  - 作为实现范围与兼容跳转口径的唯一规格来源

## 任务 1：收敛路由与固定演示用户

**文件：**
- 修改：`src/app/router.test.tsx`
- 修改：`src/app/router.tsx`
- 修改：`src/features/auth/AuthContext.tsx`
- 修改：`src/features/auth/state.ts`
- 删除：`src/pages/auth/AuthPage.tsx`
- 删除：`src/features/auth/guards.tsx`

- [ ] **步骤 1：先把路由测试改成默认直达和 `/auth` 兼容跳转**

先修改 `src/app/router.test.tsx`，删除“进入演示系统后恢复来源页”的认证断言，改成直接可访问断言：

```tsx
it('allows direct visits to courses without redirecting to auth', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/courses?query=COMP9311#filters'] })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByLabelText('搜索课程')).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/courses')
  expect(memoryRouter.state.location.search).toBe('?query=COMP9311')
  expect(memoryRouter.state.location.hash).toBe('#filters')
})

it('redirects the legacy auth path back to home', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/auth'] })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: /拒绝挂科/ })).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/')
})
```

同时把后台入口测试改为不再需要先点“进入演示系统”：

```tsx
await act(async () => {
  await memoryRouter.navigate('/admin')
})

expect((await screen.findAllByRole('heading', { name: '课程列表' })).length).toBeGreaterThan(0)
expect(memoryRouter.state.location.pathname).toBe('/admin/course-center')
```

- [ ] **步骤 2：运行路由测试，确认它们因旧守卫和 `AuthPage` 失败**

运行：

```bash
npm test -- src/app/router.test.tsx
```

预期：

- 旧的 `RequireAuth` 仍会把 `/courses` 打回 `/auth`
- 旧的 `/auth` 仍会渲染 `进入 IRBTree 演示系统`
- 至少出现 1 个与路径或页面内容相关的失败断言

- [ ] **步骤 3：用最小代码收敛路由与会话来源**

先在 `src/features/auth/AuthContext.tsx` 中把用户态改成固定演示用户：

```tsx
const demoUser: User = {
  id: 'u_mock',
  email: 'alex.student@irbtree.com',
  roles: ['student'],
  name: 'Alex Student',
  badgeLabel: '学生认证',
  avatarText: 'A',
  canAccessAdmin: true,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthState>(() => {
    return {
      user: demoUser,
      loginAs: () => {},
      logout: () => {},
    }
  }, [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

再在 `src/app/router.tsx` 中删除 `AuthPage`、`RequireAuth`、`RequireRole` 接入，并保留 `/auth` 到首页的兼容跳转：

```tsx
import PathAlias from './PathAlias'

{
  element: (
    <ReviewProvider>
      <UserLayout />
    </ReviewProvider>
  ),
  children: [
    { index: true, Component: HomePage },
    { path: 'auth', element: <PathAlias to="/" /> },
    { path: 'courses', Component: CoursesPage },
    { path: 'course/:code', Component: CourseDetailPage },
    { path: 'recommendation', Component: RecommendationPage },
    { path: 'profile', Component: ProfilePage },
    { path: 'learn', Component: LearnIndexPage },
  ],
},
{
  path: 'admin',
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <PathAlias to={adminDefaultPath} /> },
      ],
    },
  ],
},
```

最后删除：

```text
src/pages/auth/AuthPage.tsx
src/features/auth/guards.tsx
```

- [ ] **步骤 4：重新运行路由测试，确认默认可访问行为通过**

运行：

```bash
npm test -- src/app/router.test.tsx
```

预期：

- 直接访问 `/courses`、`/admin` 不再跳到 `/auth`
- `/auth` 直接回首页
- `router.test.tsx` 全部通过

- [ ] **步骤 5：提交这一轮路由和固定演示用户收敛**

```bash
git add src/app/router.tsx src/features/auth/AuthContext.tsx src/features/auth/state.ts src/app/router.test.tsx src/pages/auth/AuthPage.tsx src/features/auth/guards.tsx
git commit -m "refactor: remove auth route and guards"
```

## 任务 2：下线 Header 登录入口和登录弹窗链路

**文件：**
- 修改：`src/components/user/task3-shells.test.tsx`
- 修改：`src/components/user/userOverlay.test.tsx`
- 修改：`src/components/user/UserHeader.tsx`
- 修改：`src/layouts/UserLayout.tsx`
- 修改：`src/components/user/UserOverlayContext.tsx`
- 修改：`src/components/user/userOverlayShared.ts`
- 修改：`src/app/PublicLayout.tsx`
- 删除：`src/components/user/LoginModal.tsx`

- [ ] **步骤 1：先把壳层与 overlay 测试改成“默认已是演示用户态”**

在 `src/components/user/task3-shells.test.tsx` 中移除 `LoginModal` 和 `onOpenLogin` 相关断言，改成默认用户菜单断言：

```tsx
it('renders header in demo-user mode without login or register actions', () => {
  renderWithAuth(
    <>
      <UserHeader onOpenCompleted={vi.fn()} />
      <UserFooter />
    </>,
  )

  expect(screen.queryByRole('button', { name: '登录' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '注册' })).not.toBeInTheDocument()
  expect(screen.getByText('Alex Student')).toBeInTheDocument()
})
```

在 `src/components/user/userOverlay.test.tsx` 中，把“先弹登录再继续”的测试改成直接打开：

```tsx
it('opens review drawer directly without login modal', () => {
  renderWithOverlay(<ReviewFlowProbe />)

  fireEvent.click(screen.getByRole('button', { name: '打开写评价' }))
  expect(screen.queryByRole('dialog', { name: '请先登录' })).not.toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: '写评价' })).toHaveTextContent('COMP9021 Principles of Programming')
})

it('opens completed drawer directly without login modal', () => {
  renderWithOverlay(<CompletedFlowProbe />)

  fireEvent.click(screen.getByRole('button', { name: '打开已修课程' }))
  expect(screen.queryByRole('dialog', { name: '请先登录' })).not.toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: '我已修的课程' })).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行组件测试，确认它们因旧登录链路失败**

运行：

```bash
npm test -- src/components/user/task3-shells.test.tsx src/components/user/userOverlay.test.tsx
```

预期：

- 旧 Header 仍会显示“登录 / 注册”
- 旧 overlay 仍会先弹 `请先登录`
- 旧测试仍引用 `LoginModal`

- [ ] **步骤 3：实现最小组件收敛**

先在 `src/components/user/userOverlayShared.ts` 删除 `LoginOptions` 与 `openLogin`：

```ts
export type UserOverlayContextValue = {
  completedCourses: CompletedCourseItem[]
  openReview: (request: ReviewOverlayRequest) => boolean
  openCompleted: () => boolean
  closeCompleted: () => void
  setCompletedCourses: (value: CompletedCourseItem[]) => void
}
```

再在 `src/components/user/UserOverlayContext.tsx` 中删除登录弹窗状态和 `afterLoginRef`，让评价抽屉与已修课程抽屉直接打开：

```tsx
const openReview = useCallback((request: ReviewOverlayRequest) => {
  setCompletedOpen(false)
  setReviewRequest(request)
  return true
}, [])

const openCompleted = useCallback(() => {
  setReviewRequest(null)
  setCompletedOpen(true)
  return true
}, [])

return (
  <UserOverlayContext.Provider value={value}>
    {children}
    <ReviewDrawer ... />
    <CompletedCourseDrawer ... />
  </UserOverlayContext.Provider>
)
```

在 `src/layouts/UserLayout.tsx` 中移除 `openLogin` 依赖：

```tsx
function UserLayoutContent() {
  const { openCompleted } = useUserOverlay()
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <UserHeader onOpenCompleted={openCompleted} />
      <main className="w-full flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

在 `src/components/user/UserHeader.tsx` 中删掉未登录分支和退出登录按钮，保持始终显示用户菜单：

```tsx
export default function UserHeader({ onOpenCompleted }: UserHeaderProps) {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div ref={menuRef} className="relative flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 bg-transparent text-left transition hover:text-slate-800"
            onClick={() => setMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`${presentation.name} 用户菜单`}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 bg-white text-sm font-semibold text-brand-600">
              {presentation.avatarText}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
```

并在 `src/app/PublicLayout.tsx` 去掉 `useAuth()` 和 `/auth` 登录入口，只保留公共导航。

最后删除：

```text
src/components/user/LoginModal.tsx
```

- [ ] **步骤 4：重新运行壳层和 overlay 测试，确认登录链路已下线**

运行：

```bash
npm test -- src/components/user/task3-shells.test.tsx src/components/user/userOverlay.test.tsx
```

预期：

- 不再出现 `请先登录` 弹窗
- Header 不再展示登录 / 注册
- 评价抽屉和已修课程抽屉可以直接打开

- [ ] **步骤 5：提交这一轮 Header 与 overlay 清理**

```bash
git add src/components/user/UserHeader.tsx src/layouts/UserLayout.tsx src/components/user/UserOverlayContext.tsx src/components/user/userOverlayShared.ts src/app/PublicLayout.tsx src/components/user/task3-shells.test.tsx src/components/user/userOverlay.test.tsx src/components/user/LoginModal.tsx
git commit -m "refactor: remove login modal flow"
```

## 任务 3：清理 auth helper 并完成最终回归

**文件：**
- 修改：`src/features/auth/useProtectedNavigation.test.tsx`
- 修改：`src/features/auth/useRequireAuthAction.ts`
- 修改：`src/features/auth/useProtectedNavigation.ts`
- 修改：`src/components/user/useUserOverlay.ts`（如果类型收敛需要同步）
- 修改：`src/app/router.test.tsx`
- 修改：`src/components/user/task3-shells.test.tsx`
- 修改：`src/components/user/userOverlay.test.tsx`

- [ ] **步骤 1：先把 auth helper 测试改成直接执行**

在 `src/features/auth/useProtectedNavigation.test.tsx` 中移除 `UserOverlayProvider` 登录弹窗断言，改成直接导航：

```tsx
it('navigates directly without opening login modal', async () => {
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
```

- [ ] **步骤 2：运行 helper 测试，确认旧逻辑会失败**

运行：

```bash
npm test -- src/features/auth/useProtectedNavigation.test.tsx
```

预期：

- 旧 `useRequireAuthAction()` 仍会尝试打开登录弹窗
- 测试会因出现 `请先登录` 或未直接跳转而失败

- [ ] **步骤 3：实现最小 helper 清理**

把 `src/features/auth/useRequireAuthAction.ts` 改成薄封装：

```ts
import { useCallback } from 'react'

export function useRequireAuthAction() {
  return useCallback((action: () => void) => {
    action()
    return true
  }, [])
}
```

把 `src/features/auth/useProtectedNavigation.ts` 改成直接导航：

```ts
export function useProtectedNavigation() {
  const navigate = useNavigate()

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      navigate(to, options)
      return true
    },
    [navigate],
  )
}
```

如 `useUserOverlay.ts` 因 `openLogin` 删除而出现类型报错，同步只保留现存 context 能力。

- [ ] **步骤 4：运行最终验证**

运行：

```bash
npm test -- src/app/router.test.tsx src/features/auth/useProtectedNavigation.test.tsx src/components/user/task3-shells.test.tsx src/components/user/userOverlay.test.tsx
npx eslint src/app/router.tsx src/features/auth/AuthContext.tsx src/features/auth/state.ts src/components/user/UserHeader.tsx src/layouts/UserLayout.tsx src/components/user/UserOverlayContext.tsx src/components/user/userOverlayShared.ts src/features/auth/useRequireAuthAction.ts src/features/auth/useProtectedNavigation.ts src/app/PublicLayout.tsx src/app/router.test.tsx src/features/auth/useProtectedNavigation.test.tsx src/components/user/task3-shells.test.tsx src/components/user/userOverlay.test.tsx
```

预期：

- 所有相关测试通过
- ESLint 退出码为 `0`

- [ ] **步骤 5：提交最终清理与回归验证结果**

```bash
git add src/features/auth/useRequireAuthAction.ts src/features/auth/useProtectedNavigation.ts src/features/auth/useProtectedNavigation.test.tsx src/components/user/useUserOverlay.ts src/app/router.test.tsx src/components/user/task3-shells.test.tsx src/components/user/userOverlay.test.tsx
git commit -m "refactor: default to demo session"
```
