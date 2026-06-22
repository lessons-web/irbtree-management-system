# Admin 域扩展第一阶段实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将现有后台重构为“课程中心 / 评课管理 / 学员管理 / 题库管理 / 系统管理”五大一级菜单，并落地课程中心、学员管理骨架和题库管理占位结构。

**架构：** 保留现有 `src/admin` 单一后台架构，先重构导航与路由分组，再把已有后台页面迁移到新的域路由下，最后新增学员管理与题库管理的运行时数据和页面骨架。第一阶段继续使用前端内存态数据，不接后端。

**技术栈：** React 19、TypeScript、React Router、Vitest、React Testing Library、Tailwind CSS

---

## 文件结构

### 新建文件

- `src/admin/config/navigationGroups.ts`
  - 定义新的一级菜单 + 二级菜单分组结构、默认展开组、页面标题映射
- `src/admin/pages/course-center/CourseRelationsPage.tsx`
  - 课程中心的关系视图占位页
- `src/admin/pages/students/StudentsAdminPage.tsx`
  - 学员列表页
- `src/admin/pages/students/StudentDetailPage.tsx`
  - 学员详情页
- `src/admin/pages/students/studentsAdminData.ts`
  - 学员域 mock 数据派生与展示辅助逻辑
- `src/admin/pages/problem-bank/ProblemsAdminPage.tsx`
  - 题库题目列表占位页
- `src/admin/pages/problem-bank/ProblemTagsAdminPage.tsx`
  - 题库标签管理页或占位页
- `src/admin/pages/problem-bank/ExamPapersAdminPage.tsx`
  - 试卷管理占位页
- `src/admin/pages/problem-bank/ProblemAssetsAdminPage.tsx`
  - 资源模板占位页
- `src/admin/pages/AdminDomainNavigation.test.tsx`
  - 新导航与新路由分组测试
- `src/admin/pages/StudentsAdminPage.test.tsx`
  - 学员管理页面测试

### 修改文件

- `src/app/router.tsx`
  - 将后台路由迁移为域分组结构，并增加兼容旧路径的重定向
- `src/admin/AdminLayout.tsx`
  - 从扁平导航升级为一级菜单 + 二级菜单渲染
- `src/admin/config/navigation.ts`
  - 迁移或精简旧导航配置，保留兼容导出或废弃后删除
- `src/admin/data/index.ts`
  - 补充共享课程引用和学员、题库所需基础 mock
- `src/admin/context/AdminRuntimeContext.tsx`
  - 扩展 runtime 数据，纳入 students、enrollments、payments、studentNotes、classGroups、problems、problemTags、examPapers、problemAssets
- `src/admin/types/admin.ts`
  - 新增学员域和题库域的类型定义，以及分组导航类型
- `src/admin/pages/courses/CoursesAdminPage.tsx`
  - 迁移到课程中心语义下，保留现有页面能力
- `src/admin/pages/AdminPageBehaviors.test.tsx`
  - 调整旧后台页面路径断言，保证新结构下依然可访问

### 参考文件

- `docs/superpowers/specs/2026-06-21-admin-domain-expansion-design.md`
- `src/admin/config/navigation.ts`
- `src/admin/AdminLayout.tsx`
- `src/app/router.tsx`
- `src/admin/context/AdminRuntimeContext.tsx`
- `src/admin/pages/users/UsersAdminPage.tsx`
- `src/admin/pages/courses/CoursesAdminPage.tsx`

## 任务 1：先用测试锁定新的后台信息架构

**文件：**
- 创建：`src/admin/pages/AdminDomainNavigation.test.tsx`
- 修改：`src/app/router.tsx`
- 修改：`src/admin/AdminLayout.tsx`

- [ ] **步骤 1：编写失败的导航结构测试**

```tsx
it('renders five top-level admin groups and defaults to course center', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/admin'] })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('link', { name: '课程中心' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '评课管理' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '学员管理' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '题库管理' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '系统管理' })).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/admin/course-center/courses')
})
```

