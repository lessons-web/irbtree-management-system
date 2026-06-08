# 用户端 React 化迁移实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `docs/index.html` 的用户端前台完整迁移为基于 React Router、Tailwind 和 mock 数据的可维护 React 实现。

**架构：** 使用 `UserLayout + React Router + 页面组件 + 共享弹窗/抽屉组件 + 本地 mock 数据` 的结构替换当前单文件原型。页面按首页、课程列表、课程详情、个人中心、推荐页拆分，登录弹窗、评价抽屉、已修课程抽屉由 React 状态统一驱动，所有交互以本地数据跑通首期流程。

**技术栈：** React 19、TypeScript、Vite、React Router、Tailwind CSS、lucide-react、@phosphor-icons/react

---

## 文件结构

**创建：**

- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/app/router.tsx` - 用户端路由定义
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/layouts/UserLayout.tsx` - 前台统一布局
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/data/courses.ts` - 课程列表、课程详情、热门课程、推荐数据
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/data/profile.ts` - 用户资料、点赞、收藏、回复、已修课程数据
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/data/reviews.ts` - 评论、标签、评分初始值
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/common/Modal.tsx` - 通用模态框
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/common/Drawer.tsx` - 通用侧边抽屉
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/common/Pagination.tsx` - 分页组件
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/UserHeader.tsx` - 前台头部导航
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/UserFooter.tsx` - 前台页脚
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/CourseCard.tsx` - 首页热门课程卡片
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/CourseListItem.tsx` - 课程列表项
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/HeroSearch.tsx` - 首页 Hero 搜索区
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/LoginModal.tsx` - 登录弹窗
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/ReviewDrawer.tsx` - 写评价抽屉
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/CompletedCourseDrawer.tsx` - 已修课程抽屉
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/FloatingConsultButton.tsx` - 课程咨询悬浮按钮
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/RatingDashboard.tsx` - 详情页评分面板
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/home/HomePage.tsx` - 首页
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/courses/CoursesPage.tsx` - 课程列表页
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/course-detail/CourseDetailPage.tsx` - 课程详情页
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/profile/ProfilePage.tsx` - 个人中心
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/recommendation/RecommendationPage.tsx` - 推荐页
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/lib/courseFilters.ts` - 课程筛选、排序、分页逻辑

**修改：**

- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/package.json` - 增加 Phosphor React 图标依赖
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/package-lock.json` - 锁文件
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/App.tsx` - 改为路由入口
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/main.tsx` - 保持入口最简
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/index.css` - 补充全局变量、滚动与动效基线

**验证：**

- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/App.tsx`
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/app/router.tsx`
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/**`
- `/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/**`

---

### 任务 1：建立用户端路由骨架与统一布局

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/package.json`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/package-lock.json`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/app/router.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/layouts/UserLayout.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/App.tsx`

- [ ] **步骤 1：安装 Phosphor React 图标依赖**

```bash
npm install @phosphor-icons/react --cache .npm-cache
```

- [ ] **步骤 2：创建路由入口**

```tsx
import { createBrowserRouter } from "react-router";
import UserLayout from "../layouts/UserLayout";
import HomePage from "../pages/home/HomePage";
import CoursesPage from "../pages/courses/CoursesPage";
import CourseDetailPage from "../pages/course-detail/CourseDetailPage";
import ProfilePage from "../pages/profile/ProfilePage";
import RecommendationPage from "../pages/recommendation/RecommendationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "course/:code", element: <CourseDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "recommendation", element: <RecommendationPage /> },
    ],
  },
]);
```

- [ ] **步骤 3：将 App 简化为 RouterProvider**

```tsx
import { RouterProvider } from "react-router";
import { router } from "./app/router";

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **步骤 4：创建统一前台布局**

```tsx
import { Outlet } from "react-router";
import UserHeader from "../components/user/UserHeader";
import UserFooter from "../components/user/UserFooter";
import FloatingConsultButton from "../components/user/FloatingConsultButton";

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <UserHeader />
      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
      <UserFooter />
      <FloatingConsultButton />
    </div>
  );
}
```

- [ ] **步骤 5：运行构建确认路由骨架可编译**

运行：`npm run build`

预期：构建成功，若页面组件尚未创建则先补最小占位组件使路由可编译。

- [ ] **步骤 6：Commit**

```bash
git add package.json package-lock.json src/App.tsx src/app/router.tsx src/layouts/UserLayout.tsx
git commit -m "feat: scaffold user frontend router and layout"
```

### 任务 2：沉淀 mock 数据与筛选逻辑

**文件：**
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/data/courses.ts`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/data/profile.ts`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/data/reviews.ts`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/lib/courseFilters.ts`

