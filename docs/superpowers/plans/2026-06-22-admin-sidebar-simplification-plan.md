# Admin Layout 侧栏简化与课程中心直达实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 让后台 Sidebar 与 Header 顶部对齐、菜单改为纯白直角样式，并将 `课程中心` 收敛为默认直达课程列表的一级入口。

**架构：** 在不改动后台整体信息架构的前提下，先通过测试固定新的导航与路由语义，再收敛 `AdminLayout` 的 Sidebar/Header 壳层样式。`课程关系视图` 作为已下线页面从导航、路由和测试中同时移除，避免留下孤立入口。

**技术栈：** React 19、React Router 7、TypeScript、Tailwind v4、Vitest、Testing Library

---

## 文件结构

### 需要修改

- `src/admin/config/navigationGroups.ts`
  - 将 `adminDefaultPath` 从 `/admin/course-center/courses` 收敛到 `/admin/course-center`
  - 移除 `课程关系视图` 与相关标题映射
  - 让 `课程中心` 的 `items` 变为空数组，交由一级入口直达课程列表
- `src/app/router.tsx`
  - 删除 `CourseRelationsPage` import
  - 将 `course-center` 从带子路由的分组改成直接挂载 `CoursesAdminPage`
  - 保留 `/admin/courses` 到新默认路径的兼容跳转
- `src/admin/AdminLayout.tsx`
  - 对齐 Sidebar 品牌区与 Header 高度
  - 收敛 Sidebar 为白底、直角菜单、无圆角二级卡片
  - 保留整栏折叠与现有通知/管理员菜单行为
- `src/admin/pages/AdminDomainNavigation.test.tsx`
  - 固定新的后台导航结构、默认路径与样式类断言
- `src/app/router.test.tsx`
  - 固定 `/admin` 进入后的新默认路径和左侧菜单可见性

### 需要删除

- `src/admin/pages/course-center/CourseRelationsPage.tsx`
  - 页面已下线，不再保留空壳实现

### 需要验证

- `docs/superpowers/specs/2026-06-22-admin-sidebar-simplification-design.md`
  - 对照规格确认每一项需求都有任务覆盖

### 参考文件

- `src/admin/config/navigation.ts`
  - 仅 re-export 导航配置，无需单独改逻辑，但变更后要确认导出仍然正确

## 任务 1：收敛课程中心导航与路由语义

**文件：**
- 修改：`src/admin/pages/AdminDomainNavigation.test.tsx`
- 修改：`src/app/router.test.tsx`
- 修改：`src/admin/config/navigationGroups.ts`
- 修改：`src/app/router.tsx`
- 删除：`src/admin/pages/course-center/CourseRelationsPage.tsx`

- [ ] **步骤 1：先把导航与路由语义测试改成目标行为**

在 `src/admin/pages/AdminDomainNavigation.test.tsx` 中，把 `课程中心` 从“一级 + 二级”改成“一级直达”的断言，并移除 `课程关系视图` 页面存在性的测试：

```tsx
it('renders five top-level admin groups and defaults to course center', async () => {
  const memoryRouter = await renderAdminRoute('/admin')

  const courseCenterLink = await screen.findByRole('link', { name: '课程中心' })
  expect(courseCenterLink).toHaveAttribute('href', '/admin/course-center')
  expect(screen.queryByRole('link', { name: '课程列表' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: '课程关系视图' })).not.toBeInTheDocument()

  await waitFor(() => {
    expect(memoryRouter.state.location.pathname).toBe('/admin/course-center')
  })
})

it.each([
  ['/admin/course-center', '课程列表'],
  ['/admin/courses', '课程列表'],
  ['/admin/review-management', '评价管理'],
])('maps grouped admin path %s to the page title %s', (path, expectedTitle) => {
  expect(getAdminPageTitle(path)).toBe(expectedTitle)
})
```

同步在 `src/app/router.test.tsx` 更新后台入口断言：

```tsx
expect(memoryRouter.state.location.pathname).toBe('/admin/course-center')
expect(screen.getByRole('link', { name: '课程中心' })).toBeInTheDocument()
expect(screen.queryByRole('link', { name: '课程列表' })).not.toBeInTheDocument()
```

- [ ] **步骤 2：运行相关测试，确认它们先失败**

运行：

```bash
npm test -- src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx
```

预期：

- `AdminDomainNavigation.test.tsx` 仍会找到旧的 `课程列表`、`课程关系视图`
- `router.test.tsx` 仍会看到旧的 `/admin/course-center/courses`
- 至少 1 个断言失败，证明测试先锁定了新行为