- [ ] **步骤 2：编写失败的旧路径兼容测试**

```tsx
it('redirects legacy admin course path into course center domain', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/admin/courses'] })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: '课程列表' })).toBeInTheDocument()
  expect(memoryRouter.state.location.pathname).toBe('/admin/course-center/courses')
})
```

- [ ] **步骤 3：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx`

预期：

- FAIL，找不到 `课程中心`
- FAIL，`/admin` 仍跳到旧路径
- FAIL，旧路径没有被重定向到新域路由

- [ ] **步骤 4：新增分组导航配置类型**

```ts
export type AdminNavGroup = {
  key: string
  label: string
  basePath: string
  items: Array<{
    to: string
    label: string
  }>
}
```

- [ ] **步骤 5：在 `navigationGroups.ts` 中定义五大一级菜单**

```ts
export const adminNavGroups: AdminNavGroup[] = [
  {
    key: 'course-center',
    label: '课程中心',
    basePath: '/admin/course-center',
    items: [
      { to: '/admin/course-center/courses', label: '课程列表' },
      { to: '/admin/course-center/relations', label: '课程关系视图' },
    ],
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
```

- [ ] **步骤 6：修改 `AdminLayout.tsx` 以渲染一级菜单和二级菜单**

```tsx
{adminNavGroups.map((group) => {
  const groupActive = pathname.startsWith(group.basePath)

  return (
    <section key={group.key} aria-label={group.label}>
      <NavLink to={group.items[0]?.to ?? group.basePath}>{group.label}</NavLink>
      <div>
        {group.items.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </div>
    </section>
  )
})}
```

- [ ] **步骤 7：修改 `router.tsx`，让 `/admin` 默认进入课程中心**

```tsx
{ index: true, element: <Navigate to="/admin/course-center/courses" replace /> }
```

- [ ] **步骤 8：为旧路径补重定向**

```tsx
{ path: 'courses', element: <Navigate to="/admin/course-center/courses" replace /> }
{ path: 'reviews', element: <Navigate to="/admin/review-management/reviews" replace /> }
{ path: 'users', element: <Navigate to="/admin/system-management/users" replace /> }
```

- [ ] **步骤 9：运行测试验证通过**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx`

预期：PASS

- [ ] **步骤 10：Commit**

```bash
git add src/admin/config/navigationGroups.ts src/admin/AdminLayout.tsx src/app/router.tsx src/admin/pages/AdminDomainNavigation.test.tsx
git commit -m "feat: 重构后台导航为五大业务域"
```

## 任务 2：迁移现有后台页面到新的域路由

**文件：**
- 修改：`src/app/router.tsx`
- 修改：`src/admin/config/navigationGroups.ts`
- 修改：`src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：编写失败的迁移测试**

```tsx
it('keeps review and system pages reachable under grouped admin routes', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, {
    initialEntries: ['/admin/review-management/reviews'],
  })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: '评价管理' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '系统管理' })).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "grouped admin routes"`

预期：FAIL，路由不存在

- [ ] **步骤 3：将现有页面挂到新的域分组路径**

```tsx
{
  path: 'review-management',
  children: [
    { path: 'reviews', Component: ReviewsAdminPage },
    { path: 'universities', Component: UniversitiesAdminPage },
    { path: 'teachers', Component: TeachersAdminPage },
    { path: 'semesters', Component: SemestersAdminPage },
  ],
}
```

- [ ] **步骤 4：将系统页面迁移到系统管理分组**

```tsx
{
  path: 'system-management',
  children: [
    { path: 'users', Component: UsersAdminPage },
    { path: 'messages', Component: MessagesAdminPage },
    { path: 'logs', Component: LogsAdminPage },
  ],
}
```

- [ ] **步骤 5：更新旧测试中的路由入口**

```tsx
const memoryRouter = createMemoryRouter(routes, {
  initialEntries: ['/admin/system-management/users'],
})
```

- [ ] **步骤 6：运行迁移相关测试验证通过**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx src/admin/pages/AdminEntityDialogs.test.tsx`

预期：PASS

