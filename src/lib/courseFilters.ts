export type CourseSort = 'rating_desc' | 'rating_asc' | 'reviews_desc' | 'reviews_asc' | 'code_asc' | 'code_desc'

export type CourseFilterInput = {
  keyword?: string
  schoolId?: string
}

export type PaginationResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type FilterableCourse = {
  schoolId: string
  code: string
  name: string
  tags: string[]
}

type SortableCourse = {
  rating: number
  reviewCount: number
  code: string
}

function normalizeKeyword(keyword: string | undefined) {
  return (keyword ?? '').trim().toLowerCase()
}

function normalizeSchoolId(schoolId: string | undefined) {
  const normalized = (schoolId ?? 'all').trim()
  return normalized === '' ? 'all' : normalized
}

export function filterCourses<T extends FilterableCourse>(courseList: T[], input: CourseFilterInput = {}) {
  const keyword = normalizeKeyword(input.keyword)
  const schoolId = normalizeSchoolId(input.schoolId)

  return courseList.filter((course) => {
    const matchesKeyword =
      keyword === '' ||
      course.code.toLowerCase().includes(keyword) ||
      course.name.toLowerCase().includes(keyword) ||
      course.tags.some((tag) => tag.toLowerCase().includes(keyword))

    const matchesSchool = schoolId === 'all' || course.schoolId === schoolId

    return matchesKeyword && matchesSchool
  })
}

export function sortCourses<T extends SortableCourse>(courseList: T[], sort: CourseSort = 'rating_desc') {
  const sorted = [...courseList]

  sorted.sort((left, right) => {
    switch (sort) {
      case 'rating_asc':
        return left.rating - right.rating
      case 'reviews_desc':
        return right.reviewCount - left.reviewCount
      case 'reviews_asc':
        return left.reviewCount - right.reviewCount
      case 'code_asc':
        return left.code.localeCompare(right.code)
      case 'code_desc':
        return right.code.localeCompare(left.code)
      case 'rating_desc':
      default:
        return right.rating - left.rating
    }
  })

  return sorted
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10
  const total = items.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize)
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(Math.floor(page), 1), totalPages)
  const start = (safePage - 1) * safePageSize

  return {
    items: total === 0 ? [] : items.slice(start, start + safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  }
}

export function getSchoolIds<T extends Pick<FilterableCourse, 'schoolId'>>(courseList: T[]) {
  return Array.from(new Set(courseList.map((course) => course.schoolId))).sort((left, right) => left.localeCompare(right))
}
