import type {
  AdminOption,
  AdminStatusTone,
  CourseAdminRow,
  LogAdminRow,
  MessageAdminRow,
  ReviewAdminRow,
  SemesterAdminRow,
  TagAdminRow,
  TeacherAdminRow,
  UniversityAdminRow,
  UserAdminRole,
  UserAdminRow,
  UserAdminStatus,
} from '../types/admin'

export const universityOptions: AdminOption[] = [
  { value: 'all', label: '所有院校' },
  { value: 'UNSW', label: 'UNSW' },
  { value: 'USYD', label: 'USYD' },
  { value: 'Monash', label: 'Monash' },
  { value: 'UQ', label: 'UQ' },
  { value: 'Melb', label: 'Melbourne' },
]

export const statusOptions: AdminOption[] = [
  { value: 'all', label: '全部状态' },
  { value: '已上线', label: '已上线' },
  { value: '待审核', label: '待审核' },
  { value: '已停用', label: '已停用' },
]

export const moderationOptions: AdminOption[] = [
  { value: 'all', label: '全部处理状态' },
  { value: '待复核', label: '待复核' },
  { value: '已通过', label: '已通过' },
  { value: '已驳回', label: '已驳回' },
]

export const roleOptions: AdminOption[] = [
  { value: 'all', label: '全部角色' },
  { value: 'user', label: '普通用户' },
  { value: 'operator', label: '运营' },
  { value: 'admin', label: '管理员' },
]

export const userRoleOptions: Array<{ value: UserAdminRole; label: string; description: string }> = [
  { value: 'user', label: '普通用户', description: 'user' },
  { value: 'operator', label: '运营', description: 'operator' },
  { value: 'admin', label: '管理员', description: 'admin' },
]

export const userStatusOptions: Array<{ value: UserAdminStatus; label: string }> = [
  { value: '正常', label: '正常' },
  { value: '重点账号', label: '重点账号' },
  { value: '已停用', label: '已停用' },
]

const userRoleLabelMap: Record<UserAdminRole, string> = {
  user: '普通用户',
  operator: '运营',
  admin: '管理员',
}

const userStatusToneMap: Record<UserAdminStatus, AdminStatusTone> = {
  正常: 'success',
  重点账号: 'info',
  已停用: 'danger',
}

export function getUserRoleLabel(role: UserAdminRole) {
  return userRoleLabelMap[role]
}

export function getUserStatusTone(status: UserAdminStatus) {
  return userStatusToneMap[status]
}

export const messageAudienceOptions: AdminOption[] = [
  { value: 'all', label: '全部对象' },
  { value: '全站用户', label: '全站用户' },
  { value: 'UNSW 学员', label: 'UNSW 学员' },
  { value: '教师账号', label: '教师账号' },
]

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
    id: 'course-comp9311',
    code: 'COMP9311',
    name: 'Database Systems',
    university: 'UNSW',
    credits: 6,
    teacher: 'Prof. Daniel Lee',
    tutor: 'Mike Wang',
    summary: '数据库设计、SQL 与事务模型。',
    status: '待审核',
    statusTone: 'warning',
    searchText: 'COMP9311 Database Systems UNSW Daniel Lee Mike Wang',
  },
  {
    id: 'course-info1110',
    code: 'INFO1110',
    name: 'Introduction to Programming',
    university: 'USYD',
    credits: 6,
    teacher: 'Dr. Sarah Davis',
    tutor: 'Lily Zhao',
    summary: '编程基础与工程化实践。',
    status: '已上线',
    statusTone: 'success',
    searchText: 'INFO1110 Introduction to Programming USYD Sarah Davis Lily Zhao',
  },
  {
    id: 'course-comp10001',
    code: 'COMP10001',
    name: 'Foundations of Computing',
    university: 'Melbourne',
    credits: 12,
    teacher: 'Dr. Ethan Chen',
    tutor: 'Nina Hu',
    summary: '计算机系统基础与离散思维。',
    status: '已停用',
    statusTone: 'danger',
    searchText: 'COMP10001 Foundations of Computing Melbourne Ethan Chen Nina Hu',
  },
]