- [ ] **步骤 7：Commit**

```bash
git add src/app/router.tsx src/admin/config/navigationGroups.ts src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "refactor: 迁移后台页面到域分组路由"
```

## 任务 3：落地课程中心

**文件：**
- 创建：`src/admin/pages/course-center/CourseRelationsPage.tsx`
- 修改：`src/app/router.tsx`
- 修改：`src/admin/config/navigationGroups.ts`
- 修改：`src/admin/pages/courses/CoursesAdminPage.tsx`
- 测试：`src/admin/pages/AdminDomainNavigation.test.tsx`

- [ ] **步骤 1：编写失败的课程中心测试**

```tsx
it('shows course relations page under course center', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, {
    initialEntries: ['/admin/course-center/relations'],
  })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: '课程关系视图' })).toBeInTheDocument()
  expect(screen.getByText('评价、学员、题库关联将在此汇总展示')).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx -t "course relations page"`

预期：FAIL，页面不存在

- [ ] **步骤 3：新增课程关系视图占位页**

```tsx
export default function CourseRelationsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">课程关系视图</h1>
      <p className="text-sm text-slate-500">
        评价、学员、题库关联将在此汇总展示。
      </p>
    </section>
  )
}
```

- [ ] **步骤 4：将课程列表页面接入课程中心路径**

```tsx
{
  path: 'course-center',
  children: [
    { path: 'courses', Component: CoursesAdminPage },
    { path: 'relations', Component: CourseRelationsPage },
  ],
}
```

- [ ] **步骤 5：将 `CoursesAdminPage` 的标题和文案调整为课程中心语义**

```tsx
title="课程列表"
description="统一维护课程主数据，并作为评课、学员、题库的共享引用源。"
```

- [ ] **步骤 6：运行课程中心测试验证通过**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx`

预期：PASS

- [ ] **步骤 7：Commit**

```bash
git add src/admin/pages/course-center/CourseRelationsPage.tsx src/admin/pages/courses/CoursesAdminPage.tsx src/app/router.tsx src/admin/config/navigationGroups.ts src/admin/pages/AdminDomainNavigation.test.tsx
git commit -m "feat: 落地课程中心基础路由与页面"
```

## 任务 4：扩展后台运行时数据模型，为学员域和题库域提供基础实体

**文件：**
- 修改：`src/admin/types/admin.ts`
- 修改：`src/admin/data/index.ts`
- 修改：`src/admin/context/AdminRuntimeContext.tsx`
- 测试：`src/admin/hooks/useAdminEntityCollection.test.tsx`

- [ ] **步骤 1：编写失败的 runtime 测试**

```tsx
it('stores student and problem-bank entities in admin runtime', () => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <AdminRuntimeProvider>{children}</AdminRuntimeProvider>
  )

  const { result } = renderHook(() => useAdminRuntime(), { wrapper })

  expect(result.current.students.length).toBeGreaterThan(0)
  expect(result.current.problems.length).toBeGreaterThan(0)
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/hooks/useAdminEntityCollection.test.tsx`

预期：FAIL，`students` 或 `problems` 未定义

- [ ] **步骤 3：在 `admin.ts` 中定义学员域和题库域类型**

```ts
export type StudentAdminRow = {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  enrolledCourseCount: number
}

export type ProblemAdminRow = {
  id: string
  courseId: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'published'
}
```

- [ ] **步骤 4：在 `data/index.ts` 中补充最小可用种子数据**

```ts
export const studentRows: StudentAdminRow[] = [
  {
    id: 'student-alex',
    name: 'Alex Student',
    email: 'alex.student@irbtree.com',
    phone: '0400 000 001',
    status: 'active',
    enrolledCourseCount: 2,
  },
]
```

- [ ] **步骤 5：将新实体接入 `AdminRuntimeContext.tsx`**

```tsx
const studentsState = useAdminEntityCollection(studentRows)
const problemsState = useAdminEntityCollection(problemRows)

