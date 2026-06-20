import type { ReviewTerm } from '../features/review/types'

export type UserProfile = {
  name: string
  major: string
  location: string
  bio: string
  targetRole: string
  graduationTerm: string
}

export type CompletedCourse = {
  universityCourseId: string
  code: string
  term: ReviewTerm
  year: string
  grade: string
}

export type SavedCoursePlanItem = {
  universityCourseId: string
  recommendationReason: string
}

export type SavedCoursePlan = {
  id: string
  title: string
  year: string
  term: ReviewTerm
  status: 'draft' | 'saved'
  items: SavedCoursePlanItem[]
}

export const profile: UserProfile = {
  name: 'Alex Student',
  major: 'Computer Science',
  location: 'Sydney, AU',
  bio: '专注 CS 课程评价，主修 AI 方向，也会关注求职导向和 workload 平衡。',
  targetRole: 'Full Stack Developer',
  graduationTerm: '2027 T1',
}

export const completedCourses: CompletedCourse[] = [
  { universityCourseId: 'uc_1511', code: 'COMP1511', term: 'T1', year: '2024', grade: 'HD' },
  { universityCourseId: 'uc_1131', code: 'MATH1131', term: 'T1', year: '2024', grade: 'DN' },
  { universityCourseId: 'uc_1521', code: 'COMP1521', term: 'T2', year: '2024', grade: 'CR' },
  { universityCourseId: 'uc_2521', code: 'COMP2521', term: 'T3', year: '2024', grade: 'DN' },
]

export const savedCoursePlans: SavedCoursePlan[] = [
  {
    id: 'plan-2026-t1',
    title: '2026 T1 求职冲刺计划',
    year: '2026',
    term: 'T1',
    status: 'saved',
    items: [
      {
        universityCourseId: 'uc_9311',
        recommendationReason: '补齐后端与数据库基础，适配全栈方向。',
      },
      {
        universityCourseId: 'uc_1531',
        recommendationReason: '强化团队协作与工程实践，补足前端交互和项目交付能力。',
      },
    ],
  },
  {
    id: 'plan-2026-t2',
    title: '2026 T2 AI 进阶计划',
    year: '2026',
    term: 'T2',
    status: 'draft',
    items: [
      {
        universityCourseId: 'uc_9101',
        recommendationReason: '围绕 AI 与算法方向补强复杂度分析和解题能力。',
      },
    ],
  },
]
