# Admin 后台布局统一与课程管理页改造实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 统一后台全局壳层样式，移除页面主体中的重复标题说明，并将课程管理页改造成每页 10 条、共 18 条 Mock 数据的标准列表页。

**架构：** 在不改动后台信息架构和本地 CRUD 行为的前提下，优先调整 `AdminLayout` 与 `AdminScaffold` 的可视结构，再落地 `CoursesAdminPage` 的工具栏与表格样式，最后扩充课程 Mock 数据并补充验证测试。测试以现有 `vitest + testing-library` 为主，优先覆盖标题收敛、分页条数和课程页结构回归。

**技术栈：** React、TypeScript、React Router、Tailwind CSS、Vitest、Testing Library

---

## 文件结构

### 本次会修改的文件

- `src/admin/AdminLayout.tsx`
  - 统一后台侧边栏、选中态、Header 和主内容区视觉
- `src/admin/components/AdminScaffold.tsx`
  - 将页面骨架从「标题 + 描述 + 工具栏」收敛为「工具栏 + 内容」
- `src/admin/pages/courses/CoursesAdminPage.tsx`
  - 调整课程页 `pageSize`、工具栏布局和表格呈现
- `src/admin/data/index.ts`
  - 将课程 Mock 数据扩充到 18 条
- `src/admin/pages/AdminPageBehaviors.test.tsx`
  - 补充课程页分页与页面标题收敛回归测试

### 参考文件

- `src/admin/config/navigation.ts`
  - 提供 Header 页面标题映射
- `src/components/common/Pagination.tsx`
  - 提供现有分页行为，不在本次重构
- `docs/superpowers/specs/2026-06-21-admin-layout-courses-refresh-design.md`
  - 本次实现的规格依据

## 任务 1：补齐课程页结构与分页回归测试

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：为 Header 标题唯一性和课程分页补充失败测试**

```tsx
it('shows the page title in the header without repeating a page-level heading', async () => {
  renderAdminAt('/admin/courses')

  expect(await screen.findByRole('heading', { name: '课程管理', level: 1 })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: '课程管理', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByText('维护课程信息、教师与状态，作为后台默认首页展示。')).not.toBeInTheDocument()
})

it('paginates the courses table with 10 rows per page across 18 mock rows', async () => {
  renderAdminAt('/admin/courses')

  const firstPageRows = within(await screen.findByRole('table')).getAllByRole('row')
  expect(firstPageRows).toHaveLength(11)
  expect(screen.getByRole('button', { name: '第 2 页' })).toBeInTheDocument()
  expect(screen.getByText('共 18 条数据')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: '第 2 页' }))

  const secondPageRows = within(await screen.findByRole('table')).getAllByRole('row')
  expect(secondPageRows).toHaveLength(9)
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm run test -- src/admin/pages/AdminPageBehaviors.test.tsx
```

预期：

```text
FAIL  src/admin/pages/AdminPageBehaviors.test.tsx
- shows the page title in the header without repeating a page-level heading
- paginates the courses table with 10 rows per page across 18 mock rows
```

- [ ] **步骤 3：提交测试变更**

```bash
git add src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "test(后台): 补充课程页结构与分页断言"
```

## 任务 2：统一后台壳层与页面骨架

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/AdminLayout.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/components/AdminScaffold.tsx`

- [ ] **步骤 1：调整 `AdminLayout` 的导航选中态和 Header 视觉**

将侧边栏导航的深色选中态替换为浅色弱强调样式，并减轻 Header 的视觉重量。核心方向如下：

```tsx
<aside className="hidden shrink-0 border-r border-slate-200 bg-white lg:flex lg:w-[172px] lg:flex-col">
  <nav className="flex-1 space-y-1 px-3 py-4 text-sm font-medium text-slate-600">
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition',
          inset ? 'pl-8' : '',
          isActive
            ? 'bg-violet-50 text-violet-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        ].join(' ')
      }
    >
      {isActive ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-violet-500" /> : null}
      <Icon size={18} className="shrink-0" />
      {!collapsed ? <span>{label}</span> : null}
    </NavLink>
  </nav>
</aside>

<header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
  <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
</header>
```

- [ ] **步骤 2：调整 `AdminPageFrame`，移除页面内标题与描述渲染**

保留搜索、筛选和主按钮插槽，只渲染工具栏和子内容：

```tsx
export function AdminPageFrame({
  query,
  onQueryChange,
  searchPlaceholder,
  filters,
  primaryActionLabel,
  onPrimaryAction,
  children,
}: PageFrameProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          {/* 搜索与筛选保留 */}
        </div>
        {primaryActionLabel && onPrimaryAction ? (
          <button type="button" onClick={onPrimaryAction} className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white">
            <Plus size={16} />
            {primaryActionLabel}
          </button>
        ) : null}
      </div>

      {children}
    </section>
  )
}
```

- [ ] **步骤 3：运行聚焦测试验证壳层变更通过**

运行：

```bash
npm run test -- src/admin/pages/AdminPageBehaviors.test.tsx
```

预期：

```text
PASS  src/admin/pages/AdminPageBehaviors.test.tsx
```

- [ ] **步骤 4：提交壳层与骨架变更**

```bash
git add src/admin/AdminLayout.tsx src/admin/components/AdminScaffold.tsx src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "refactor(后台): 统一壳层与页面骨架"
```

## 任务 3：落地课程管理页列表结构与 18 条 Mock 数据

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/pages/courses/CoursesAdminPage.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/data/index.ts`

