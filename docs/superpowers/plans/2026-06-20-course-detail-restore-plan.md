# 课程详情页截图1还原 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `/course/:code` 课程详情页还原为用户提供的截图1视觉样式，同时保留现有数据与交互逻辑。

**架构：** 以 `CourseDetailPage` 为中心重排页面结构，保留 `useReview()` 提供的数据和操作方法；同步微调 `RatingDashboard`、`UserHeader`、`UserFooter` 和 `FloatingConsultButton` 的视觉表现，使课程详情页进入后整体观感对齐截图1。评论区与操作按钮只做表现层改造，不重写业务流。

**技术栈：** React 19、React Router 7、TypeScript、Tailwind CSS 4、Vitest、Testing Library

---

## 文件结构

- 修改：`src/pages/course-detail/CourseDetailPage.tsx`
  - 重构课程详情页主体布局、顶部信息区、右侧纵向操作按钮、关联学习课弱化卡片、评论区结构
- 修改：`src/components/user/RatingDashboard.tsx`
  - 调整评分卡视觉样式与彩色评分条
- 修改：`src/components/user/UserHeader.tsx`
  - 微调顶部导航密度与用户区视觉，使课程详情页整体观感更轻
- 修改：`src/components/user/UserFooter.tsx`
  - 调整页脚的高度、字号与存在感
- 修改：`src/components/user/FloatingConsultButton.tsx`
  - 调整悬浮按钮尺寸与面板卡片视觉
- 测试：`src/pages/task5-user-pages.test.tsx`
  - 如现有页面快照或文案断言受影响则同步更新

## 任务 1：锁定课程详情页结构

**文件：**
- 修改：`src/pages/course-detail/CourseDetailPage.tsx`

- [ ] **步骤 1：阅读现有页面与截图1的差异点**

核对以下区域：

```tsx
// 现有页面关键区域
// 1. 顶部返回入口与标题
// 2. 课程信息白卡 + 右侧评分卡
// 3. 关联学习课模块
// 4. 评论列表卡片
```

- [ ] **步骤 2：重排页面骨架**

将页面分成以下块：

```tsx
<div className="space-y-6">
  <header>{/* 返回入口 + 标题 + 顶部按钮 */}</header>
  <section>{/* 左侧课程信息卡 + 右侧评分卡 + 右侧纵向圆形按钮 */}</section>
  <section>{/* 低强调关联学习课 */}</section>
  <section>{/* 学生评价区与写评价按钮 */}</section>
</div>
```

- [ ] **步骤 3：保留现有交互逻辑**

确保下列行为不变：

```tsx
onClick={() => requireAuth(() => toggleLike(course.universityCourseId))}
onClick={() => requireAuth(() => toggleFavorite(course.universityCourseId))}
onClick={() =>
  openReview({
    courseName: `${detail.code} ${detail.name}`,
    onSubmit: (payload) => addReview(course.universityCourseId, payload),
  })
}
```

- [ ] **步骤 4：运行页面相关测试**

运行：`npm test -- src/pages/task5-user-pages.test.tsx src/app/router.test.tsx`
预期：与课程详情页相关测试保持通过，若文案结构变化导致失败则进入后续任务修正测试。

## 任务 2：重做评分卡与首屏视觉

**文件：**
- 修改：`src/components/user/RatingDashboard.tsx`
- 修改：`src/pages/course-detail/CourseDetailPage.tsx`

- [ ] **步骤 1：改写评分卡样式**

评分卡目标结构：

```tsx
<section className="rounded-[24px] border border-slate-200 bg-[#f4f7ff] p-5">
  <div className="text-sm font-semibold text-slate-700">总体评分</div>
  <div className="mt-3 flex items-end justify-between">
    <div className="flex items-center gap-2">
      <Star className="fill-amber-400 text-amber-400" />
      <span className="text-4xl font-bold text-slate-900">{course.rating.toFixed(1)}</span>
    </div>
  </div>
</section>
```

- [ ] **步骤 2：将四维评分条改为彩色条**

颜色建议：

