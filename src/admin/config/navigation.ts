export type AdminNavItem = {
  to: string
  label: string
}

export const adminPrimaryNav: AdminNavItem[] = [
  { to: '/admin/courses', label: '课程管理' },
  { to: '/admin/reviews', label: '评价管理' },
  { to: '/admin/universities', label: '院校管理' },
  { to: '/admin/teachers', label: '教师管理' },
  { to: '/admin/semesters', label: '学期管理' },
  { to: '/admin/tags', label: '标签管理' },
  { to: '/admin/users', label: '用户管理' },
]

export const adminSystemNav: AdminNavItem[] = [
  { to: '/admin/messages', label: '消息管理' },
  { to: '/admin/logs', label: '系统日志' },
]

export const adminPageTitles = new Map<string, string>([
  ['/admin/courses', '课程管理'],
  ['/admin/reviews', '评价管理'],
  ['/admin/universities', '院校管理'],
  ['/admin/teachers', '教师管理'],
  ['/admin/semesters', '学期管理'],
  ['/admin/tags', '标签管理'],
  ['/admin/users', '用户管理'],
  ['/admin/messages', '消息管理'],
  ['/admin/logs', '系统日志'],
])

export const adminNotificationSeed = [
  {
    id: 'notification-review-risk',
    title: '评价治理待处理',
    description: 'COMP9021 收到 3 条需要复核的新评价，请尽快处理。',
    time: '2 分钟前',
  },
  {
    id: 'notification-course-created',
    title: '课程信息已更新',
    description: '课程 COMP9311 的任课老师与课程简介已同步更新。',
    time: '30 分钟前',
  },
  {
    id: 'notification-message-published',
    title: '系统消息已发布',
    description: '2026 T2 选课季提醒已成功发送至全部用户。',
    time: '今天 09:40',
  },
]
