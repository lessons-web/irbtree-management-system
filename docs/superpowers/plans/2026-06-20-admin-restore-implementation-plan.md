# Admin 端 1:1 还原实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将当前占位式 React 后台重建为与 `docs/admin.html` 对齐的桌面端 Admin 后台，包含 9 个独立管理页面、完整后台壳和 mock 驱动交互。

**架构：** 先把后台路由与布局壳从现有 5 个占位页面升级为独立 IA，再提炼后台复用组件和页面级 mock 数据，最后用统一表格页模式铺开 9 个页面并补布局级测试。实现保持 React + Tailwind 现有风格，但以原型视觉结构为最高参考。

**技术栈：** React 19、React Router 7、TypeScript、Tailwind CSS、Vitest、Testing Library

---

## 文件结构

### 修改文件

- `src/app/router.tsx`
  - 将后台路由从 5 个占位分组改为 9 个独立页面与默认重定向
- `src/app/router.test.tsx`
  - 将后台相关断言更新为新路由与新导航结构
- `src/features/auth/AuthContext.tsx`
  - 如有必要，收敛 demo 账号的后台访问能力，避免 student 默认可进后台
- `src/components/user/UserHeader.tsx`
  - 如有必要，收敛用户端中 Admin 入口的展示条件

### 创建文件

- `src/admin/layouts/AdminLayout.tsx`
  - 新后台整体壳，整合侧栏、Header、通知抽屉和内容区
- `src/admin/config/navigation.ts`
  - 后台导航配置、标题映射与系统设置子项定义
- `src/admin/types/admin.ts`
  - 后台共享类型定义
- `src/admin/data/courses.ts`
- `src/admin/data/reviews.ts`
- `src/admin/data/universities.ts`
- `src/admin/data/teachers.ts`
- `src/admin/data/semesters.ts`
- `src/admin/data/tags.ts`
- `src/admin/data/users.ts`
- `src/admin/data/messages.ts`
- `src/admin/data/logs.ts`
  - 各页面 mock 数据
- `src/admin/components/AdminSidebar.tsx`
- `src/admin/components/AdminHeader.tsx`
- `src/admin/components/AdminPageShell.tsx`
- `src/admin/components/AdminActionBar.tsx`
- `src/admin/components/AdminTableCard.tsx`
- `src/admin/components/AdminStatusBadge.tsx`
- `src/admin/components/AdminSectionTitle.tsx`
- `src/admin/components/AdminNotificationDrawer.tsx`
- `src/admin/components/AdminFormDrawer.tsx`
- `src/admin/components/AdminConfirmModal.tsx`
- `src/admin/components/AdminPageTable.tsx`
- `src/admin/components/useAdminTableState.ts`
  - 后台共享 UI 组件与页面筛选分页逻辑
- `src/admin/pages/courses/CoursesAdminPage.tsx`
- `src/admin/pages/reviews/ReviewsAdminPage.tsx`
- `src/admin/pages/universities/UniversitiesAdminPage.tsx`
- `src/admin/pages/teachers/TeachersAdminPage.tsx`
- `src/admin/pages/semesters/SemestersAdminPage.tsx`
- `src/admin/pages/tags/TagsAdminPage.tsx`
- `src/admin/pages/users/UsersAdminPage.tsx`
- `src/admin/pages/messages/MessagesAdminPage.tsx`
- `src/admin/pages/logs/LogsAdminPage.tsx`
  - 九个后台页面

### 删除文件

- `src/admin/AdminLayout.tsx`
- `src/admin/pages/DashboardPage.tsx`
- `src/admin/pages/content/ContentPlaceholderPage.tsx`
- `src/admin/pages/reviews/ReviewsPlaceholderPage.tsx`
- `src/admin/pages/students/StudentsPlaceholderPage.tsx`
- `src/admin/pages/system/SystemPlaceholderPage.tsx`
  - 旧的占位后台资产

