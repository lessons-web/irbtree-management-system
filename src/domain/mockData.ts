import type { CourseLink, Enrollment, ProductCourse, Review, UniversityCourse } from './types'

export const universityCourses: UniversityCourse[] = [
  {
    id: 'uc_9021',
    code: 'COMP9021',
    name: 'Principles of Programming',
    schoolId: 'sch_unsw',
    termId: 'term_2024_t3',
  },
  {
    id: 'uc_9311',
    code: 'COMP9311',
    name: 'Database Systems',
    schoolId: 'sch_unsw',
    termId: 'term_2025_t1',
  },
  {
    id: 'uc_9101',
    code: 'COMP9101',
    name: 'Design and Analysis of Algorithms',
    schoolId: 'sch_unsw',
    termId: 'term_2025_t2',
  },
  {
    id: 'uc_1531',
    code: 'COMP1531',
    name: 'Software Engineering Fundamentals',
    schoolId: 'sch_unsw',
    termId: 'term_2025_t3',
  },
  {
    id: 'uc_2017',
    code: 'COMP2017',
    name: 'Systems Programming',
    schoolId: 'sch_usyd',
    termId: 'term_2025_s1',
  },
  {
    id: 'uc_2823',
    code: 'COMP2823',
    name: 'Computer Systems',
    schoolId: 'sch_usyd',
    termId: 'term_2025_s2',
  },
  {
    id: 'uc_30023',
    code: 'COMP30023',
    name: 'Computer Systems',
    schoolId: 'sch_unimelb',
    termId: 'term_2025_s1',
  },
  {
    id: 'uc_30024',
    code: 'COMP30024',
    name: 'Artificial Intelligence',
    schoolId: 'sch_unimelb',
    termId: 'term_2025_s2',
  },
]

export const productCourses: ProductCourse[] = [
  { id: 'pc_9021', slug: 'comp9021', name: '红黑树 COMP9021 学习课' },
  { id: 'pc_9311', slug: 'comp9311', name: '红黑树 COMP9311 学习课' },
]

export const courseLinks: CourseLink[] = [
  { id: 'cl_1', productCourseId: 'pc_9021', universityCourseId: 'uc_9021' },
  { id: 'cl_2', productCourseId: 'pc_9311', universityCourseId: 'uc_9311' },
]

export const reviews: Review[] = [
  { id: 'rv_1', universityCourseId: 'uc_9021', rating: 4.8, createdAt: '2026-06-03T00:00:00+08:00' },
  { id: 'rv_2', universityCourseId: 'uc_9311', rating: 4.6, createdAt: '2026-06-03T00:00:00+08:00' },
  { id: 'rv_3', universityCourseId: 'uc_9101', rating: 4.3, createdAt: '2026-06-03T00:00:00+08:00' },
  { id: 'rv_4', universityCourseId: 'uc_1531', rating: 4.1, createdAt: '2026-06-03T00:00:00+08:00' },
  { id: 'rv_5', universityCourseId: 'uc_2017', rating: 4.2, createdAt: '2026-06-03T00:00:00+08:00' },
  { id: 'rv_6', universityCourseId: 'uc_2823', rating: 4.0, createdAt: '2026-06-03T00:00:00+08:00' },
  { id: 'rv_7', universityCourseId: 'uc_30023', rating: 4.4, createdAt: '2026-06-03T00:00:00+08:00' },
  { id: 'rv_8', universityCourseId: 'uc_30024', rating: 4.5, createdAt: '2026-06-03T00:00:00+08:00' },
]

export const enrollments: Enrollment[] = [
  { id: 'en_1', userId: 'u_mock', productCourseId: 'pc_9021', expiresAt: '2026-12-31T23:59:59+08:00' },
]

export function findProductCourseByUniversityCourseId(universityCourseId: string) {
  const link = courseLinks.find((l) => l.universityCourseId === universityCourseId)
  if (!link) return null
  return productCourses.find((c) => c.id === link.productCourseId) ?? null
}

export function findUniversityCourseByProductCourseId(productCourseId: string) {
  const link = courseLinks.find((l) => l.productCourseId === productCourseId)
  if (!link) return null
  return universityCourses.find((c) => c.id === link.universityCourseId) ?? null
}