const value = useMemo(
  () => ({
    students: studentsState.items,
    addStudent: studentsState.addItem,
    updateStudent: studentsState.updateItem,
    problems: problemsState.items,
  }),
  [studentsState.items, studentsState.addItem, studentsState.updateItem, problemsState.items],
)
```

- [ ] **步骤 6：运行 runtime 测试验证通过**

运行：`npm test -- src/admin/hooks/useAdminEntityCollection.test.tsx`

预期：PASS

- [ ] **步骤 7：Commit**

```bash
git add src/admin/types/admin.ts src/admin/data/index.ts src/admin/context/AdminRuntimeContext.tsx src/admin/hooks/useAdminEntityCollection.test.tsx
git commit -m "feat: 扩展后台运行时数据支持学员与题库实体"
```

## 任务 5：实现学员管理列表与详情骨架

**文件：**
- 创建：`src/admin/pages/students/StudentsAdminPage.tsx`
- 创建：`src/admin/pages/students/StudentDetailPage.tsx`
- 创建：`src/admin/pages/students/studentsAdminData.ts`
- 创建：`src/admin/pages/StudentsAdminPage.test.tsx`
- 修改：`src/app/router.tsx`
- 修改：`src/admin/config/navigationGroups.ts`
- 修改：`src/admin/context/AdminRuntimeContext.tsx`

- [ ] **步骤 1：编写失败的学员列表测试**

```tsx
it('renders student list with enrollment and payment summary', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, {
    initialEntries: ['/admin/student-management/students'],
  })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: '学员列表' })).toBeInTheDocument()
  expect(screen.getByText('Alex Student')).toBeInTheDocument()
  expect(screen.getByText('2 门课程')).toBeInTheDocument()
})
```

- [ ] **步骤 2：编写失败的学员详情测试**

```tsx
it('renders student detail timeline and payment records', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, {
    initialEntries: ['/admin/student-management/students/student-alex'],
  })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
  expect(screen.getByText('课程权限')).toBeInTheDocument()
  expect(screen.getByText('缴费记录')).toBeInTheDocument()
  expect(screen.getByText('跟进备注')).toBeInTheDocument()
})
```

- [ ] **步骤 3：运行测试验证失败**

运行：`npm test -- src/admin/pages/StudentsAdminPage.test.tsx`

预期：FAIL，路由和页面不存在

- [ ] **步骤 4：实现学员列表页**

```tsx
export default function StudentsAdminPage() {
  const { students } = useAdminRuntime()

  return (
    <AdminScaffold
      title="学员列表"
      description="查看学员、课程开通、有效期和缴费概况。"
      table={{ data: students, columns }}
    />
  )
}
```

- [ ] **步骤 5：实现学员详情页**

```tsx
export default function StudentDetailPage() {
  const { studentId } = useParams()
  const { students, enrollments, payments, studentNotes } = useAdminRuntime()
  const student = students.find((item) => item.id === studentId)

  if (!student) {
    return <Navigate to="/admin/student-management/students" replace />
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{student.name}</h1>
      <StudentEnrollmentPanel enrollments={enrollments.filter((item) => item.studentId === student.id)} />
      <StudentPaymentPanel payments={payments.filter((item) => item.studentId === student.id)} />
      <StudentNotesTimeline notes={studentNotes.filter((item) => item.studentId === student.id)} />
    </section>
  )
}
```

- [ ] **步骤 6：接入学员管理路由和导航**

```tsx
{
  path: 'student-management',
  children: [
    { path: 'students', Component: StudentsAdminPage },
    { path: 'students/:studentId', Component: StudentDetailPage },
  ],
}
```

- [ ] **步骤 7：运行学员管理测试验证通过**

运行：`npm test -- src/admin/pages/StudentsAdminPage.test.tsx`

预期：PASS

- [ ] **步骤 8：运行回归测试**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx src/admin/pages/StudentsAdminPage.test.tsx src/admin/pages/AdminPageBehaviors.test.tsx`

预期：PASS

- [ ] **步骤 9：Commit**