- [ ] **步骤 1：从原 HTML 整理课程数据结构**

```ts
export type Course = {
  code: string;
  name: string;
  school: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  lecturer: string;
  tutors: string[];
  units: string;
  prerequisite: string;
  ratingBreakdown: {
    difficulty: number;
    homework: number;
    grading: number;
    harvest: number;
  };
};
```

- [ ] **步骤 2：写入首页热门课程、课程列表和详情 mock 数据**

```ts
export const featuredCourseCodes = ["COMP9021", "FINC5001", "MKTG1001"];
export const courses: Course[] = [
  {
    code: "COMP9021",
    name: "Principles of Programming",
    school: "UNSW",
    rating: 4.8,
    reviewCount: 124,
    tags: ["较友好", "作业多", "干货满满"],
    description: "课程内容非常扎实，强调编程基础与解题能力。",
    lecturer: "Eric Martin",
    tutors: ["Alice", "Ben"],
    units: "6 UOC",
    prerequisite: "COMP9031",
    ratingBreakdown: { difficulty: 2.5, homework: 4, grading: 3, harvest: 4.5 },
  },
];
```

- [ ] **步骤 3：整理个人中心与评论数据**

```ts
export const profile = {
  name: "Alex Student",
  major: "Computer Science",
  location: "Sydney, AU",
  bio: "专注 CS 课程评价，主修 AI 方向。",
};

export const reviewTags = ["较友好", "避雷", "作业多", "考试难", "干货满满"];
```

- [ ] **步骤 4：实现筛选、排序和分页纯函数**

```ts
export function filterCourses(courses: Course[], keyword: string, school: string) {
  return courses.filter((course) => {
    const matchesKeyword =
      keyword === "" ||
      course.code.toLowerCase().includes(keyword.toLowerCase()) ||
      course.name.toLowerCase().includes(keyword.toLowerCase());
    const matchesSchool = school === "all" || course.school === school;
    return matchesKeyword && matchesSchool;
  });
}
```

- [ ] **步骤 5：运行构建确认数据与工具函数类型正确**

运行：`npm run build`

预期：构建成功，无类型错误。

- [ ] **步骤 6：Commit**

```bash
git add src/data src/lib/courseFilters.ts
git commit -m "feat: add user frontend mock data and course filter helpers"
```

### 任务 3：实现共享组件与全局交互容器

**文件：**
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/common/Modal.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/common/Drawer.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/common/Pagination.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/UserHeader.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/UserFooter.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/LoginModal.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/ReviewDrawer.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/CompletedCourseDrawer.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/FloatingConsultButton.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/index.css`

- [ ] **步骤 1：创建通用 Modal 组件**

```tsx
type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};
```

- [ ] **步骤 2：创建右侧 Drawer 组件**

```tsx
type DrawerProps = {
  open: boolean;
  widthClassName?: string;
  onClose: () => void;
  children: React.ReactNode;
};
```

- [ ] **步骤 3：实现 Header、Footer 和课程咨询浮层**

```tsx
<button
  type="button"
  className="fixed right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800"
>
  <ChatsCircle size={22} weight="fill" />
</button>
```

- [ ] **步骤 4：实现登录弹窗和两类抽屉的受控开关**

```tsx
const [loginOpen, setLoginOpen] = useState(false);
const [reviewOpen, setReviewOpen] = useState(false);
const [completedOpen, setCompletedOpen] = useState(false);
```

- [ ] **步骤 5：补充全局样式基线**

```css
:root {
  --color-primary: #4f46e5;
  --color-secondary: #6366f1;
}

body {
  background: #f9fafb;
  color: #111827;
}
```

- [ ] **步骤 6：运行构建和 lint**

运行：`npm run build && npm run lint`

预期：构建与 lint 均通过。

- [ ] **步骤 7：Commit**

```bash
git add src/components/common src/components/user src/index.css
git commit -m "feat: add shared user frontend shells and overlay components"
```

### 任务 4：迁移首页与课程列表页

**文件：**
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/CourseCard.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/CourseListItem.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/HeroSearch.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/home/HomePage.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/courses/CoursesPage.tsx`

- [ ] **步骤 1：实现首页 Hero 与统计卡片**

```tsx
<section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white pb-16 pt-12 lg:pt-20">
  <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
  <div className="relative mx-auto max-w-4xl px-4 text-center">
    <span className="mb-4 inline-block rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
      2024 选课季必备
    </span>
  </div>
</section>
```

- [ ] **步骤 2：实现热门课程卡片与详情跳转**

