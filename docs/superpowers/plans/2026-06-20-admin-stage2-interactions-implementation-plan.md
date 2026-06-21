# Admin 第二阶段交互与 1:1 还原实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将现有 Admin 端从“结构 mock”升级为具备本地 CRUD、状态流转、通知联动与系统日志沉淀的高保真后台，并继续向 `docs/admin.html` 的容器与交互模式做 1:1 还原。

**架构：** 先抽一层后台实体行为与操作流，用统一 Hook 管理列表数据、筛选分页、通知与日志；再按 `admin.html` 的页面差异恢复右侧抽屉、中心弹窗和详情抽屉三类容器，并把课程、评价、用户、消息等核心页面改为真实可提交的前端交互。最后补行为测试，验证新增、编辑、删除、状态切换与日志联动。

**技术栈：** React 19、React Router 7、TypeScript、Tailwind CSS、Vitest、Testing Library

---

## 文件结构

### 创建文件

- `src/admin/components/AdminEntityDialog.tsx`
  - 为院校、教师、学期、标签提供中心弹窗壳，贴近 `tagModal`、`semesterModal`、`teacherModal`、`universityModal`
- `src/admin/components/AdminField.tsx`
  - 封装输入框、下拉框、文本域、单选组的统一字段样式
- `src/admin/components/AdminReviewRatings.tsx`
  - 渲染评价详情中的四项评分，贴近 `review-drawer` 中的评分区
- `src/admin/hooks/useAdminEntityCollection.ts`
  - 管理本地实体集合的增删改与排序
- `src/admin/hooks/useAdminPageFilters.ts`
  - 管理 query、筛选条件、分页及页码修正
- `src/admin/hooks/useAdminOperationFeed.ts`
  - 维护通知 feed 与日志 feed 的本地状态和写入方法
- `src/admin/context/AdminRuntimeContext.tsx`
  - 在 `AdminLayout` 与页面间共享通知与日志的运行时状态
- `src/admin/pages/AdminPageBehaviors.test.tsx`
  - 覆盖课程新增、用户停用、消息撤回、评价处理与日志联动测试

### 修改文件

- `src/admin/AdminLayout.tsx`
  - 改为消费运行时通知 feed，而不是固定常量数组
- `src/admin/config/navigation.ts`
  - 将通知初始 seed 与页面标题映射拆分，保留可变 seed 入口
- `src/admin/types/admin.ts`
  - 补充表单草稿、日志记录、通知记录、评价评分、角色枚举等类型
- `src/admin/data/index.ts`
  - 将静态 seed 扩展为可支持详情、表单和状态流转的初始数据
- `src/admin/components/AdminScaffold.tsx`
  - 保留表格与分页基建，但移除“只读说明块”的限制，补通用 footer、mode 和交互插槽
- `src/admin/pages/courses/CoursesAdminPage.tsx`
  - 恢复可编辑课程抽屉和真实新增 / 编辑 / 下线逻辑
- `src/admin/pages/reviews/ReviewsAdminPage.tsx`
  - 恢复评价详情抽屉、通过 / 驳回、批量治理和评分详情
- `src/admin/pages/universities/UniversitiesAdminPage.tsx`
  - 改用中心弹窗，并支持新增 / 编辑 / 删除
- `src/admin/pages/teachers/TeachersAdminPage.tsx`
  - 改用中心弹窗，并支持新增 / 编辑 / 删除
- `src/admin/pages/semesters/SemestersAdminPage.tsx`
  - 改用中心弹窗，并支持新增 / 编辑 / 归档 / 删除
- `src/admin/pages/tags/TagsAdminPage.tsx`
  - 改用中心弹窗，并支持新增 / 编辑 / 删除
- `src/admin/pages/users/UsersAdminPage.tsx`
  - 恢复用户右侧抽屉与角色单选，支持新增 / 编辑 / 停用
