# IRBTree 合并系统（信息架构阶段）实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在现有 Vite + React + Tailwind + React Router v7 工程中，落地统一路由与页面骨架：前台首页引流 + 评课/选课/学习 Tabs + 统一个人中心，并固定后台路径 `/admin`（复用同一登录态），同时建立两张课程表与 1:1 课程关联的前端数据模型与 Mock 数据演示。

**架构：** 用 React Router Data Router（`createBrowserRouter`）组织前台与后台两套 Layout；用最小 Auth Context 提供“登录态/角色”与路由守卫；用 domain 类型 + mock 数据仓库承载 UniversityCourse/ProductCourse/CourseLink 等。

**技术栈：** Vite、React 19、TypeScript、Tailwind CSS v4、lucide-react、react-router v7（`react-router` + `react-router/dom`）。

---

## 0. 目标文件结构（实现后）

**新增：**

- `src/app/router.tsx`：统一路由定义（前台 + 后台）
- `src/app/PublicLayout.tsx`：前台顶栏与页面容器
- `src/admin/AdminLayout.tsx`：后台侧边栏与页面容器
- `src/features/auth/AuthContext.tsx`：最小登录态与角色（Mock）
- `src/features/auth/guards.tsx`：路由守卫（RequireAuth/RequireRole）
- `src/pages/home/HomePage.tsx`
- `src/pages/review/ReviewIndexPage.tsx`
- `src/pages/recommend/RecommendIndexPage.tsx`
- `src/pages/learn/LearnIndexPage.tsx`
- `src/pages/me/MeIndexPage.tsx`
- `src/pages/auth/AuthPage.tsx`：用于本阶段的 Mock 登录（切换角色）
- `src/admin/pages/DashboardPage.tsx`
- `src/admin/pages/reviews/ReviewsPlaceholderPage.tsx`
- `src/admin/pages/students/StudentsPlaceholderPage.tsx`
- `src/admin/pages/content/ContentPlaceholderPage.tsx`
- `src/admin/pages/system/SystemPlaceholderPage.tsx`
- `src/domain/types.ts`：领域类型（前端）
- `src/domain/mockData.ts`：Mock 数据（含 CourseLink 1:1）

**修改：**

- `src/main.tsx`：挂载 RouterProvider
- `package.json`：增加 `test` script（如引入 Vitest）

## 1. 任务 1：引入 React Router v7 Data Router 骨架

**文件：**
- 创建：`src/app/router.tsx`
- 创建：`src/app/PublicLayout.tsx`
- 创建：`src/pages/home/HomePage.tsx`
- 创建：`src/pages/review/ReviewIndexPage.tsx`
- 创建：`src/pages/recommend/RecommendIndexPage.tsx`
- 创建：`src/pages/learn/LearnIndexPage.tsx`
- 创建：`src/pages/me/MeIndexPage.tsx`
- 修改：`src/main.tsx`

- [ ] **步骤 1：创建 PublicLayout**