```bash
git add src/admin/pages/students/StudentsAdminPage.tsx src/admin/pages/students/StudentDetailPage.tsx src/admin/pages/students/studentsAdminData.ts src/admin/pages/StudentsAdminPage.test.tsx src/app/router.tsx src/admin/config/navigationGroups.ts src/admin/context/AdminRuntimeContext.tsx
git commit -m "feat: 新增学员管理列表与详情骨架"
```

## 任务 6：补齐题库管理占位结构，完成五大一级菜单闭环

**文件：**
- 创建：`src/admin/pages/problem-bank/ProblemsAdminPage.tsx`
- 创建：`src/admin/pages/problem-bank/ProblemTagsAdminPage.tsx`
- 创建：`src/admin/pages/problem-bank/ExamPapersAdminPage.tsx`
- 创建：`src/admin/pages/problem-bank/ProblemAssetsAdminPage.tsx`
- 修改：`src/app/router.tsx`
- 修改：`src/admin/config/navigationGroups.ts`
- 测试：`src/admin/pages/AdminDomainNavigation.test.tsx`

- [ ] **步骤 1：编写失败的题库管理测试**

```tsx
it('renders problem-bank section placeholders', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, {
    initialEntries: ['/admin/problem-bank/problems'],
  })

  render(<RouterProvider router={memoryRouter} />)

  expect(await screen.findByRole('heading', { name: '题目列表' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '题库管理' })).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx -t "problem-bank section placeholders"`

预期：FAIL，题库路由不存在

- [ ] **步骤 3：实现四个题库管理占位页**

```tsx
export default function ProblemsAdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">题目列表</h1>
      <p className="text-sm text-slate-500">第一阶段先建立题库管理信息架构和基础入口。</p>
    </section>
  )
}
```

- [ ] **步骤 4：接入题库管理路由**

```tsx
{
  path: 'problem-bank',
  children: [
    { path: 'problems', Component: ProblemsAdminPage },
    { path: 'tags', Component: ProblemTagsAdminPage },
    { path: 'exams', Component: ExamPapersAdminPage },
    { path: 'assets', Component: ProblemAssetsAdminPage },
  ],
}
```

- [ ] **步骤 5：运行题库管理测试验证通过**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx`

预期：PASS

- [ ] **步骤 6：运行第一阶段全集成测试**

运行：`npm test -- src/admin/pages/AdminDomainNavigation.test.tsx src/admin/pages/StudentsAdminPage.test.tsx src/admin/pages/AdminPageBehaviors.test.tsx src/admin/pages/AdminEntityDialogs.test.tsx src/admin/hooks/useAdminEntityCollection.test.tsx`

预期：PASS

- [ ] **步骤 7：运行 lint 和诊断**

运行：`npm run lint`

预期：

- 如果出现旧文件历史问题，记录为已有问题
- 本次新增或修改文件不引入新的 lint 或 TS 诊断错误

- [ ] **步骤 8：Commit**

```bash
git add src/admin/pages/problem-bank/ProblemsAdminPage.tsx src/admin/pages/problem-bank/ProblemTagsAdminPage.tsx src/admin/pages/problem-bank/ExamPapersAdminPage.tsx src/admin/pages/problem-bank/ProblemAssetsAdminPage.tsx src/app/router.tsx src/admin/config/navigationGroups.ts src/admin/pages/AdminDomainNavigation.test.tsx
git commit -m "feat: 补齐题库管理占位结构"
```

## 自检结果

### 规格覆盖度

- 课程中心：有任务 1、2、3
- 评课管理迁移：有任务 1、2
- 学员管理：有任务 4、5
- 题库管理：有任务 4、6
- 系统管理迁移：有任务 2
- 共享课程主数据和统一 runtime：有任务 4

### 占位符扫描

- 所有任务都给出了明确文件、测试、命令和示例代码
- 没有使用 “TODO / 待定 / 后续实现 / 类似任务” 之类占位描述

### 类型一致性

- 共享课程实体统一使用 `courseId`
- 学员详情统一使用 `studentId`
- 题库域统一使用 `problem-bank` 路由分组名