- `src/admin/pages/messages/MessagesAdminPage.tsx`
  - 恢复消息新建 / 编辑 / 撤回与状态流转
- `src/admin/pages/logs/LogsAdminPage.tsx`
  - 改为读取运行时日志 feed，而不是固定 seed
- `src/app/router.test.tsx`
  - 保留路由测试，并为通知抽屉和系统设置子菜单的运行时行为提供稳定断言

### 参考文件

- `docs/admin.html`
  - 第二阶段所有容器与字段布局以该文件为唯一交互参照
- `src/components/common/Drawer.tsx`
  - 右侧抽屉基础壳
- `src/components/common/Modal.tsx`
  - 中心弹窗基础壳
- `src/components/common/Pagination.tsx`
  - 分页组件

## 任务 1：抽出后台运行时状态与操作流

**文件：**
- 创建：`src/admin/context/AdminRuntimeContext.tsx`
- 创建：`src/admin/hooks/useAdminEntityCollection.ts`
- 创建：`src/admin/hooks/useAdminPageFilters.ts`
- 创建：`src/admin/hooks/useAdminOperationFeed.ts`
- 修改：`src/admin/types/admin.ts`
- 修改：`src/admin/config/navigation.ts`
- 修改：`src/admin/AdminLayout.tsx`
- 测试：`src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：编写失败的运行时联动测试**

```tsx
it('writes a runtime notification and runtime log after an admin operation', async () => {
  renderAdminAt('/admin/messages')

  fireEvent.click(await screen.findByRole('button', { name: '新建消息' }))
  fireEvent.change(screen.getByLabelText('标题'), { target: { value: '测试消息' } })
  fireEvent.click(screen.getByRole('button', { name: '保存消息' }))

  fireEvent.click(screen.getByRole('button', { name: '通知' }))
  expect(await screen.findByText(/测试消息/)).toBeInTheDocument()

  await navigateTo('/admin/logs')
  expect(await screen.findByText(/创建消息/)).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "writes a runtime notification and runtime log after an admin operation"`
预期：FAIL，报错缺少运行时通知或日志联动。

- [ ] **步骤 3：实现最少运行时状态层**

```tsx
export type AdminOperationNotification = {
  id: string
  title: string
  description: string
  time: string
}

export type AdminOperationLog = {
  id: string
  module: string
  actor: string
  action: string
  createdAt: string
  status: string
}

const AdminRuntimeContext = createContext<AdminRuntimeValue | null>(null)

export function AdminRuntimeProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState(adminNotificationSeed)
  const [logs, setLogs] = useState(logSeed)

  const appendOperation = useCallback((operation: AdminOperationInput) => {
    setNotifications((current) => [buildNotification(operation), ...current].slice(0, 8))
    setLogs((current) => [buildLog(operation), ...current])
  }, [])

  return <AdminRuntimeContext.Provider value={{ notifications, logs, appendOperation }}>{children}</AdminRuntimeContext.Provider>
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "writes a runtime notification and runtime log after an admin operation"`
预期：PASS，通知抽屉和日志页都能读取运行时数据。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/context/AdminRuntimeContext.tsx src/admin/hooks/useAdminEntityCollection.ts src/admin/hooks/useAdminPageFilters.ts src/admin/hooks/useAdminOperationFeed.ts src/admin/types/admin.ts src/admin/config/navigation.ts src/admin/AdminLayout.tsx src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "feat: add admin runtime operation state"
```

## 任务 2：恢复课程抽屉的真实 CRUD 行为

**文件：**
- 修改：`src/admin/pages/courses/CoursesAdminPage.tsx`
- 修改：`src/admin/data/index.ts`
- 修改：`src/admin/components/AdminScaffold.tsx`
- 创建：`src/admin/components/AdminField.tsx`
- 测试：`src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：编写课程页新增 / 编辑 / 下线测试**

```tsx
it('creates a course and shows it in the courses table', async () => {
  renderAdminAt('/admin/courses')

  fireEvent.click(await screen.findByRole('button', { name: '新增课程' }))
  fireEvent.change(screen.getByLabelText('课程代码'), { target: { value: 'COMP9999' } })
  fireEvent.change(screen.getByLabelText('课程名称'), { target: { value: 'Testing Systems' } })
  fireEvent.click(screen.getByRole('button', { name: '保存课程' }))

  expect(await screen.findByText('COMP9999')).toBeInTheDocument()
  expect(screen.getByText('Testing Systems')).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "creates a course and shows it in the courses table"`
预期：FAIL，抽屉里没有真实表单字段或提交后表格未更新。

- [ ] **步骤 3：实现课程抽屉表单与本地 CRUD**

```tsx
const emptyCourseDraft: CourseDraft = {
  code: '',
  name: '',
  university: 'UNSW',
  credits: 6,
  teacher: '',
  tutor: '',
  summary: '',
}

const {
  rows,
  createEntity,
  updateEntity,
  patchStatus,
  activeRow,
  setActiveRow,
} = useAdminEntityCollection(courseSeed, { getId: (row) => row.id })
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "creates a course and shows it in the courses table"`
预期：PASS，新增课程后表格立即出现新行；补充手测编辑与下线流程。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/pages/courses/CoursesAdminPage.tsx src/admin/data/index.ts src/admin/components/AdminScaffold.tsx src/admin/components/AdminField.tsx src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "feat: add interactive course drawer workflow"
```

## 任务 3：恢复评价详情抽屉与处理流

**文件：**
- 创建：`src/admin/components/AdminReviewRatings.tsx`
- 修改：`src/admin/pages/reviews/ReviewsAdminPage.tsx`
- 修改：`src/admin/data/index.ts`
- 修改：`src/admin/types/admin.ts`
- 测试：`src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：编写评价处理测试**

```tsx
it('approves a review from the review drawer and updates the status badge', async () => {
  renderAdminAt('/admin/reviews')

  fireEvent.click(await screen.findAllByRole('button', { name: '查看' })[0])
  expect(await screen.findByText('评价正文')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '通过评价' }))

  expect(await screen.findByText('已通过')).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "approves a review from the review drawer and updates the status badge"`
预期：FAIL，详情抽屉缺少评分区或通过后状态未更新。

- [ ] **步骤 3：实现评价详情抽屉**

```tsx
type ReviewRatings = {
  difficulty: number
  homework: number
  grading: number
  harvest: number
}

<AdminFormDrawer open={drawerOpen} title="评价详情" onClose={closeDrawer}>
  <DetailGroup label="课程" value={activeRow.course} />
  <DetailGroup label="用户" value={activeRow.author} />
  <AdminReviewRatings ratings={activeRow.ratings} />
  <TagGroup tags={activeRow.tags} />
  <DetailGroup label="评价正文" value={activeRow.body} />
  <ActionFooter onApprove={handleApprove} onReject={handleReject} />
</AdminFormDrawer>
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "approves a review from the review drawer and updates the status badge"`
预期：PASS，评价详情抽屉可查看评分与标签，并在处理后更新状态和日志。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/components/AdminReviewRatings.tsx src/admin/pages/reviews/ReviewsAdminPage.tsx src/admin/data/index.ts src/admin/types/admin.ts src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "feat: restore interactive review moderation drawer"
```

## 任务 4：恢复用户抽屉与角色编辑

**文件：**
- 修改：`src/admin/pages/users/UsersAdminPage.tsx`
- 修改：`src/admin/components/AdminField.tsx`
- 修改：`src/admin/data/index.ts`
- 修改：`src/admin/types/admin.ts`
- 测试：`src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：编写用户停用与角色编辑测试**

```tsx
it('updates a user role and disables a user from the user drawer', async () => {
  renderAdminAt('/admin/users')

  fireEvent.click(await screen.findAllByRole('button', { name: '编辑' })[0])
  fireEvent.click(screen.getByLabelText('管理员'))
  fireEvent.click(screen.getByRole('button', { name: '保存账号' }))
  expect(await screen.findByText('管理员')).toBeInTheDocument()

  fireEvent.click(screen.getAllByRole('button', { name: '停用' })[0])
  fireEvent.click(await screen.findByRole('button', { name: '确认停用' }))
  expect(await screen.findByText('已停用')).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "updates a user role and disables a user from the user drawer"`
预期：FAIL，用户抽屉中没有真实角色字段或停用后状态不变。

- [ ] **步骤 3：实现用户抽屉与角色单选**

```tsx
<AdminField.RadioGroup
  label="角色"
  value={draft.role}
  options={[
    { value: 'user', label: '学生' },
    { value: 'operator', label: '教师' },
    { value: 'admin', label: '管理员' },
  ]}
  onChange={(value) => setDraft((current) => ({ ...current, role: value }))}
/>
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "updates a user role and disables a user from the user drawer"`
预期：PASS，用户抽屉可保存角色变更，停用后状态同步更新。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/pages/users/UsersAdminPage.tsx src/admin/components/AdminField.tsx src/admin/data/index.ts src/admin/types/admin.ts src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "feat: add interactive user drawer workflow"
```

## 任务 5：恢复中心弹窗类页面

**文件：**
- 创建：`src/admin/components/AdminEntityDialog.tsx`
- 修改：`src/admin/pages/universities/UniversitiesAdminPage.tsx`
- 修改：`src/admin/pages/teachers/TeachersAdminPage.tsx`
- 修改：`src/admin/pages/semesters/SemestersAdminPage.tsx`
- 修改：`src/admin/pages/tags/TagsAdminPage.tsx`
- 修改：`src/admin/components/AdminField.tsx`
- 修改：`src/admin/data/index.ts`

- [ ] **步骤 1：先实现中心弹窗壳**

```tsx
export default function AdminEntityDialog({ open, title, onClose, children, actions }: AdminEntityDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-6">
        {children}
        <div className="flex justify-end gap-3">{actions}</div>
      </div>
    </Modal>
  )
}
```

- [ ] **步骤 2：把院校 / 教师 / 学期 / 标签改为可提交弹窗**

```tsx
<AdminEntityDialog open={modalOpen} title="新增院校" onClose={closeModal} actions={dialogActions}>
  <AdminField.Input label="院校名称" value={draft.name} onChange={handleNameChange} />
  <AdminField.Input label="城市" value={draft.city} onChange={handleCityChange} />
  <AdminField.Input label="国家" value={draft.country} onChange={handleCountryChange} />
  <AdminField.Input label="联系邮箱" value={draft.contact} onChange={handleContactChange} />
</AdminEntityDialog>
```

- [ ] **步骤 3：运行针对性构建与页面测试**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx && npm run build`
预期：PASS，弹窗类页面可新增 / 编辑 / 删除，且构建通过。

- [ ] **步骤 4：手动核对与 `admin.html` 的容器差异**

运行：`npm run dev`
预期：院校、教师、学期、标签使用中心弹窗而非右侧抽屉，贴近原型中的 `tagModal`、`semesterModal`、`teacherModal`、`universityModal`。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/components/AdminEntityDialog.tsx src/admin/pages/universities/UniversitiesAdminPage.tsx src/admin/pages/teachers/TeachersAdminPage.tsx src/admin/pages/semesters/SemestersAdminPage.tsx src/admin/pages/tags/TagsAdminPage.tsx src/admin/components/AdminField.tsx src/admin/data/index.ts
git commit -m "feat: restore admin modal-based entity workflows"
```

## 任务 6：恢复消息流转与系统日志联动

**文件：**
- 修改：`src/admin/pages/messages/MessagesAdminPage.tsx`
- 修改：`src/admin/pages/logs/LogsAdminPage.tsx`
- 修改：`src/admin/AdminLayout.tsx`
- 修改：`src/admin/data/index.ts`
- 测试：`src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：编写消息撤回与日志联动测试**

```tsx
it('retracts a message and appends a log entry', async () => {
  renderAdminAt('/admin/messages')

  fireEvent.click(await screen.findAllByRole('button', { name: '撤回' })[0])
  fireEvent.click(await screen.findByRole('button', { name: '确认撤回' }))
  expect(await screen.findByText('已撤回')).toBeInTheDocument()

  await navigateTo('/admin/logs')
  expect(await screen.findByText(/撤回消息/)).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "retracts a message and appends a log entry"`
预期：FAIL，撤回后状态和系统日志未联动。

- [ ] **步骤 3：实现消息状态流转与日志写入**

```tsx
function handleRetract(row: MessageAdminRow) {
  patchStatus(row.id, {
    status: '已撤回',
    statusTone: 'danger',
  })

  appendOperation({
    module: '消息管理',
    title: '消息已撤回',
    description: `已撤回消息：${row.title}`,
    action: `撤回消息《${row.title}》`,
    status: '成功',
  })
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm test -- src/admin/pages/AdminPageBehaviors.test.tsx -t "retracts a message and appends a log entry"`
预期：PASS，消息撤回后表格、通知抽屉和日志页都更新。

- [ ] **步骤 5：Commit**

```bash
git add src/admin/pages/messages/MessagesAdminPage.tsx src/admin/pages/logs/LogsAdminPage.tsx src/admin/AdminLayout.tsx src/admin/data/index.ts src/admin/pages/AdminPageBehaviors.test.tsx
git commit -m "feat: wire admin messages with runtime logs"
```

## 任务 7：整体验证与回归测试

**文件：**
- 修改：`src/app/router.test.tsx`
- 测试：`src/admin/pages/AdminPageBehaviors.test.tsx`

- [ ] **步骤 1：补最终路由与交互回归断言**

```tsx
it('keeps admin notifications and system submenu available after runtime updates', async () => {
  renderAdminAt('/admin/messages')
  fireEvent.click(await screen.findByRole('button', { name: '新建消息' }))
  fireEvent.change(screen.getByLabelText('标题'), { target: { value: '回归测试消息' } })
  fireEvent.click(screen.getByRole('button', { name: '保存消息' }))

  fireEvent.click(screen.getByRole('button', { name: '通知' }))
  expect(await screen.findByText(/回归测试消息/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '系统日志' })).toBeInTheDocument()
})
```

- [ ] **步骤 2：运行完整验证**

运行：`npm run lint && npm test && npm run build`
预期：全部 PASS，无新的 ESLint、Vitest、TypeScript 错误。

- [ ] **步骤 3：手动核对关键原型页面**

运行：`npm run dev`
预期：
- `/admin/courses` 使用真实课程抽屉
- `/admin/reviews` 使用详情抽屉与评分区
- `/admin/users` 使用角色编辑抽屉
- `/admin/messages` 与 `/admin/logs` 有联动
- 院校 / 教师 / 学期 / 标签采用中心弹窗

- [ ] **步骤 4：整理变更清单**

运行：`git status --short && git log --oneline -n 5`
预期：工作区干净或只保留本次改动，提交历史清晰。

- [ ] **步骤 5：Commit**

```bash
git add src/admin src/app/router.test.tsx
git commit -m "feat: complete admin interactive restore"
```

## 自检结果

- 规格覆盖度：已覆盖本地 CRUD、容器差异、通知联动、日志联动、评价详情、消息流转与测试。
- 占位符扫描：计划中没有 `TODO`、`待定`、`后续实现` 等占位词。
- 类型一致性：统一使用 `useAdminEntityCollection`、`useAdminOperationFeed`、`AdminEntityDialog`、`AdminField`、`AdminReviewRatings`、`AdminRuntimeProvider` 等命名，没有跨任务漂移。
