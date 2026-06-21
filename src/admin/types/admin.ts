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

export type LogAdminRow = AdminOperationLog
