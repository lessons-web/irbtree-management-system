export type AdminNavItem = {
  to: string
  label: string
}

export type AdminNavGroup = {
  key: 'course-center' | 'review-management' | 'student-management' | 'problem-bank' | 'system-management'
  label: string
  basePath: string
  items: AdminNavItem[]
}

export const adminDefaultPath = '/admin/course-center'

export const adminNavGroups: AdminNavGroup[] = [
  {
    key: 'course-center',
    label: '课程中心',
    basePath: adminDefaultPath,
    items: [],
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
  {
    key: 'student-management',
    label: '学员管理',
    basePath: '/admin/student-management',
    items: [{ to: '/admin/student-management/students', label: '学员列表' }],
  },
  {
    key: 'problem-bank',
    label: '题库管理',
    basePath: '/admin/problem-bank',
    items: [{ to: '/admin/problem-bank/tags', label: '标签管理' }],
  },
  {
    key: 'system-management',
    label: '系统管理',
    basePath: '/admin/system-management',
    items: [
      { to: '/admin/system-management/users', label: '用户管理' },
      { to: '/admin/system-management/messages', label: '消息管理' },
      { to: '/admin/system-management/logs', label: '系统日志' },
    ],
  },
]

export const adminPageTitles = new Map<string, string>([
  [adminDefaultPath, '课程列表'],
  ['/admin/review-management', '评价管理'],
  ['/admin/student-management', '学员列表'],
  ['/admin/problem-bank', '标签管理'],
  ['/admin/system-management', '用户管理'],
  ['/admin/courses', '课程列表'],
  ['/admin/reviews', '评价管理'],
  ['/admin/universities', '院校管理'],
  ['/admin/teachers', '教师管理'],
  ['/admin/semesters', '学期管理'],
  ['/admin/tags', '标签管理'],
  ['/admin/users', '用户管理'],
  ['/admin/messages', '消息管理'],
  ['/admin/logs', '系统日志'],
  ['/admin/review-management/reviews', '评价管理'],
  ['/admin/review-management/universities', '院校管理'],
  ['/admin/review-management/teachers', '教师管理'],
  ['/admin/review-management/semesters', '学期管理'],
  ['/admin/student-management/students', '学员列表'],
  ['/admin/problem-bank/tags', '标签管理'],
  ['/admin/system-management/users', '用户管理'],
  ['/admin/system-management/messages', '消息管理'],
  ['/admin/system-management/logs', '系统日志'],
])

export function getAdminPageTitle(pathname: string) {
  if (pathname.startsWith('/admin/student-management/students/')) {
    return '学员详情'
  }

  return adminPageTitles.get(pathname) ?? '后台管理'
}