- [ ] **步骤 3：实现新的导航配置与路由结构**

先在 `src/admin/config/navigationGroups.ts` 中收敛默认路径与 `课程中心` 分组：

```ts
export const adminDefaultPath = '/admin/course-center'

export const adminNavGroups: AdminNavGroup[] = [
  {
    key: 'course-center',
    label: '课程中心',
    basePath: adminDefaultPath,
    items: [],
  },
  {
    key: 'review-management',
    label: '评课管理',
    basePath: '/admin/review-management',
    items: [
      { to: '/admin/review-management/reviews', label: '评价管理' },
      { to: '/admin/review-management/universities', label: '院校管理' },
      { to: '/admin/review-management/teachers', label: '教师管理' },
      { to: '/admin/review-management/semesters', label: '学期管理' },
    ],
  },
]

export const adminPageTitles = new Map<string, string>([
  [adminDefaultPath, '课程列表'],
  ['/admin/courses', '课程列表'],
])
```

再在 `src/app/router.tsx` 中把 `course-center` 改成直接页面路由，并移除 `CourseRelationsPage`：

```tsx
import CoursesAdminPage from '../admin/pages/courses/CoursesAdminPage'

{
  element: <AdminLayout />,
  children: [
    { index: true, element: <PathAlias to={adminDefaultPath} /> },
    { path: 'course-center', Component: CoursesAdminPage },
    {
      path: 'review-management',
      children: [
        { index: true, element: <PathAlias to="/admin/review-management/reviews" /> },
        { path: 'reviews', Component: ReviewsAdminPage },
      ],
    },
    { path: 'courses', element: <PathAlias to={adminDefaultPath} /> },
  ],
}
```

最后删除 `src/admin/pages/course-center/CourseRelationsPage.tsx`，避免残留已下线页面。

- [ ] **步骤 4：重新运行导航与路由测试，确认语义已经落地**

运行：

```bash
npm test -- src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx
```

预期：

- `AdminDomainNavigation.test.tsx` 通过，且不再引用 `课程关系视图`
- `router.test.tsx` 通过，后台默认地址变为 `/admin/course-center`

- [ ] **步骤 5：提交这一轮导航/路由收敛**

```bash
git add src/admin/config/navigationGroups.ts src/app/router.tsx src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx src/admin/pages/course-center/CourseRelationsPage.tsx
git commit -m "refactor: simplify admin course center navigation"
```

## 任务 2：收敛 Sidebar 壳层样式并保留整栏折叠

**文件：**
- 修改：`src/admin/pages/AdminDomainNavigation.test.tsx`
- 修改：`src/admin/AdminLayout.tsx`

- [ ] **步骤 1：先为侧栏壳层补一组结构化样式断言**

在 `src/admin/pages/AdminDomainNavigation.test.tsx` 中，让渲染辅助函数返回 `container`，然后增加一个聚焦壳层结构的测试，覆盖顶部对齐和白底直角菜单：

```tsx
async function renderAdminRoute(initialEntry: string) {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: [initialEntry] })
  const renderResult = render(<RouterProvider router={memoryRouter} />)

  fireEvent.click(await screen.findByRole('button', { name: '进入演示系统' }))

  return { memoryRouter, ...renderResult }
}

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
```

- [ ] **步骤 2：运行测试，确认当前旧样式会让断言失败**

运行：

```bash
npm test -- src/admin/pages/AdminDomainNavigation.test.tsx
```

预期：

- 旧的 `AdminLayout` 仍是 `bg-slate-50/95`
- 品牌区还没有 `h-16`
- 菜单链接仍含有 `rounded-2xl`

- [ ] **步骤 3：收敛 `AdminLayout` 的 Sidebar/Header 样式**

在 `src/admin/AdminLayout.tsx` 中只改壳层样式，不改交互状态：

```tsx
<aside
  className={`hidden shrink-0 border-r border-slate-200 bg-white transition-all duration-300 lg:flex lg:flex-col ${
    sidebarCollapsed ? 'w-24' : 'w-72'
  }`}
>
  <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      className="h-9 w-9 bg-white p-1 ring-1 ring-slate-200"
    />
    {!sidebarCollapsed ? (
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-slate-900">IRBTree Admin</p>
        <p className="text-xs text-slate-500">课程管理与治理后台</p>
      </div>
    ) : null}
  </div>

  <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm font-medium text-slate-600">
    {!sidebarCollapsed && group.items.length > 0 ? (
      <div className="space-y-1 border-l border-slate-200 pl-3">
        {group.items.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            label={item.label}
            collapsed={false}
            inset
            variant="subtle"
            active={matchesAdminRoute(pathname, item.to)}
          />
        ))}
      </div>
    ) : null}
  </nav>

  <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
```

