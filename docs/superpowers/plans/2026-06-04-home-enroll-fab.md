# 首页全宽布局 + 报名咨询悬浮按钮 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:executing-plans（内联执行）。

**目标：** 公共端布局去除 `max-w` 限制，让 header 与 main 占满宽度；在首页（`/`）右下角新增“报名咨询”悬浮按钮与弹卡，展示“联系教务完成报名”、微信号 `irbtree_cs`、一键复制与模拟二维码图片；确保 lint/build/test 通过并提交。

**架构：** 使用 TailwindCSS + React 组件实现悬浮按钮与弹卡；组件仅在首页渲染（放在 `HomePage` 内），复制功能使用 `navigator.clipboard.writeText` 并在 UI 上反馈“已复制”状态；二维码使用 `text_to_image` 生成 URL 作为 `<img src>`。

**技术栈：** React 19、react-router 7、Vite、TailwindCSS、Vitest、Testing Library

---

## 文件结构

- 修改：[PublicLayout.tsx](file:///Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/.worktrees/feat-merge-ia/src/app/PublicLayout.tsx) — 去除 header/main 的 `max-w-*` 限制，保持现有间距与 sticky header
- 创建：`src/pages/home/components/EnrollmentHelpFab.tsx` — 首页右下角悬浮按钮 + 弹卡（含复制/二维码）
- 修改：[HomePage.tsx](file:///Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/.worktrees/feat-merge-ia/src/pages/home/HomePage.tsx) — 引入并渲染悬浮按钮组件（确保仅 `/` 展示）
- 修改：[router.test.tsx](file:///Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/.worktrees/feat-merge-ia/src/app/router.test.tsx) — 增加测试：`/` 有悬浮按钮，`/review` 不显示

---

### 任务 1：公共端布局改为全宽

**文件：**
- 修改：[PublicLayout.tsx](file:///Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/.worktrees/feat-merge-ia/src/app/PublicLayout.tsx)

- [ ] **步骤 1：调整 header 内容容器为全宽**
  - 将 header 内层容器由 `mx-auto max-w-6xl` 调整为 `w-full`
  - 保留 `px-6 py-4` 与现有 flex 布局

- [ ] **步骤 2：调整 main 容器为全宽**
  - 将 `main` 容器由 `mx-auto max-w-6xl` 调整为 `w-full`
  - 保留 `px-6 py-10`

- [ ] **步骤 3：运行 lint（快速验证）**

运行：

```bash
npm run lint
```

预期：Exit code 0

---

### 任务 2：首页右下角“报名咨询”悬浮按钮 + 弹卡

**文件：**
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/.worktrees/feat-merge-ia/src/pages/home/components/EnrollmentHelpFab.tsx`
- 修改：[HomePage.tsx](file:///Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/.worktrees/feat-merge-ia/src/pages/home/HomePage.tsx)

- [ ] **步骤 1：创建悬浮组件（默认关闭，按钮固定右下角）**

要求：
- 按钮文字：`报名咨询`
- 弹卡内容：`联系教务完成报名`、微信号 `irbtree_cs`、复制按钮、模拟二维码图片
- 点击按钮展开/收起弹卡；弹卡打开时点击遮罩关闭

- [ ] **步骤 2：接入复制能力并提供 UI 状态反馈**

实现要点：
- 点击“复制微信号”执行 `navigator.clipboard.writeText('irbtree_cs')`
- 成功后按钮文字短暂变为 `已复制`（例如 1.5s 后自动恢复）

- [ ] **步骤 3：二维码图片使用 text_to_image URL**

示例格式（实际以常量实现）：

```ts
const url = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent('...')}&image_size=square`
```

- [ ] **步骤 4：在首页渲染组件（确保仅 `/` 生效）**

实现方式：在 `HomePage` JSX 末尾追加 `<EnrollmentHelpFab />`。

---

### 任务 3：测试覆盖（仅首页显示）

**文件：**
- 修改：[router.test.tsx](file:///Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/.worktrees/feat-merge-ia/src/app/router.test.tsx)

- [ ] **步骤 1：新增测试用例：`/` 能看到“报名咨询”按钮**

```tsx
it('shows enroll helper on home only', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] })

  render(<RouterProvider router={memoryRouter} />)
  expect(await screen.findByRole('button', { name: /报名咨询/ })).toBeInTheDocument()
})
```

- [ ] **步骤 2：新增测试用例：`/review` 不显示“报名咨询”按钮**

```tsx
it('does not show enroll helper on non-home routes', async () => {
  const routes = (router as unknown as { routes: RouteObject[] }).routes
  const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/review'] })

  render(<RouterProvider router={memoryRouter} />)
  expect(screen.queryByRole('button', { name: /报名咨询/ })).not.toBeInTheDocument()
})
```

- [ ] **步骤 3：运行测试**

运行：

```bash
npm test
```

预期：Exit code 0

---

### 任务 4：构建验证与提交

- [ ] **步骤 1：运行 build**

运行：

```bash
npm run build
```

预期：Exit code 0

- [ ] **步骤 2：提交**

运行：

```bash
git status
git add -A
git commit -m "feat: add home enroll helper and full-width public layout"
```

