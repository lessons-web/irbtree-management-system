# IRBTree Admin 域扩展设计

## 1. 背景

当前系统本质上是一个评课选课系统，已经具备以下能力：

- C 端课程列表、课程详情、选课推荐、个人中心与学习入口
- B 端后台课程管理、评价管理、院校管理、教师管理、学期管理、标签管理、用户管理、消息管理、日志管理

新的目标不是把“学员管理系统”作为外部系统嵌入，而是在现有系统之上扩展成一个统一平台：

- 保留现有评课与选课能力
- 增加学员管理能力
- 增加题库管理能力
- 用同一套课程主数据打通评课、学员、题库三条业务线

## 2. 设计目标

### 2.1 本次设计目标

- 在现有后台上扩展为统一业务后台，而不是新增第二套独立后台
- 将后台顶层导航重构为五大一级菜单：
  - 课程中心
  - 评课管理
  - 学员管理
  - 题库管理
  - 系统管理
- 建立独立的共享课程中心，作为评课、学员、题库三大业务域的公共基础
- 第一阶段优先落地 Admin 端，不展开 C 端学员学习流程的完整开发
- 保持当前前端内存态架构可继续演进，先完成信息架构、共享模型和关键页面骨架

### 2.2 非目标

- 本阶段不接真实后端数据库
- 本阶段不接支付网关
- 本阶段不实现在线判题或自动评分
- 本阶段不重做现有评课 C 端信息架构
- 本阶段不一次性完成所有学员端页面

## 3. 关键设计决策

### 3.1 后台不是多个系统拼接，而是一个统一后台

后台继续保留单一入口 `/admin`，所有模块共享：

- 同一套登录态
- 同一套角色权限
- 同一套布局、导航、表格、筛选、表单、日志与通知机制

这意味着后续新增学员管理、题库管理时，优先复用现有 `src/admin` 的页面脚手架、运行时状态和通用组件，而不是再起一套新目录结构。

### 3.2 课程中心成为顶层业务域

课程不再隐式从“评课管理”中借用，而是明确升级为独立顶层业务域：`课程中心`。

课程中心负责：

- 维护共享课程主数据
- 提供课程列表与课程详情的统一管理入口
- 维护课程与其他业务对象的关系视图
- 成为评课管理、学员管理、题库管理的引用源头

### 3.3 三个业务域围绕课程展开

- 评课管理：课程评价、教师、院校、学期等治理能力
- 学员管理：学员、报名课程、课程权限、有效期、缴费与备注
- 题库管理：题目、题目标签、模板附件、试卷、课程关联

三者共享课程中心，但各自保持独立页面边界和数据职责。

## 4. 后台信息架构

### 4.1 一级菜单

后台一级菜单固定为：

- 课程中心
- 评课管理
- 学员管理
- 题库管理
- 系统管理

### 4.2 二级菜单建议

#### 课程中心

- 课程列表
- 课程详情
- 课程关系视图

说明：

- `课程列表` 与 `课程详情` 复用并演进当前后台课程管理逻辑
- `课程关系视图` 用来汇总查看一门课程关联的评价、学员开通情况、题库资源情况

#### 评课管理

- 评价管理
- 院校管理
- 教师管理
- 学期管理

说明：

- 原 `标签管理` 不再作为评课管理独占页面，迁移到题库管理中的统一标签体系之下，或在后续拆成共享标签中心
- 现阶段先保留代码实现，但在信息架构上不再把标签当成评课域的一级能力

#### 学员管理

- 学员列表
- 学员详情
- 报名与开通
- 缴费记录
- 班级管理

说明：

- `学员详情` 是核心页面，聚合基础信息、课程权限、缴费记录、备注时间轴、学习概况
- `报名与开通` 与 `缴费记录` 可以先作为详情页内模块，后续再拆成独立列表页

#### 题库管理

- 题目列表
- 题目编辑
- 标签管理
- 试卷管理
- 资源模板

说明：

- `标签管理` 先落在题库管理域内，因为题目筛选、组卷、知识点归类会高度依赖标签
- `资源模板` 主要承载 `.py` 模板、资料附件等与课程题目相关的资源

#### 系统管理

- 用户与角色
- 消息通知
- 操作日志

## 5. 共享领域模型

### 5.1 核心原则

- 课程是主实体
- 评课、学员、题库都通过外键或引用关联课程
- 页面分域，但数据模型共享

### 5.2 共享核心实体

#### Course

建议作为共享课程中心的主实体，至少包含：

- `id`
- `code`
- `name`
- `schoolId`
- `teacherIds`
- `semesterId`
- `status`
- `category`
- `description`

用途：

- 评课课程列表和详情引用它
- 学员开通课程引用它
- 题目和试卷引用它

#### School

- `id`
- `name`
- `code`
- `status`

#### Teacher

- `id`
- `name`
- `email`
- `schoolId`
- `status`

#### Semester

- `id`
- `name`
- `schoolId`
- `status`
- `startAt`
- `endAt`

### 5.3 评课域实体

#### Review

- `id`
- `courseId`
- `userId`
- `ratings`
- `tags`
- `content`
- `status`
- `createdAt`

### 5.4 学员域实体

#### Student

- `id`
- `name`
- `email`
- `phone`
- `status`
- `registeredAt`

#### Enrollment

- `id`
- `studentId`
- `courseId`
- `validFrom`
- `validUntil`
- `status`
- `source`

#### PaymentRecord

- `id`
- `studentId`
- `courseId`
- `amount`
- `currency`
- `method`
- `paidAt`
- `operator`
- `status`
- `note`

#### StudentNote

- `id`
- `studentId`
- `content`
- `createdAt`
- `createdBy`

#### ClassGroup

