import type { ReactNode } from 'react'

export type AdminStatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

export type AdminColumn<T> = {
  key: string
  header: string
  className?: string
  cellClassName?: string
  render: (row: T) => ReactNode
}

export type AdminOption = {
  value: string
  label: string
}

export type AdminOperationNotification = {
  id: string
  title: string
  description: string
  time: string
}

export type AdminBaseRow = {
  id: string
  status: string
  statusTone: AdminStatusTone
  searchText: string
}

export type AdminOperationLog = AdminBaseRow & {
  module: string
  actor: string
  action: string
  createdAt: string
}

export type AdminOperationInput = {
  module: string
  title: string
  description: string
  action: string
  actor?: string
  status?: string
  statusTone?: AdminStatusTone
}

export type CourseAdminRow = AdminBaseRow & {
  code: string
  name: string
  university: string
  credits: number
  teacher: string
  tutor: string
  summary: string
}

export type CourseDraft = {
  code: string
  name: string
  university: string
  credits: number
  teacher: string
  tutor: string
  summary: string
}

export type ReviewModerationStatus = '待复核' | '已通过' | '已驳回'

export type ReviewRatingBreakdown = {
  difficulty: number
  homework: number
  grading: number
  harvest: number
}

export type ReviewAdminRow = AdminBaseRow & {
  course: string
  courseTitle: string
  author: string
  rating: number
  ratingBreakdown: ReviewRatingBreakdown
  tags: string[]
  submittedAt: string
  moderation: ReviewModerationStatus
  content: string
  semester: string
  source: string
  helpfulCount: number
  issueFlags: string[]
  moderationNote?: string
}

export type UniversityAdminRow = AdminBaseRow & {
  name: string
  city: string
  country: string
  courseCount: number
  contact: string
}

export type UniversityDraft = {
  name: string
  city: string
  country: string
  contact: string
  courseCount: number
}

export type TeacherAdminRow = AdminBaseRow & {
  name: string
  university: string
  courses: string
  title: string
  email: string
}

export type TeacherDraft = {
  name: string
  university: string
  courses: string
  title: string
  email: string
  status: string
}

export type SemesterAdminRow = AdminBaseRow & {
  name: string
  year: string
  range: string
  courseCount: number
}

export type SemesterDraft = {
  name: string
  year: string
  range: string
  courseCount: number
  status: string
}

export type TagAdminRow = AdminBaseRow & {
  name: string
  scope: string
  usageCount: number
  description: string
}

export type TagDraft = {
  name: string
  scope: string
  description: string
  status: string
}

export type UserAdminRole = 'user' | 'operator' | 'admin'

export type UserAdminStatus = '正常' | '重点账号' | '已停用'

export type UserAdminRow = Omit<AdminBaseRow, 'status'> & {
  name: string
  role: UserAdminRole
  email: string
  createdAt: string
  lastSeen: string
  status: UserAdminStatus
}

export type UserDraft = {
  name: string
  email: string
  role: UserAdminRole
  status: UserAdminStatus
}

export type MessageAdminRow = AdminBaseRow & {
  title: string
  audience: string
  publishAt: string
  author: string
  content?: string
}

export type MessageDraft = {
  title: string
  audience: string
  publishAt: string
  content: string
}

export type StudentAdminStatus = 'active' | 'inactive'

export type EnrollmentAdminStatus = 'active' | 'expired' | 'pending'

export type PaymentAdminStatus = 'paid' | 'pending' | 'refunded'

export type ClassGroupAdminStatus = 'active' | 'archived'

export type ProblemDifficulty = 'easy' | 'medium' | 'hard'

export type ProblemAdminStatus = 'draft' | 'published'

export type ProblemTagStatus = 'active' | 'inactive'

export type ExamPaperAdminStatus = 'draft' | 'published'

export type ProblemAssetStatus = 'active' | 'archived'

export type StudentAdminRow = {
  id: string
  name: string
  email: string
  phone: string
  status: StudentAdminStatus
  registeredAt: string
}

export type StudentRuntimeRow = StudentAdminRow & {
  enrolledCourseCount: number
}

export type EnrollmentAdminRow = {
  id: string
  studentId: string
  courseId: string
  validFrom: string
  validUntil: string
  status: EnrollmentAdminStatus
  source: string
}

export type PaymentAdminRow = {
  id: string
  studentId: string
  courseId: string
  amount: number
  currency: string
  method: string
  paidAt: string
  operator: string
  status: PaymentAdminStatus
  note: string
}

export type StudentNoteAdminRow = {
  id: string
  studentId: string
  content: string
  createdAt: string
  createdBy: string
}

export type ClassGroupAdminRow = {
  id: string
  name: string
  courseId: string
  teacherId: string
  status: ClassGroupAdminStatus
}

export type ProblemAdminRow = {
  id: string
  courseId: string
  title: string
  type: string
  difficulty: ProblemDifficulty
  status: ProblemAdminStatus
  source: string
  answer: string
  analysis: string
}

export type ProblemTagAdminRow = {
  id: string
  name: string
  scope: string
  status: ProblemTagStatus
}

export type ExamPaperAdminRow = {
  id: string
  courseId: string
  name: string
  durationMinutes: number
  status: ExamPaperAdminStatus
}

export type ExamProblemAdminRow = {
  id: string
  examId: string
  problemId: string
  score: number
  sortOrder: number
}

export type ProblemAssetAdminRow = {
  id: string
  problemId: string
  fileName: string
  fileType: string
  url: string
  status: ProblemAssetStatus
}

export type LogAdminRow = AdminOperationLog