```tsx
import { NavLink, Outlet } from 'react-router'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="text-lg font-bold text-slate-900">
            IRBTree
          </NavLink>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <NavLink to="/review" className="hover:text-slate-900">
              评课
            </NavLink>
            <NavLink to="/recommend" className="hover:text-slate-900">
              选课
            </NavLink>
            <NavLink to="/learn" className="hover:text-slate-900">
              学习
            </NavLink>
            <NavLink to="/me" className="hover:text-slate-900">
              我的
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **步骤 2：创建各页面占位**

`src/pages/home/HomePage.tsx`：

```tsx
import { Link } from 'react-router'

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          拒绝挂科，选课不踩雷
        </h1>
        <p className="mt-4 max-w-2xl text-slate-500">
          首页是引流入口：同时展示评课摘要与学员学习摘要。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/review" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
            去评课
          </Link>
          <Link
            to="/recommend"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800"
          >
            去选课
          </Link>
          <Link
            to="/learn"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800"
          >
            去学习
          </Link>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">评课摘要</h2>
          <p className="mt-2 text-sm text-slate-500">热门课程 / 最新评价 / 写点评入口（Mock）。</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">学习摘要</h2>
          <p className="mt-2 text-sm text-slate-500">我的课程 / 到期提醒 / 快捷入口（Mock）。</p>
        </div>
      </section>
    </div>
  )
}
```

`src/pages/review/ReviewIndexPage.tsx`：

```tsx
export default function ReviewIndexPage() {
  return <div className="text-slate-700">评课模块（占位）：课程列表 / 详情 / 写点评</div>
}
```

`src/pages/recommend/RecommendIndexPage.tsx`：

```tsx
export default function RecommendIndexPage() {
  return <div className="text-slate-700">选课模块（占位）：规则筛选 + 推荐结果</div>
}
```

`src/pages/learn/LearnIndexPage.tsx`：

```tsx
export default function LearnIndexPage() {
  return <div className="text-slate-700">学习模块（占位）：我的课程 / 课件 / 刷题 / 模考</div>
}
```

`src/pages/me/MeIndexPage.tsx`：

```tsx
export default function MeIndexPage() {
  return <div className="text-slate-700">我的（占位）：统一个人中心（评课/选课/学习分区）</div>
}
```

- [ ] **步骤 3：创建 router.tsx 并接入 Layout**

`src/app/router.tsx`：

```tsx
import { createBrowserRouter } from 'react-router'
import PublicLayout from './PublicLayout'
import HomePage from '../pages/home/HomePage'
import LearnIndexPage from '../pages/learn/LearnIndexPage'
import MeIndexPage from '../pages/me/MeIndexPage'
import RecommendIndexPage from '../pages/recommend/RecommendIndexPage'
import ReviewIndexPage from '../pages/review/ReviewIndexPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'review', Component: ReviewIndexPage },
      { path: 'recommend', Component: RecommendIndexPage },
      { path: 'learn', Component: LearnIndexPage },
      { path: 'me', Component: MeIndexPage },
    ],
  },
])
```

- [ ] **步骤 4：修改 main.tsx 使用 RouterProvider**

`src/main.tsx`：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { router } from './app/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- [ ] **步骤 5：手动验证**

运行：`npm run dev`

预期：

- `/` 展示首页（门户）
- `/review`、`/recommend`、`/learn`、`/me` 可访问并展示占位文案

- [ ] **步骤 6：Commit**

```bash
git add src/main.tsx src/app src/pages
git commit -m "feat: add public router skeleton"
```

## 2. 任务 2：增加最小登录态（Mock）与路由守卫

**文件：**
- 创建：`src/features/auth/AuthContext.tsx`
- 创建：`src/features/auth/guards.tsx`
- 创建：`src/pages/auth/AuthPage.tsx`
- 修改：`src/app/router.tsx`
- 修改：`src/app/PublicLayout.tsx`

- [ ] **步骤 1：创建 AuthContext（Mock 登录与角色）**

`src/features/auth/AuthContext.tsx`：

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Role = 'student' | 'teacher' | 'admin'

export type User = {
  id: string
  email: string
  roles: Role[]
}

type AuthState = {
  user: User | null
  loginAs: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const value = useMemo<AuthState>(() => {
    return {
      user,
      loginAs: (role) =>
        setUser({
          id: 'u_mock',
          email: 'demo@irbtree.com',
          roles: [role],
        }),
      logout: () => setUser(null),
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider is missing')
  return ctx
}
```

- [ ] **步骤 2：创建 guards（RequireAuth / RequireRole）**

`src/features/auth/guards.tsx`：

```tsx
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth, type Role } from './AuthContext'

export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function RequireRole({ anyOf }: { anyOf: Role[] }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/auth" replace />

  const ok = user.roles.some((r) => anyOf.includes(r))
  if (!ok) return <Navigate to="/" replace />

  return <Outlet />
}
```

- [ ] **步骤 3：创建 AuthPage（用于切换角色）**

`src/pages/auth/AuthPage.tsx`：

```tsx
import { useAuth, type Role } from '../../features/auth/AuthContext'
import { useLocation, useNavigate } from 'react-router'

const ROLES: { key: Role; label: string }[] = [
  { key: 'student', label: '学生' },
  { key: 'teacher', label: '教师' },
  { key: 'admin', label: '管理员' },
]

export default function AuthPage() {
  const { loginAs, logout, user } = useAuth()
  const location = useLocation() as { state?: { from?: string } }
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold">登录（Mock）</h1>
      <p className="mt-2 text-sm text-slate-500">本阶段用于演示 /learn、/me、/admin 的权限行为。</p>
      <div className="mt-6 grid gap-2">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            onClick={() => {
              loginAs(r.key)
              navigate(location.state?.from ?? '/', { replace: true })
            }}
          >
            以{r.label}身份登录
          </button>
        ))}
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800"
          onClick={logout}
        >
          退出登录
        </button>
      </div>
      <div className="mt-4 text-xs text-slate-500">当前用户：{user ? user.email : '未登录'}</div>
    </div>
  )
}
```