export const reviewRows: ReviewAdminRow[] = [
  {
    id: 'review-1',
    course: 'COMP9021',
    courseTitle: 'Principles of Programming',
    author: 'Alex Student',
    rating: 4.8,
    ratingBreakdown: { difficulty: 4.6, homework: 4.9, grading: 4.1, harvest: 5.0 },
    tags: ['干货多', '作业密集'],
    submittedAt: '2026-06-18',
    moderation: '待复核',
    status: '待复核',
    statusTone: 'warning',
    content: '老师讲解节奏很稳，作业量大但每次练习都能把递归和抽象思维练出来，适合愿意投入时间的同学。',
    semester: '2026 T2',
    source: '课程详情页',
    helpfulCount: 19,
    issueFlags: ['短时间内获得多次点赞', '包含强情绪用词'],
    searchText:
      'COMP9021 Principles of Programming Alex Student 干货多 作业密集 2026 T2 课程详情页 老师讲解节奏很稳 作业量大 递归 抽象思维 待复核',
  },
  {
    id: 'review-2',
    course: 'COMP9311',
    courseTitle: 'Database Systems',
    author: 'Mia Chen',
    rating: 4.4,
    ratingBreakdown: { difficulty: 3.8, homework: 4.2, grading: 4.7, harvest: 4.9 },
    tags: ['给分稳', '实验多'],
    submittedAt: '2026-06-17',
    moderation: '已通过',
    status: '已通过',
    statusTone: 'success',
    content: '课程项目和实验都比较贴近数据库基础能力，老师答疑及时，期末复习资料也整理得很完整。',
    semester: '2026 T2',
    source: '移动端评价提交',
    helpfulCount: 11,
    issueFlags: [],
    moderationNote: '已完成人工抽检，内容可正常展示。',
    searchText:
      'COMP9311 Database Systems Mia Chen 给分稳 实验多 2026 T2 移动端评价提交 课程项目 实验 数据库基础能力 已通过',
  },
  {
    id: 'review-3',
    course: 'INFO1110',
    courseTitle: 'Introduction to Programming',
    author: 'Leo Zhou',
    rating: 2.9,
    ratingBreakdown: { difficulty: 4.1, homework: 3.7, grading: 2.2, harvest: 2.8 },
    tags: ['节奏快', '反馈一般'],
    submittedAt: '2026-06-15',
    moderation: '已驳回',
    status: '已驳回',
    statusTone: 'danger',
    content: '内容覆盖很广，但我感觉作业说明不够清晰，实验答疑时效也一般，新手上手会比较吃力。',
    semester: '2026 S1',
    source: '批量导入历史评价',
    helpfulCount: 4,
    issueFlags: ['与历史评价内容重复度较高'],
    moderationNote: '与历史库中已有评价重复度较高，已驳回并保留原记录供运营复核。',
    searchText:
      'INFO1110 Introduction to Programming Leo Zhou 节奏快 反馈一般 2026 S1 批量导入历史评价 作业说明不够清晰 实验答疑 一般 已驳回 重复度较高',
  },
]

export const universityRows: UniversityAdminRow[] = [
  {
    id: 'uni-unsw',
    name: 'UNSW',
    city: 'Sydney',
    country: 'Australia',
    courseCount: 328,
    contact: 'admin@unsw.edu.au',
    status: '已启用',
    statusTone: 'success',
    searchText: 'UNSW Sydney Australia admin@unsw.edu.au',
  },
  {
    id: 'uni-usyd',
    name: 'USYD',
    city: 'Sydney',
    country: 'Australia',
    courseCount: 241,
    contact: 'courses@sydney.edu.au',
    status: '已启用',
    statusTone: 'success',
    searchText: 'USYD Sydney Australia courses@sydney.edu.au',
  },
  {
    id: 'uni-melb',
    name: 'Melbourne',
    city: 'Melbourne',
    country: 'Australia',
    courseCount: 192,
    contact: 'courseadmin@unimelb.edu.au',
    status: '维护中',
    statusTone: 'warning',
    searchText: 'Melbourne Melbourne Australia courseadmin@unimelb.edu.au',
  },
]

export const teacherRows: TeacherAdminRow[] = [
  {
    id: 'teacher-james',
    name: 'Dr. James Smith',
    university: 'UNSW',
    courses: 'COMP9021 / COMP9024',
    title: 'Senior Lecturer',
    email: 'j.smith@unsw.edu.au',
    status: '活跃',
    statusTone: 'success',
    searchText: 'James Smith UNSW COMP9021 COMP9024 Senior Lecturer',
  },
  {
    id: 'teacher-daniel',
    name: 'Prof. Daniel Lee',
    university: 'UNSW',
    courses: 'COMP9311',
    title: 'Professor',
    email: 'd.lee@unsw.edu.au',
    status: '活跃',
    statusTone: 'success',
    searchText: 'Daniel Lee UNSW COMP9311 Professor',
  },
  {
    id: 'teacher-sarah',
    name: 'Dr. Sarah Davis',
    university: 'USYD',
    courses: 'INFO1110 / INFO1113',
    title: 'Associate Lecturer',
    email: 's.davis@sydney.edu.au',
    status: '待认证',
    statusTone: 'warning',
    searchText: 'Sarah Davis USYD INFO1110 INFO1113 Associate Lecturer',
  },
]