## 任务 1：锁定后台路由骨架

**文件：**
- 创建：`src/admin/layouts/AdminLayout.tsx`
- 创建：`src/admin/config/navigation.ts`
- 修改：`src/app/router.tsx`
- 测试：`src/app/router.test.tsx`

- [ ] **步骤 1：编写失败的路由测试**

```tsx
it('redirects /admin to /admin/courses and renders the full admin navigation', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/auth'] })

  render(<RouterProvider router={memoryRouter} />)
  fireEvent.click(await screen.findByRole('button', { name: '进入演示系统' }))

  await act(async () => {
    await memoryRouter.navigate('/admin')
  })

  expect(await screen.findByRole('heading', { name: '课程管理' })).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/admin/courses')
  expect(screen.getByRole('link', { name: '课程管理' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '系统设置' })).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/app/router.test.tsx`
预期：FAIL，报错找不到 `/admin/courses` 或找不到新导航项。

- [ ] **步骤 3：实现最少后台 IA 骨架**

```tsx
// src/app/router.tsx
{
  path: 'admin',
  element: <RequireRole anyOf={['admin', 'teacher']} />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="/admin/courses" replace /> },
        { path: 'courses', Component: CoursesAdminPage },
        { path: 'reviews', Component: ReviewsAdminPage },
        { path: 'universities', Component: UniversitiesAdminPage },
        { path: 'teachers', Component: TeachersAdminPage },
        { path: 'semesters', Component: SemestersAdminPage },
        { path: 'tags', Component: TagsAdminPage },
        { path: 'users', Component: UsersAdminPage },
        { path: 'messages', Component: MessagesAdminPage },
        { path: 'logs', Component: LogsAdminPage },
      ],
    },
  ],
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/app/router.test.tsx`
预期：PASS，新测试可进入 `/admin/courses`，旧后台断言需同步调整。

- [ ] **步骤 5：Commit**

```bash
git add src/app/router.tsx src/app/router.test.tsx src/admin/layouts/AdminLayout.tsx src/admin/config/navigation.ts
git commit -m "feat: scaffold admin route structure"
```

## 任务 2：搭建后台布局壳与共享容器

**文件：**
- 创建：`src/admin/components/AdminSidebar.tsx`
- 创建：`src/admin/components/AdminHeader.tsx`
- 创建：`src/admin/components/AdminPageShell.tsx`
- 创建：`src/admin/components/AdminNotificationDrawer.tsx`
- 创建：`src/admin/components/AdminFormDrawer.tsx`
- 创建：`src/admin/components/AdminConfirmModal.tsx`
- 创建：`src/admin/components/AdminStatusBadge.tsx`
- 修改：`src/admin/layouts/AdminLayout.tsx`
- 复用：`src/components/common/Drawer.tsx`
- 复用：`src/components/common/Modal.tsx`

- [ ] **步骤 1：补布局级测试**

```tsx
it('shows admin header controls and system submenu entries', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/auth'] })

  render(<RouterProvider router={memoryRouter} />)
  fireEvent.click(await screen.findByRole('button', { name: '进入演示系统' }))

  await act(async () => {
    await memoryRouter.navigate('/admin/courses')
  })

  expect(await screen.findByRole('button', { name: /通知/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /管理员菜单/ })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '系统设置' }))
  expect(screen.getByRole('link', { name: '消息管理' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '系统日志' })).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/app/router.test.tsx`
预期：FAIL，缺少顶部按钮、系统设置子项或 Header 结构。

- [ ] **步骤 3：实现后台布局壳**