- [ ] **步骤 4：在 router.tsx 中接入 AuthProvider 与守卫**

更新 `src/app/router.tsx` 为：

```tsx
import { createBrowserRouter } from 'react-router'
import AdminLayout from '../admin/AdminLayout'
import DashboardPage from '../admin/pages/DashboardPage'
import ContentPlaceholderPage from '../admin/pages/content/ContentPlaceholderPage'
import ReviewsPlaceholderPage from '../admin/pages/reviews/ReviewsPlaceholderPage'
import StudentsPlaceholderPage from '../admin/pages/students/StudentsPlaceholderPage'
import SystemPlaceholderPage from '../admin/pages/system/SystemPlaceholderPage'
import { AuthProvider } from '../features/auth/AuthContext'
import { RequireAuth, RequireRole } from '../features/auth/guards'
import AuthPage from '../pages/auth/AuthPage'
import HomePage from '../pages/home/HomePage'
import LearnIndexPage from '../pages/learn/LearnIndexPage'
import MeIndexPage from '../pages/me/MeIndexPage'
import RecommendIndexPage from '../pages/recommend/RecommendIndexPage'
import ReviewIndexPage from '../pages/review/ReviewIndexPage'
import PublicLayout from './PublicLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <PublicLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, Component: HomePage },
      { path: 'auth', Component: AuthPage },
      { path: 'review', Component: ReviewIndexPage },
      { path: 'recommend', Component: RecommendIndexPage },
      {
        element: <RequireAuth />,
        children: [
          { path: 'learn', Component: LearnIndexPage },
          { path: 'me', Component: MeIndexPage },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <AuthProvider>
        <RequireRole anyOf={['admin', 'teacher']} />
      </AuthProvider>
    ),
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, Component: DashboardPage },
          { path: 'reviews', Component: ReviewsPlaceholderPage },
          { path: 'students', Component: StudentsPlaceholderPage },
          { path: 'content', Component: ContentPlaceholderPage },
          { path: 'system', Component: SystemPlaceholderPage },
        ],
      },
    ],
  },
])
```

注意：如果 `AuthProvider` 出现重复 Provider，可在实现时改成把 `AuthProvider` 提升到根并复用；实现时以能跑通为先。

- [ ] **步骤 5：更新 PublicLayout 顶栏的「我的」右侧操作（登录入口）**

将 `src/app/PublicLayout.tsx` 的顶栏右侧增加一个入口：

- 未登录：显示「登录」
- 已登录：显示「退出」

实现时使用 `useAuth()`。

- [ ] **步骤 6：手动验证**

运行：`npm run dev`

预期：

- 未登录访问 `/learn` 或 `/me` 会跳转到 `/auth`
- 未登录访问 `/admin` 会跳转到 `/auth`
- 以学生登录后访问 `/admin` 会跳回 `/`
- 以管理员或教师登录后可访问 `/admin`

- [ ] **步骤 7：Commit**

```bash
git add src/app src/features src/pages/auth src/admin
git commit -m "feat: add auth context and route guards"
```

## 3. 任务 3：建立领域类型与 Mock 数据（两张课程表 + 1:1 关联）

**文件：**
- 创建：`src/domain/types.ts`
- 创建：`src/domain/mockData.ts`
- 修改：`src/pages/review/ReviewIndexPage.tsx`
- 修改：`src/pages/learn/LearnIndexPage.tsx`

- [ ] **步骤 1：定义领域类型**

`src/domain/types.ts`：

```ts
export type Id = string

export type UniversityCourse = {
  id: Id
  code: string
  name: string
  schoolId: Id
  termId: Id
}

export type ProductCourse = {
  id: Id
  slug: string
  name: string
}

export type CourseLink = {
  id: Id
  productCourseId: Id
  universityCourseId: Id
}

export type Review = {
  id: Id
  universityCourseId: Id
  rating: number
  createdAt: string
}

export type Enrollment = {
  id: Id
  userId: Id
  productCourseId: Id
  expiresAt: string
}
```

