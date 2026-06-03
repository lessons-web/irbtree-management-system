import type { CourseLink, Enrollment, ProductCourse, Review, UniversityCourse } from './types'

export const universityCourses: UniversityCourse[] = [
  {
    id: 'uc_9021',
    code: 'COMP9021',
    name: 'Principles of Programming',
    schoolId: 'sch_unsw',
    termId: 'term_2024_t3',
  },
]

export const productCourses: ProductCourse[] = [{ id: 'pc_9021', slug: 'comp9021', name: '红黑树 COMP9021 学习课' }]

export const courseLinks: CourseLink[] = [{ id: 'cl_1', productCourseId: 'pc_9021', universityCourseId: 'uc_9021' }]

export const reviews: Review[] = [{ id: 'rv_1', universityCourseId: 'uc_9021', rating: 4.8, createdAt: '2026-06-03T00:00:00+08:00' }]

export const enrollments: Enrollment[] = [{ id: 'en_1', userId: 'u_mock', productCourseId: 'pc_9021', expiresAt: '2026-12-31T23:59:59+08:00' }]

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