- [ ] **步骤 1：将课程页 `pageSize` 调整为 10，并保持工具栏为标准列表页布局**

在课程页中直接切换分页口径，保留现有筛选和抽屉逻辑：

```tsx
const pageSize = 10

<AdminPageFrame
  title="课程管理"
  description="维护课程信息、教师与状态，作为后台默认首页展示。"
  query={query}
  onQueryChange={setQuery}
  searchPlaceholder="搜索课程代码或名称..."
  filters={
    <>
      <AdminFilterSelect
        label="院校"
        value={toCourseUniversityOptionValue(selectedUniversity)}
        options={universityOptions}
        onChange={(value) => setSelectedUniversity(normalizeCourseUniversity(value))}
      />
      <AdminFilterSelect
        label="状态"
        value={selectedStatus}
        options={statusOptions}
        onChange={setSelectedStatus}
      />
    </>
  }
  primaryActionLabel="新增课程"
  onPrimaryAction={openCreateDrawer}
>
```

- [ ] **步骤 2：将课程 Mock 数据扩充到 18 条**

保持现有字段结构，补齐不同院校与状态组合。新增数据需与现有行结构完全一致，例如：

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
    summary: 'Python 入门、递归与抽象能力训练。',
    status: '已上线',
    statusTone: 'success',
    searchText: 'COMP9021 Principles of Programming UNSW Dr. James Smith Alice Chen Python',
  },
  {
    id: 'course-elec2134',
    code: 'ELEC2134',
    name: 'Circuits and Signals',
    university: 'UNSW',
    credits: 6,
    teacher: 'Dr. Ruby Stone',
    tutor: 'Kevin Lin',
    summary: '模拟电路、信号分析与实验训练。',
    status: '待审核',
    statusTone: 'warning',
    searchText: 'ELEC2134 Circuits and Signals UNSW Ruby Stone Kevin Lin',
  },
  {
    id: 'course-mast10006',
    code: 'MAST10006',
    name: 'Calculus 2',
    university: 'Melbourne',
    credits: 12,
    teacher: 'Dr. Ethan Chen',
    tutor: 'Nina Hu',
    summary: '多元微积分与工程应用基础。',
    status: '已停用',
    statusTone: 'danger',
    searchText: 'MAST10006 Calculus 2 Melbourne Ethan Chen Nina Hu',
  },
]
```

- [ ] **步骤 3：运行课程页聚焦测试，验证分页与 CRUD 未回归**

运行：

```bash
npm run test -- src/admin/pages/AdminPageBehaviors.test.tsx
```

预期：

```text
PASS  src/admin/pages/AdminPageBehaviors.test.tsx
```

- [ ] **步骤 4：提交课程页与数据改动**

```bash
git add src/admin/pages/courses/CoursesAdminPage.tsx src/admin/data/index.ts src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "feat(后台): 还原课程管理列表页样式"
```

## 任务 4：执行最终验证并清理诊断

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/AdminLayout.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/components/AdminScaffold.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/pages/courses/CoursesAdminPage.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/data/index.ts`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：运行后台相关测试集**

运行：

```bash
npm run test -- src/admin/pages/AdminPageBehaviors.test.tsx src/admin/pages/AdminEntityDialogs.test.tsx
```

预期：

```text
PASS  src/admin/pages/AdminPageBehaviors.test.tsx
PASS  src/admin/pages/AdminEntityDialogs.test.tsx
```

- [ ] **步骤 2：检查已修改文件的诊断信息**

运行 IDE 诊断并确认以下文件无新增错误：

```text
src/admin/AdminLayout.tsx
src/admin/components/AdminScaffold.tsx
src/admin/pages/courses/CoursesAdminPage.tsx
src/admin/data/index.ts
src/admin/pages/AdminPageBehaviors.test.tsx
```

- [ ] **步骤 3：启动本地预览并手动核对课程页**

运行：

```bash
npm run dev
```

手动检查：

```text
1. 进入 /admin/courses，Header 左侧仅显示一个“课程管理”标题
2. 页面主体从筛选工具栏开始，不再出现说明文案
3. 左侧导航选中态为浅色弱强调，而非深色整块
4. 课程页第一页显示 10 条，切到第二页显示 8 条
5. 系统设置展开、通知抽屉、课程新增/编辑/下线仍可用
```

- [ ] **步骤 4：提交最终验证结果**

```bash
git add src/admin/AdminLayout.tsx src/admin/components/AdminScaffold.tsx src/admin/pages/courses/CoursesAdminPage.tsx src/admin/data/index.ts src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "test(后台): 完成布局与课程页改造验证"
```

## 自检结果

### 规格覆盖度

规格中的以下要求均已映射到任务：

- 全局壳层统一：任务 2
- 页面主体去除重复标题说明：任务 1、任务 2
- 课程页工具栏 + 表格 + 分页结构：任务 3
- 课程数据扩充至 18 条：任务 3
- 每页 10 条分页口径：任务 1、任务 3
- 回归验证：任务 4

### 占位符扫描

计划中未使用「TODO」「后续实现」「补充细节」等占位语句。所有任务均指向明确文件、命令、预期结果和示例代码。

### 类型一致性

计划中沿用现有 `CourseAdminRow`、`AdminPageFrame`、`AdminFilterSelect`、`useAdminPageFilters` 和 `AdminStatusBadge` 命名，未引入未定义的新类型或方法名。