- [ ] **步骤 2：提供 Mock 数据（含严格 1:1 映射）**

`src/domain/mockData.ts`：

```ts
import type { CourseLink, Enrollment, ProductCourse, Review, UniversityCourse } from './types'

export const universityCourses: UniversityCourse[] = [
  { id: 'uc_9021', code: 'COMP9021', name: 'Principles of Programming', schoolId: 'sch_unsw', termId: 'term_2024_t3' },
]

export const productCourses: ProductCourse[] = [
  { id: 'pc_9021', slug: 'comp9021', name: '红黑树 COMP9021 学习课' },
]

export const courseLinks: CourseLink[] = [
  { id: 'cl_1', productCourseId: 'pc_9021', universityCourseId: 'uc_9021' },
]

export const reviews: Review[] = [
  { id: 'rv_1', universityCourseId: 'uc_9021', rating: 4.8, createdAt: '2026-06-03T00:00:00+08:00' },
]

export const enrollments: Enrollment[] = [
  { id: 'en_1', userId: 'u_mock', productCourseId: 'pc_9021', expiresAt: '2026-12-31T23:59:59+08:00' },
]

export function findProductCourseByUniversityCourseId(universityCourseId: string) {
  const link = courseLinks.find((l) => l.universityCourseId === universityCourseId)
  if (!link) return null
  return productCourses.find((c) => c.id === link.productCourseId) ?? null
}

export function findUniversityCourseByProductCourseId(productCourseId: string) {
  const link = courseLinks.find((l) => l.productCourseId === productCourseId)
  if (!link) return null
  return universityCourses.find((c) => c.id === link.universityCourseId) ?? null
}
```

- [ ] **步骤 3：在评课页展示“导流到学习”入口（仅演示）**

更新 `src/pages/review/ReviewIndexPage.tsx`：

```tsx
import { Link } from 'react-router'
import { findProductCourseByUniversityCourseId, reviews, universityCourses } from '../../domain/mockData'

export default function ReviewIndexPage() {
  const course = universityCourses[0]
  const rating = reviews.find((r) => r.universityCourseId === course.id)?.rating
  const productCourse = findProductCourseByUniversityCourseId(course.id)

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold">
        {course.code} {course.name}
      </div>
      <div className="text-sm text-slate-500">评分（Mock）：{rating ?? '-'}</div>
      {productCourse ? (
        <Link to="/learn" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          去学习：{productCourse.name}
        </Link>
      ) : (
        <div className="text-sm text-slate-500">暂无对应学习课程</div>
      )}
    </div>
  )
}
```

- [ ] **步骤 4：在学习页展示“对应评课摘要”入口（仅演示）**

更新 `src/pages/learn/LearnIndexPage.tsx`：

```tsx
import { Link } from 'react-router'
import { findUniversityCourseByProductCourseId, productCourses, reviews } from '../../domain/mockData'

export default function LearnIndexPage() {
  const product = productCourses[0]
  const uni = findUniversityCourseByProductCourseId(product.id)
  const rating = uni ? reviews.find((r) => r.universityCourseId === uni.id)?.rating : null

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold">{product.name}</div>
      {uni ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-800">对应评课课程：{uni.code}</div>
          <div className="mt-1 text-sm text-slate-500">评分（Mock）：{rating ?? '-'}</div>
          <Link to="/review" className="mt-3 inline-flex text-sm font-medium text-slate-900 underline">
            查看评课详情
          </Link>
        </div>
      ) : (
        <div className="text-sm text-slate-500">暂无对应评课课程</div>
      )}
    </div>
  )
}
```

- [ ] **步骤 5：手动验证**

运行：`npm run dev`

预期：

- `/review` 页面可看到“去学习”按钮
- 登录后进入 `/learn` 页面可看到“对应评课课程”摘要

- [ ] **步骤 6：Commit**

```bash
git add src/domain src/pages/review src/pages/learn
git commit -m "feat: add mock domain models and 1to1 course link"
```

## 4. 任务 4：实现 /admin 骨架（侧边栏 + 占位页）