```tsx
const barColors = {
  difficulty: 'bg-rose-500',
  homework: 'bg-indigo-500',
  grading: 'bg-emerald-500',
  harvest: 'bg-amber-500',
}
```

- [ ] **步骤 3：将课程信息卡改为截图1风格**

保留数据字段但重排内容：

```tsx
<section className="rounded-[26px] border border-slate-200 bg-white p-8 shadow-sm">
  {/* 标题、讲师、简介、前置要求、课程标签 */}
</section>
```

- [ ] **步骤 4：本地运行页面检查**

运行：`npm run dev -- --host 127.0.0.1`
访问：`/course/COMP9021`
预期：首屏信息卡、评分卡与截图1结构一致。

## 任务 3：重做评论区与侧边操作按钮

**文件：**
- 修改：`src/pages/course-detail/CourseDetailPage.tsx`

- [ ] **步骤 1：补齐右侧纵向圆形操作按钮**

目标结构：

```tsx
<aside className="hidden xl:flex xl:flex-col xl:gap-4">
  <button className="h-14 w-14 rounded-full border bg-white" />
  <button className="h-14 w-14 rounded-full border bg-white" />
  <button className="h-14 w-14 rounded-full border bg-white" />
</aside>
```

- [ ] **步骤 2：将评论区改为大卡片列表**

评论块结构：

```tsx
<section className="rounded-[26px] border border-slate-200 bg-white p-8">
  <div className="flex items-center justify-between">{/* 标题 + 写评价 */}</div>
  <div className="mt-6 space-y-6">{/* 评论项 */}</div>
</section>
```

- [ ] **步骤 3：为评论项加入头像、标签、回复块**

目标字段映射：

```tsx
review.user
`${review.year} ${review.term}`
review.tags
review.content
review.replies
```

- [ ] **步骤 4：修正受影响测试**

如果断言失败，更新 `src/pages/task5-user-pages.test.tsx` 中仍应成立的结构性断言，例如课程标题、关联学习课、评论提交入口等。

## 任务 4：微调全局视觉组件

**文件：**
- 修改：`src/components/user/UserHeader.tsx`
- 修改：`src/components/user/UserFooter.tsx`
- 修改：`src/components/user/FloatingConsultButton.tsx`

- [ ] **步骤 1：压缩 Header 密度**

目标变化：

```tsx
<header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
  <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-6">
```

- [ ] **步骤 2：减轻 Footer 存在感**

目标变化：

```tsx
<footer className="mt-auto border-t border-slate-200 bg-white">
  <div className="mx-auto flex max-w-[1180px] ... py-4 text-xs text-slate-400">
```

- [ ] **步骤 3：缩小悬浮咨询按钮**

目标变化：

```tsx
<button className="fixed right-6 bottom-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white" />
```

- [ ] **步骤 4：运行相关诊断**

运行：`eslint` 或 `GetDiagnostics`
预期：修改文件没有新增 lint / type 诊断。

## 任务 5：完整验证

**文件：**
- 修改：`src/pages/task5-user-pages.test.tsx`（如需要）

- [ ] **步骤 1：运行目标测试集**

运行：`npm test -- src/pages/task5-user-pages.test.tsx src/app/router.test.tsx src/components/user/task3-shells.test.tsx`
预期：PASS

- [ ] **步骤 2：运行构建**

运行：`npm run build`
预期：构建成功，无 TypeScript 报错

- [ ] **步骤 3：人工检查页面**

打开：`http://127.0.0.1:5174/course/COMP9021`
重点检查：

```text
1. 标题区与按钮布局
2. 评分卡配色与圆角
3. 评论区卡片与回复块
4. 右侧圆形操作按钮
5. 底部与悬浮咨询按钮
```

- [ ] **步骤 4：Commit**

```bash
git add src/pages/course-detail/CourseDetailPage.tsx src/components/user/RatingDashboard.tsx src/components/user/UserHeader.tsx src/components/user/UserFooter.tsx src/components/user/FloatingConsultButton.tsx docs/superpowers/specs/2026-06-20-course-detail-restore-design.md docs/superpowers/plans/2026-06-20-course-detail-restore-plan.md
git commit -m "feat: restore course detail page layout"
```