```tsx
export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [systemOpen, setSystemOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        systemOpen={systemOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onToggleSystem={() => setSystemOpen((value) => !value)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          onOpenNotifications={() => setNotificationsOpen(true)}
          onToggleMenu={() => setMenuOpen((value) => !value)}
          menuOpen={menuOpen}
        />
        <AdminPageShell>
          <Outlet />
        </AdminPageShell>
      </div>
      <AdminNotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  )
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/app/router.test.tsx`
预期：PASS，布局测试可看到 Header 控件和系统设置子项。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/layouts/AdminLayout.tsx src/admin/components
git commit -m "feat: build admin shell components"
```

## 任务 3：建立后台共享类型与 mock 数据

**文件：**
- 创建：`src/admin/types/admin.ts`
- 创建：`src/admin/data/courses.ts`
- 创建：`src/admin/data/reviews.ts`
- 创建：`src/admin/data/universities.ts`
- 创建：`src/admin/data/teachers.ts`
- 创建：`src/admin/data/semesters.ts`
- 创建：`src/admin/data/tags.ts`
- 创建：`src/admin/data/users.ts`
- 创建：`src/admin/data/messages.ts`
- 创建：`src/admin/data/logs.ts`

- [ ] **步骤 1：先定义共享类型**

```ts
export type AdminStatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

export type AdminTableRow = {
  id: string
  status: string
}

export type CourseAdminRow = AdminTableRow & {
  code: string
  name: string
  university: string
  credits: number
  teacher: string
  tutor: string
  summary: string
}
```

- [ ] **步骤 2：填充页面 mock 数据文件**

```ts
export const courseRows: CourseAdminRow[] = [
  {
    id: 'course-comp9021',
    code: 'COMP9021',
    name: 'Principles of Programming',
    university: 'UNSW',
    credits: 6,
    teacher: 'Dr. James Smith',
    tutor: 'Alice Chen',
    summary: 'Python 基础与抽象能力训练',
    status: '已上线',
  },
]
```

- [ ] **步骤 3：为每页补筛选选项与详情数据**

```ts
export const courseUniversityOptions = ['所有院校', 'UNSW', 'USYD', 'Melbourne', 'UQ', 'Monash']

export const courseDraft = {
  code: '',
  name: '',
  university: 'UNSW',
  credits: 6,
  teacher: '',
  tutor: '',
  summary: '',
}
```

- [ ] **步骤 4：用类型检查验证数据层**

运行：`npm run build`
预期：PASS，`src/admin/data/*` 与 `src/admin/types/admin.ts` 无类型错误。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/types/admin.ts src/admin/data
git commit -m "feat: add admin mock datasets"
```

## 任务 4：抽出后台表格页基础设施

**文件：**
- 创建：`src/admin/components/AdminActionBar.tsx`
- 创建：`src/admin/components/AdminTableCard.tsx`
- 创建：`src/admin/components/AdminPageTable.tsx`
- 创建：`src/admin/components/AdminSectionTitle.tsx`
- 创建：`src/admin/components/useAdminTableState.ts`
- 复用：`src/components/common/Pagination.tsx`

- [ ] **步骤 1：先写表格状态 hook**

```ts
export function useAdminTableState<T>(rows: T[], pageSize = 8) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const pagedRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize])

  return {
    query,
    setQuery,
    page,
    setPage,
    pagedRows,
    totalItems: rows.length,
  }
}
```

- [ ] **步骤 2：封装表格容器和操作栏**

```tsx
<AdminActionBar
  searchPlaceholder="搜索课程代码或名称..."
  query={query}
  onQueryChange={setQuery}
  filters={<select>{/* options */}</select>}
  primaryAction={{ label: '新增课程', onClick: () => setDrawerOpen(true) }}
/>

<AdminTableCard>
  <AdminPageTable columns={columns} rows={pagedRows} />
  <Pagination currentPage={page} pageSize={8} totalItems={totalItems} onPageChange={setPage} />
</AdminTableCard>
```

- [ ] **步骤 3：创建统一状态标签**

```tsx
export default function AdminStatusBadge({ label, tone }: { label: string; tone: AdminStatusTone }) {
  const toneClass = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-rose-50 text-rose-700 ring-rose-200',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
    info: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  }[tone]

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClass}`}>{label}</span>
}
```