**文件：**
- 创建：`src/admin/AdminLayout.tsx`
- 创建：`src/admin/pages/DashboardPage.tsx`
- 创建：`src/admin/pages/reviews/ReviewsPlaceholderPage.tsx`
- 创建：`src/admin/pages/students/StudentsPlaceholderPage.tsx`
- 创建：`src/admin/pages/content/ContentPlaceholderPage.tsx`
- 创建：`src/admin/pages/system/SystemPlaceholderPage.tsx`

- [ ] **步骤 1：创建 AdminLayout**

`src/admin/AdminLayout.tsx`：

```tsx
import { NavLink, Outlet } from 'react-router'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="w-72 border-r border-slate-200 bg-white">
        <div className="px-6 py-5 text-lg font-bold">IRBTree Admin</div>
        <nav className="space-y-1 px-3 pb-6 text-sm font-medium text-slate-600">
          <AdminNavItem to="/admin" label="工作台" end />
          <AdminNavItem to="/admin/reviews" label="评课治理" />
          <AdminNavItem to="/admin/students" label="学员付费" />
          <AdminNavItem to="/admin/content" label="学习内容" />
          <AdminNavItem to="/admin/system" label="系统" />
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

function AdminNavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-xl px-4 py-2 ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`
      }
    >
      {label}
    </NavLink>
  )
}
```

- [ ] **步骤 2：创建占位页**

`src/admin/pages/DashboardPage.tsx`：

```tsx
export default function DashboardPage() {
  return <div className="text-lg font-bold">工作台（占位）</div>
}
```

其余占位页：输出对应分组的说明文本即可。

- [ ] **步骤 3：手动验证**

运行：`npm run dev`

预期：

- 使用管理员/教师登录后访问 `/admin` 可见侧边栏与占位页
- 使用学生登录访问 `/admin` 会跳回 `/`

- [ ] **步骤 4：Commit**

```bash
git add src/admin
git commit -m "feat: add /admin layout and placeholder pages"
```

## 5. 任务 5：引入最小化测试（可选但推荐）

> 若当前阶段不引入测试框架，可跳过本任务；但后续做权限/路由与模块开发时建议尽早补齐。

**文件：**
- 修改：`package.json`
- 创建：`vitest.config.ts`
- 创建：`src/test/setup.ts`
- 创建：`src/app/router.test.tsx`

- [ ] **步骤 1：安装测试依赖**

运行：

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **步骤 2：增加 test script**

在 `package.json` 的 `scripts` 增加：

```json
{
  "test": "vitest run"
}
```

- [ ] **步骤 3：添加 Vitest 配置**

`vitest.config.ts`：

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **步骤 4：添加测试 setup**

`src/test/setup.ts`：

```ts
import '@testing-library/jest-dom'
```

- [ ] **步骤 5：添加最小路由测试（只验证能渲染）**

`src/app/router.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router/dom'
import { describe, it, expect } from 'vitest'
import { router } from './router'

describe('router', () => {
  it('renders home', async () => {
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('拒绝挂科，选课不踩雷')).toBeInTheDocument()
  })
})
```

- [ ] **步骤 6：运行测试验证通过**

运行：`npm test`

预期：PASS

- [ ] **步骤 7：Commit**

```bash
git add package.json vitest.config.ts src/test src/app/router.test.tsx
git commit -m "test: add vitest and minimal router test"
```

## 6. 收尾验证（信息架构阶段验收）

- [ ] 运行 `npm run lint`，预期：无错误
- [ ] 运行 `npm run build`，预期：构建成功
- [ ] 手动检查：
  - `/`、`/review`、`/recommend` 可匿名访问
  - `/learn`、`/me` 未登录会跳到 `/auth`
  - `/admin` 仅管理员/教师可访问
  - `/review` 与 `/learn` 页面演示了 CourseLink 1:1 的双向导流

---

## 执行交接

计划已完成并保存到 `docs/superpowers/plans/2026-06-03-irbtree-merge-ia-implementation-plan.md`。两种执行方式：

1. **子代理驱动（推荐）**：使用 superpowers:subagent-driven-development，把每个任务拆给独立子代理，任务间进行审查再继续。
2. **内联执行**：使用 superpowers:executing-plans，在当前会话按任务批量实现，并在关键节点停下来确认。

请选择一种执行方式后再开始写代码。