同时把 `SidebarLink` 从圆角胶囊改成直角列表项：

```tsx
<NavLink
  to={to}
  className={`relative flex items-center px-4 py-3 transition ${
    inset ? 'pl-5' : ''
  } ${
    active
      ? variant === 'subtle'
        ? 'bg-brand-50 text-brand-700'
        : 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`}
>
  <span
    aria-hidden="true"
    className={`absolute top-2 bottom-2 left-0 w-0.5 transition ${
      active ? (variant === 'subtle' ? 'bg-brand-300' : 'bg-brand-500') : 'bg-transparent'
    }`}
  />
```

- [ ] **步骤 4：重新运行侧栏测试，确认新壳层通过**

运行：

```bash
npm test -- src/admin/pages/AdminDomainNavigation.test.tsx
```

预期：

- 顶部品牌区与 Header 都带 `h-16`
- Sidebar 为白底
- 一级、二级菜单容器不再带 `rounded-2xl`

- [ ] **步骤 5：提交这一轮壳层样式收敛**

```bash
git add src/admin/AdminLayout.tsx src/admin/pages/AdminDomainNavigation.test.tsx
git commit -m "style: flatten admin sidebar shell"
```

## 任务 3：做回归验证并清理尾项

**文件：**
- 修改：`src/admin/AdminLayout.tsx`（若 lint 或测试要求微调）
- 修改：`src/admin/config/navigationGroups.ts`（若标题映射或路径需要补齐）
- 修改：`src/app/router.tsx`（若路由兼容性需要补齐）
- 修改：`src/admin/pages/AdminDomainNavigation.test.tsx`
- 修改：`src/app/router.test.tsx`

- [ ] **步骤 1：跑完整的定向自动化验证**

运行：

```bash
npm test -- src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx
npm run lint -- src/admin/AdminLayout.tsx src/admin/config/navigationGroups.ts src/app/router.tsx src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx
```

预期：

- 两个测试文件全部通过
- ESLint 对改动文件无报错

- [ ] **步骤 2：做一次手动后台烟雾验证**

运行：

```bash
npm run dev
```

在浏览器里人工确认：

- `/admin` 进入后首屏是课程列表
- `课程中心` 左侧没有二级菜单
- `评课管理` 等分组仍能展开展示二级菜单
- Sidebar 品牌区与 Header 顶部高度一致
- 菜单与二级菜单均为白底直角样式
- 折叠按钮仍可正常收起/展开整栏

- [ ] **步骤 3：如果回归中发现轻微问题，做最小修补**

优先只修补与本需求直接相关的细节，例如标题映射遗漏、某个旧路径仍落到已删除页面、二级菜单缩进过深等。修补时保持以下代码边界：

```ts
// 只修正 adminDefaultPath、标题映射和 grouped path
export const adminPageTitles = new Map<string, string>([
  ['/admin/course-center', '课程列表'],
  ['/admin/courses', '课程列表'],
  ['/admin/review-management/reviews', '评价管理'],
])
```

```tsx
// 只修正 SidebarLink 或 group.items 容器样式，不扩散到其他后台组件
<div className="space-y-1 border-l border-slate-200 pl-3">
  {group.items.map((item) => (
    <SidebarLink key={item.to} to={item.to} label={item.label} collapsed={false} inset variant="subtle" active={matchesAdminRoute(pathname, item.to)} />
  ))}
</div>
```

- [ ] **步骤 4：重新跑验证，确保修补没有回归**

运行：

```bash
npm test -- src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx
npm run lint -- src/admin/AdminLayout.tsx src/admin/config/navigationGroups.ts src/app/router.tsx src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx
```

预期：

- 所有自动化验证继续通过
- 手动烟雾验证结果与规格一致

- [ ] **步骤 5：提交最终实现**

```bash
git add src/admin/AdminLayout.tsx src/admin/config/navigationGroups.ts src/app/router.tsx src/admin/pages/AdminDomainNavigation.test.tsx src/app/router.test.tsx
git commit -m "feat: simplify admin sidebar layout"
```