- [ ] **步骤 4：运行构建验证基础设施**

运行：`npm run build`
预期：PASS，后台共享组件可被页面直接复用。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/components/AdminActionBar.tsx src/admin/components/AdminTableCard.tsx src/admin/components/AdminPageTable.tsx src/admin/components/AdminSectionTitle.tsx src/admin/components/useAdminTableState.ts
git commit -m "feat: add admin table page primitives"
```

## 任务 5：落地课程、评价、院校、教师页面

**文件：**
- 创建：`src/admin/pages/courses/CoursesAdminPage.tsx`
- 创建：`src/admin/pages/reviews/ReviewsAdminPage.tsx`
- 创建：`src/admin/pages/universities/UniversitiesAdminPage.tsx`
- 创建：`src/admin/pages/teachers/TeachersAdminPage.tsx`
- 依赖：`src/admin/data/courses.ts`
- 依赖：`src/admin/data/reviews.ts`
- 依赖：`src/admin/data/universities.ts`
- 依赖：`src/admin/data/teachers.ts`

- [ ] **步骤 1：实现课程管理页**

```tsx
export default function CoursesAdminPage() {
  const { query, setQuery, page, setPage, pagedRows, totalItems } = useAdminTableState(courseRows)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <AdminSectionTitle title="课程管理" description="维护课程信息、教师与状态。" />
      <AdminActionBar
        searchPlaceholder="搜索课程代码或名称..."
        query={query}
        onQueryChange={setQuery}
        filters={<CourseUniversityFilter />}
        primaryAction={{ label: '新增课程', onClick: () => setDrawerOpen(true) }}
      />
      <AdminTableCard>{/* 课程表格与分页 */}</AdminTableCard>
      <AdminFormDrawer open={drawerOpen} title="新增课程" onClose={() => setDrawerOpen(false)}>{/* 表单 */}</AdminFormDrawer>
    </>
  )
}
```

- [ ] **步骤 2：按同一模式实现其他三页**

```tsx
export default function ReviewsAdminPage() {
  return <AdminEntityListPage title="评价管理" rows={reviewRows} />
}
```

- [ ] **步骤 3：运行路由级测试与构建**

运行：`npm test -- src/app/router.test.tsx && npm run build`
预期：PASS，四个页面可以正常渲染，不报类型错误。

- [ ] **步骤 4：人工核对原型视觉**

运行：`npm run dev`
预期：本地打开 `/admin/courses`、`/admin/reviews`、`/admin/universities`、`/admin/teachers` 时，操作栏、表头、分页和抽屉位置接近原型。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/pages/courses src/admin/pages/reviews src/admin/pages/universities src/admin/pages/teachers
git commit -m "feat: restore core admin management pages"
```

## 任务 6：落地学期、标签、用户、消息、日志页面

**文件：**
- 创建：`src/admin/pages/semesters/SemestersAdminPage.tsx`
- 创建：`src/admin/pages/tags/TagsAdminPage.tsx`
- 创建：`src/admin/pages/users/UsersAdminPage.tsx`
- 创建：`src/admin/pages/messages/MessagesAdminPage.tsx`
- 创建：`src/admin/pages/logs/LogsAdminPage.tsx`
- 依赖：`src/admin/data/semesters.ts`
- 依赖：`src/admin/data/tags.ts`
- 依赖：`src/admin/data/users.ts`
- 依赖：`src/admin/data/messages.ts`
- 依赖：`src/admin/data/logs.ts`

- [ ] **步骤 1：实现学期、标签、用户页面**