- `id`
- `name`
- `courseId`
- `teacherId`
- `status`

### 5.5 题库域实体

#### Problem

- `id`
- `courseId`
- `title`
- `type`
- `difficulty`
- `status`
- `source`
- `answer`
- `analysis`

#### ProblemTag

- `id`
- `name`
- `scope`
- `status`

#### ProblemAttachment

- `id`
- `problemId`
- `fileName`
- `fileType`
- `url`

#### ExamPaper

- `id`
- `courseId`
- `name`
- `durationMinutes`
- `status`

#### ExamProblem

- `id`
- `examId`
- `problemId`
- `score`
- `sortOrder`

## 6. 路由与导航调整方案

### 6.1 路由分组

建议将后台路由从“平铺页面”升级为“域分组”结构：

- `/admin/course-center/*`
- `/admin/review-management/*`
- `/admin/student-management/*`
- `/admin/problem-bank/*`
- `/admin/system-management/*`

### 6.2 与现有路由的映射

现有页面先按业务语义迁移：

- `/admin/courses` -> `/admin/course-center/courses`
- `/admin/reviews` -> `/admin/review-management/reviews`
- `/admin/universities` -> `/admin/review-management/universities`
- `/admin/teachers` -> `/admin/review-management/teachers`
- `/admin/semesters` -> `/admin/review-management/semesters`
- `/admin/users` -> `/admin/system-management/users`
- `/admin/messages` -> `/admin/system-management/messages`
- `/admin/logs` -> `/admin/system-management/logs`

新增规划页面：

- `/admin/course-center/courses/:courseId`
- `/admin/course-center/relations`
- `/admin/student-management/students`
- `/admin/student-management/students/:studentId`
- `/admin/student-management/payments`
- `/admin/student-management/classes`
- `/admin/problem-bank/problems`
- `/admin/problem-bank/problems/:problemId`
- `/admin/problem-bank/tags`
- `/admin/problem-bank/exams`
- `/admin/problem-bank/assets`

### 6.3 导航配置调整

当前 `adminPrimaryNav` 与 `adminSystemNav` 是扁平数组，后续需要升级为“一级菜单 + 二级菜单”结构，例如：

```ts
type AdminNavGroup = {
  key: string
  label: string
  items: Array<{
    to: string
    label: string
  }>
}
```

这样可以让 `AdminLayout` 渲染分组导航，并为未来折叠、默认展开、权限裁剪提供基础。

## 7. 分阶段实施计划

### 7.1 阶段 0：后台信息架构重组

目标：

- 将后台导航升级为一级菜单 + 二级菜单
- 调整 `/admin` 路由为域分组结构
- 保留现有页面能力，但重新挂接到新路由下

产出：

- 新导航配置
- 新路由分组
- 兼容旧路径的别名或重定向
- 基础页面标题映射更新

### 7.2 阶段 1：课程中心落地

目标：

- 抽出共享课程域
- 将当前课程列表与课程详情后台逻辑正式归入课程中心
- 增加课程关系视图占位页

产出：

- 课程中心列表页
- 课程详情页
- 课程关系页占位
- 课程实体与跨域引用约定

### 7.3 阶段 2：学员管理核心闭环

目标：

- 新增学员列表与学员详情
- 在学员详情中完成课程开通、有效期、缴费记录、备注时间轴的第一版闭环

产出：

- 学员实体 mock 数据
- 学员列表页
- 学员详情页
- 报名与缴费模块

### 7.4 阶段 3：题库管理核心闭环

目标：

- 新增题目列表、题目编辑、标签管理、试卷管理
- 明确题目与课程的关联关系

产出：

- 题库实体 mock 数据
- 题目管理页面
- 题目标签页面
- 试卷管理页面

### 7.5 阶段 4：跨域联动与 C 端接入

目标：

- 打通课程详情与学员课程、题库资源之间的关联展示
- 将课程中心与 C 端课程详情、学习入口的关联规则沉淀下来

说明：

- 该阶段不作为当前实现起点
- 当前先聚焦 Admin 端

## 8. 第一阶段实施边界

本轮真正开始编码时，建议只覆盖以下内容：

- 后台导航改成五大一级菜单
- 新增二级菜单配置
- 新路由结构落地
- 课程中心页面迁移
- 学员管理页面骨架与 mock 数据

本轮不建议同时实现：

- 全量题库编辑复杂交互
- C 端学习闭环
- 后端持久化
- 权限细粒度矩阵

## 9. 验收标准

### 9.1 信息架构验收

- 后台存在五个一级菜单：课程中心、评课管理、学员管理、题库管理、系统管理
- 每个一级菜单下存在对应二级菜单
- `/admin` 默认能够进入新的后台结构
- 旧后台页面能在新导航结构下找到对应入口

### 9.2 共享模型验收

- 课程被定义为共享主实体
- 评课、学员、题库三域都以 `courseId` 关联课程
- 新增学员与题库数据模型时不再重复定义独立课程概念

### 9.3 第一阶段页面验收

- 课程中心可访问课程列表
- 学员管理至少具备学员列表与详情骨架
- 系统管理保留现有用户、消息、日志能力
- 现有评课管理页面迁移后仍可访问

## 10. 风险与约束

- 当前仓库以本地内存态数据为主，新增实体后需要统一运行时数据入口，否则后续会分散
- 现有后台页面有一部分是扁平路由和扁平导航，重组时要先保留兼容映射，避免直接打断现有测试
- `标签管理` 的最终归属未来可能从题库管理再抽到共享中心，但本阶段先放在题库管理更利于落地
- 课程详情目前同时服务 C 端与 B 端概念，后续要避免页面命名混淆，建议区分后台课程详情和前台课程详情