export const semesterRows: SemesterAdminRow[] = [
  {
    id: 'semester-2026t1',
    name: '2026 T1',
    year: '2026',
    range: '2026-02-16 ~ 2026-05-24',
    courseCount: 186,
    status: '进行中',
    statusTone: 'info',
    searchText: '2026 T1 2026 进行中',
  },
  {
    id: 'semester-2026t2',
    name: '2026 T2',
    year: '2026',
    range: '2026-06-01 ~ 2026-09-06',
    courseCount: 214,
    status: '筹备中',
    statusTone: 'warning',
    searchText: '2026 T2 2026 筹备中',
  },
  {
    id: 'semester-2025s2',
    name: '2025 S2',
    year: '2025',
    range: '2025-07-28 ~ 2025-11-02',
    courseCount: 173,
    status: '已归档',
    statusTone: 'neutral',
    searchText: '2025 S2 2025 已归档',
  },
]

export const tagRows: TagAdminRow[] = [
  {
    id: 'tag-hardcore',
    name: '硬核',
    scope: '课程评价',
    usageCount: 1823,
    description: '难度高、内容密集的课程标签。',
    status: '启用中',
    statusTone: 'success',
    searchText: '硬核 课程评价 1823',
  },
  {
    id: 'tag-easy-pass',
    name: '给分稳',
    scope: '课程评价',
    usageCount: 1290,
    description: '普遍反馈给分较友好的标签。',
    status: '启用中',
    statusTone: 'success',
    searchText: '给分稳 课程评价 1290',
  },
  {
    id: 'tag-outdated',
    name: '旧标签',
    scope: '系统保留',
    usageCount: 14,
    description: '等待迁移的历史标签。',
    status: '待下线',
    statusTone: 'warning',
    searchText: '旧标签 系统保留 14',
  },
]

export const userRows: UserAdminRow[] = [
  {
    id: 'user-alex',
    name: 'Alex Student',
    role: 'user',
    email: 'alex.student@irbtree.com',
    createdAt: '2026-01-08',
    lastSeen: '刚刚',
    status: '正常',
    statusTone: 'success',
    searchText: 'Alex Student 普通用户 user alex.student@irbtree.com',
  },
  {
    id: 'user-mia',
    name: 'Mia Chen',
    role: 'operator',
    email: 'mia.chen@irbtree.com',
    createdAt: '2025-11-22',
    lastSeen: '5 分钟前',
    status: '正常',
    statusTone: 'success',
    searchText: 'Mia Chen 运营 operator mia.chen@irbtree.com',
  },
  {
    id: 'admin-user',
    name: 'Admin User',
    role: 'admin',
    email: 'admin@irbtree.com',
    createdAt: '2025-06-12',
    lastSeen: '今天 09:30',
    status: '重点账号',
    statusTone: 'info',
    searchText: 'Admin User 管理员 admin admin@irbtree.com',
  },
]

export const messageRows: MessageAdminRow[] = [
  {
    id: 'message-1',
    title: '2026 T2 选课季开启提醒',
    audience: '全站用户',
    publishAt: '2026-06-18 10:00',
    author: 'Admin User',
    status: '已发送',
    statusTone: 'success',
    searchText: '2026 T2 选课季开启提醒 全站用户 Admin User',
  },
  {
    id: 'message-2',
    title: 'UNSW 新课程上线通知',
    audience: 'UNSW 学员',
    publishAt: '2026-06-17 18:30',
    author: 'Mia Chen',
    status: '草稿',
    statusTone: 'neutral',
    searchText: 'UNSW 新课程上线通知 UNSW 学员 Mia Chen',
  },
  {
    id: 'message-3',
    title: '教师认证流程更新',
    audience: '教师账号',
    publishAt: '2026-06-16 14:20',
    author: 'Admin User',
    status: '已排期',
    statusTone: 'info',
    searchText: '教师认证流程更新 教师账号 Admin User',
  },
]

export const logRows: LogAdminRow[] = [
  {
    id: 'log-1',
    module: '课程管理',
    actor: 'Admin User',
    action: '更新 COMP9311 课程简介',
    createdAt: '2026-06-18 09:42',
    status: '成功',
    statusTone: 'success',
    searchText: '课程管理 Admin User 更新 COMP9311 课程简介',
  },
  {
    id: 'log-2',
    module: '评价管理',
    actor: 'Mia Chen',
    action: '驳回 1 条异常评价',
    createdAt: '2026-06-18 08:10',
    status: '成功',
    statusTone: 'success',
    searchText: '评价管理 Mia Chen 驳回 1 条异常评价',
  },
  {
    id: 'log-3',
    module: '消息管理',
    actor: 'Admin User',
    action: '创建 2026 T2 选课提醒',
    createdAt: '2026-06-17 20:31',
    status: '已记录',
    statusTone: 'neutral',
    searchText: '消息管理 Admin User 创建 2026 T2 选课提醒',
  },
]