```tsx
<Link to={`/course/${course.code}`} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
  <div className="flex items-start justify-between">
    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">{course.school}</span>
    <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-gray-700">
      <Star size={12} weight="fill" className="text-yellow-400" />
      {course.rating}
    </span>
  </div>
</Link>
```

- [ ] **步骤 3：实现课程列表页筛选、排序、分页**

```tsx
const filteredCourses = useMemo(() => {
  const result = filterCourses(courses, keyword, school);
  return sortCourses(result, sortBy);
}, [keyword, school, sortBy]);
```

- [ ] **步骤 4：补足分页控件与重置筛选**

```tsx
<button
  type="button"
  onClick={() => {
    setKeyword("");
    setSchool("all");
    setSortBy("rating_desc");
  }}
>
  重置筛选
</button>
```

- [ ] **步骤 5：运行构建与 lint**

运行：`npm run build && npm run lint`

预期：首页与课程列表页编译通过，页面无未使用变量与类型错误。

- [ ] **步骤 6：Commit**

```bash
git add src/components/user/CourseCard.tsx src/components/user/CourseListItem.tsx src/components/user/HeroSearch.tsx src/pages/home/HomePage.tsx src/pages/courses/CoursesPage.tsx
git commit -m "feat: migrate home and courses pages to react"
```

### 任务 5：迁移课程详情、个人中心与推荐页

**文件：**
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/RatingDashboard.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/course-detail/CourseDetailPage.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/profile/ProfilePage.tsx`
- 创建：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/recommendation/RecommendationPage.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/ReviewDrawer.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/components/user/CompletedCourseDrawer.tsx`

- [ ] **步骤 1：实现课程详情页主结构**

```tsx
const { code = "" } = useParams();
const course = courses.find((item) => item.code === code);

if (!course) {
  return <div className="mx-auto max-w-6xl px-4 py-16 text-gray-500">未找到该课程。</div>;
}
```

- [ ] **步骤 2：实现评分面板与评论区**

```tsx
<RatingDashboard breakdown={course.ratingBreakdown} rating={course.rating} />
<section className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
  <h3 className="mb-6 text-xl font-bold text-gray-900">学生评价</h3>
</section>
```

- [ ] **步骤 3：实现个人中心 tabs 与已修课程交互**

```tsx
const [activeTab, setActiveTab] = useState<"likes" | "favorites" | "replies" | "completed">("likes");
```

- [ ] **步骤 4：实现推荐页结构与 mock 结果**

```tsx
export default function RecommendationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">选课推荐</h1>
    </div>
  );
}
```

- [ ] **步骤 5：把写评价、添加已修课程动作接入对应页面**

```tsx
<button type="button" onClick={() => setReviewOpen(true)}>
  写评价
</button>
```

- [ ] **步骤 6：运行构建与 lint**

运行：`npm run build && npm run lint`

预期：详情页、个人中心、推荐页通过构建与 lint。

- [ ] **步骤 7：Commit**

```bash
git add src/components/user/RatingDashboard.tsx src/pages/course-detail/CourseDetailPage.tsx src/pages/profile/ProfilePage.tsx src/pages/recommendation/RecommendationPage.tsx src/components/user/ReviewDrawer.tsx src/components/user/CompletedCourseDrawer.tsx
git commit -m "feat: migrate detail profile and recommendation pages"
```

### 任务 6：整合交互、清理原型残留并完成验收

**文件：**
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/App.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/layouts/UserLayout.tsx`
- 修改：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/src/pages/**`
- 验证：`/Users/luffyzh/luffyzh/github/irbtree/irbtree-management-system/docs/index.html`

- [ ] **步骤 1：移除当前临时三端原型入口残留**

```tsx
// 删除 App.tsx 中当前 visitor / student / admin 的单文件原型逻辑，
// 最终只保留 RouterProvider。
```

- [ ] **步骤 2：逐页对照原 HTML 检查视觉与交互**

运行：`open docs/index.html`

预期：逐项比对 Header、Hero、课程卡片、列表筛选、详情页、个人中心、推荐页，以及登录/评价/已修课程交互。

- [ ] **步骤 3：运行最终验证命令**

运行：`npm run build && npm run lint`

预期：全部通过。

- [ ] **步骤 4：检查编辑器诊断**

```text
确保 src/App.tsx、src/app/router.tsx、src/layouts/UserLayout.tsx、src/pages/**、src/components/** 无新增诊断错误。
```

- [ ] **步骤 5：Commit**

```bash
git add src/App.tsx src/layouts/UserLayout.tsx src/app/router.tsx src/components src/pages src/data src/lib
git commit -m "feat: complete user frontend react migration"
```