```tsx
export default function UsersAdminPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <>
      <AdminSectionTitle title="用户管理" description="维护用户角色与账号状态。" />
      <AdminActionBar searchPlaceholder="搜索昵称或邮箱..." query={query} onQueryChange={setQuery} />
      <AdminTableCard>{/* 用户列表 */}</AdminTableCard>
      <AdminConfirmModal open={confirmOpen} title="确认停用账号" onClose={() => setConfirmOpen(false)}>{/* 确认文案 */}</AdminConfirmModal>
    </>
  )
}
```

- [ ] **步骤 2：实现消息与日志页面**

```tsx
export default function MessagesAdminPage() {
  return (
    <>
      <AdminSectionTitle title="消息管理" description="维护站内通知与发送状态。" />
      <AdminActionBar searchPlaceholder="搜索消息标题..." query={query} onQueryChange={setQuery} primaryAction={{ label: '新建消息', onClick: () => setDrawerOpen(true) }} />
      <AdminTableCard>{/* 消息列表 */}</AdminTableCard>
    </>
  )
}
```

- [ ] **步骤 3：运行全量后台测试与构建**

运行：`npm test -- src/app/router.test.tsx && npm run build`
预期：PASS，九个页面路由都可解析。

- [ ] **步骤 4：人工浏览系统设置子菜单**

运行：`npm run dev`
预期：点击“系统设置”后能看到“消息管理”“系统日志”，切换不出现布局错乱。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/pages/semesters src/admin/pages/tags src/admin/pages/users src/admin/pages/messages src/admin/pages/logs
git commit -m "feat: restore remaining admin pages"
```

## 任务 7：收尾权限、清理旧文件并补最终测试

**文件：**
- 修改：`src/features/auth/AuthContext.tsx`
- 修改：`src/components/user/UserHeader.tsx`
- 删除：`src/admin/AdminLayout.tsx`
- 删除：`src/admin/pages/DashboardPage.tsx`
- 删除：`src/admin/pages/content/ContentPlaceholderPage.tsx`
- 删除：`src/admin/pages/reviews/ReviewsPlaceholderPage.tsx`
- 删除：`src/admin/pages/students/StudentsPlaceholderPage.tsx`
- 删除：`src/admin/pages/system/SystemPlaceholderPage.tsx`
- 修改：`src/app/router.test.tsx`

- [ ] **步骤 1：调整后台入口可见性**

```tsx
const showAdminEntry = auth.isAuthenticated && (auth.role === 'admin' || auth.role === 'teacher')
```

- [ ] **步骤 2：删除旧占位后台文件**

运行：`git rm src/admin/AdminLayout.tsx src/admin/pages/DashboardPage.tsx src/admin/pages/content/ContentPlaceholderPage.tsx src/admin/pages/reviews/ReviewsPlaceholderPage.tsx src/admin/pages/students/StudentsPlaceholderPage.tsx src/admin/pages/system/SystemPlaceholderPage.tsx`
预期：旧文件移除，引用全部切到新结构。

- [ ] **步骤 3：运行最终验证**

运行：`npm run lint && npm test && npm run build`
预期：全部 PASS，无新增 ESLint、Vitest、TypeScript 错误。

- [ ] **步骤 4：手动检查关键路径**

运行：`npm run dev`
预期：验证 `/admin`、`/admin/messages`、`/admin/logs`、通知抽屉、管理员菜单、切换用户端入口都可用。

- [ ] **步骤 5：Commit**

```bash
git add src/app/router.tsx src/app/router.test.tsx src/features/auth/AuthContext.tsx src/components/user/UserHeader.tsx src/admin
git commit -m "feat: finish admin restore"
```

## 自检结果

- 规格覆盖度：已覆盖路由拆分、后台壳、共享组件、mock 数据、九个页面、权限收敛、测试与验证。
- 占位符扫描：计划中没有 `TODO`、`待定`、`后续实现` 等占位词。
- 类型一致性：统一使用 `AdminLayout`、`AdminActionBar`、`AdminTableCard`、`AdminFormDrawer`、`AdminConfirmModal`、`useAdminTableState` 等名称，避免任务间命名漂移。
