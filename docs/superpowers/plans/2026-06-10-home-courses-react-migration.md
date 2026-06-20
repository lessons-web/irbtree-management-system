# 首页与课程列表页 React 增量迁移 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在现有 React 路由与数据模型上，把首页 `/` 与课程列表页 `/courses` 迁移为更接近 `docs/index.html` 的真实页面，并复用任务 2/3 的 mock 数据、筛选逻辑和课程组件。

**架构：** 保持 `HomePage`、`CoursesPage` 为页面入口，优先复用现有 `CourseCard`、`CourseListItem`、review provider 与 `src/data/courses.ts`。通过先补测试再调整页面结构与文案，确保迁移后的视觉层级、导航跳转、筛选区和列表摘要与 `docs/index.html` 保持一致，同时不扩大到其他模块。

**技术栈：** React 19、React Router 7、TypeScript、Tailwind CSS 4、Vitest、Testing Library

---

### 任务 1：补首页迁移测试

**文件：**
- 修改：`src/pages/task4-pages.test.tsx`
- 参考：`docs/index.html`

- [ ] **步骤 1：先补失败测试，锁定首页关键信息架构**

```tsx
it('renders the migrated home page with hero, stats and popular courses', () => {
  render(
    <MemoryRouter>
      <ReviewProvider>
        <HomePage />
      </ReviewProvider>
    </MemoryRouter>,
  )

  expect(screen.getByText('2024 选课季必备')).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/搜索课程代码/)).toBeInTheDocument()
  expect(screen.getByText('已收录课程')).toBeInTheDocument()
  expect(screen.getByText('真实评价')).toBeInTheDocument()
  expect(screen.getByText('热门课程')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /查看全部/i })).toHaveAttribute('href', '/courses')
})
```

- [ ] **步骤 2：运行测试确认当前实现与预期存在差异**

运行：`npm test -- src/pages/task4-pages.test.tsx`

预期：至少 1 个断言失败，说明首页迁移点尚未完全锁定。

### 任务 2：补课程列表页迁移测试

**文件：**
- 修改：`src/pages/task4-pages.test.tsx`
- 参考：`docs/index.html`

- [ ] **步骤 1：补课程列表页失败测试，覆盖筛选区与摘要区**

```tsx
it('renders migrated courses page controls and resets to defaults', () => {
  renderCoursesPage('/courses?query=COMP9311&pageSize=10&school=sch_unsw')

  expect(screen.getByLabelText('搜索课程')).toHaveValue('COMP9311')
  expect(screen.getByLabelText('学校')).toHaveValue('sch_unsw')
  expect(screen.getByLabelText('排序方式')).toBeInTheDocument()
  expect(screen.getByText(/显示第/)).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: '重置筛选' }))

  expect(screen.getByLabelText('搜索课程')).toHaveValue('')
  expect(screen.getByLabelText('学校')).toHaveValue('all')
  expect(screen.getByDisplayValue('5 条/页')).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试确认当前实现不完全满足预期**

运行：`npm test -- src/pages/task4-pages.test.tsx`

预期：FAIL，暴露课程页默认值或结构与预期不符。

### 任务 3：实现首页增量迁移

**文件：**
- 修改：`src/pages/home/HomePage.tsx`
- 可选修改：`src/components/user/CourseCard.tsx`
- 复用：`src/features/review/mockData.ts`
- 复用：`src/data/courses.ts`

- [ ] **步骤 1：将首页接入 `ReviewProvider` 数据并对齐 `docs/index.html` 分区**

```tsx
const { courses } = useReview()
const featuredCourses = useMemo(() => {
  const courseMap = new Map(courses.map((course) => [course.universityCourseId, course]))
  return featuredUniversityCourseIds.map((courseId) => courseMap.get(courseId)).filter(Boolean)
}, [courses])
```

- [ ] **步骤 2：按 `docs/index.html` 调整 Hero、搜索、统计卡和热门课程区块文案与层级**

```tsx
<section className="relative overflow-hidden rounded-[2rem] ...">
  <span className="...">2024 选课季必备</span>
  <h1>拒绝挂科，<span>选课不踩雷</span></h1>
  <p>澳洲留学生专属的课程评价平台。查看 12,000+ 真实学长学姐评价...</p>
</section>
```

- [ ] **步骤 3：保留现有跳转行为，搜索统一跳到 `/courses`**

```tsx
onSearch={(keyword) => {
  const params = new URLSearchParams()
  if (keyword) params.set('query', keyword)
  navigate(`/courses${params.toString() ? `?${params.toString()}` : ''}`)
}}
```

- [ ] **步骤 4：运行页面测试确认首页通过**

运行：`npm test -- src/pages/task4-pages.test.tsx`

预期：首页相关测试 PASS。

### 任务 4：实现课程列表页增量迁移

**文件：**
- 修改：`src/pages/courses/CoursesPage.tsx`
- 可选修改：`src/components/user/CourseListItem.tsx`
- 复用：`src/lib/courseFilters.ts`
- 复用：`src/data/courses.ts`

- [ ] **步骤 1：对齐 `docs/index.html` 的筛选栏布局和文案**

```tsx
<section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
    <label htmlFor="courses-search">搜索课程</label>
    <label htmlFor="courses-school">学校</label>
    <label htmlFor="courses-sort">排序方式</label>
    <button type="button">重置筛选</button>
  </div>
</section>
```

- [ ] **步骤 2：保持 URL 参数驱动的筛选、排序、分页逻辑，仅把默认值与重置行为对齐首页入口**

```tsx
const DEFAULT_PAGE_SIZE = 5

function updateParams(next: Record<string, string | null>, resetPage = false) {
  const current = new URLSearchParams(params)
  ...
}
```

- [ ] **步骤 3：保留已有 `CourseListItem` 数据交互，补足列表为空态和底部分页摘要**

```tsx
{total === 0 ? (
  <section className="...">没有找到匹配的课程，换个关键词试试？</section>
) : (
  <section className="space-y-4">{pagination.items.map(...)}</section>
)}
```

- [ ] **步骤 4：运行页面测试确认课程页通过**

运行：`npm test -- src/pages/task4-pages.test.tsx`

预期：课程页相关测试 PASS。

### 任务 5：全量验证与诊断

**文件：**
- 检查：`src/pages/home/HomePage.tsx`
- 检查：`src/pages/courses/CoursesPage.tsx`
- 检查：`src/pages/task4-pages.test.tsx`

- [ ] **步骤 1：运行类型与打包验证**

运行：`npm run build`

预期：构建成功。

- [ ] **步骤 2：运行 lint**

运行：`npm run lint`

预期：无 ESLint 错误。

- [ ] **步骤 3：运行测试**

运行：`npm test`

预期：全部测试通过。

- [ ] **步骤 4：检查诊断并修复最近编辑文件中的问题**

运行：获取 `HomePage`、`CoursesPage`、`task4-pages.test.tsx` 的编辑器诊断。

- [ ] **步骤 5：整理结果**

输出：

```md
- 修改文件清单
- build/lint/test 结果
- 自审：贴近 `docs/index.html` 的点、仍有差距的点、潜在回归风险
```
