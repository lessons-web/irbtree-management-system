import { describe, expect, it } from 'vitest'
import { universityCourses } from '../domain/mockData'
import { courseCatalog } from './courses'
import { completedCourses } from './profile'

describe('task2 data quality', () => {
  it('keeps course catalog free of static rating aggregates', () => {
    expect(courseCatalog.every((course) => !('rating' in (course as Record<string, unknown>)))).toBe(true)
    expect(courseCatalog.every((course) => !('reviewCount' in (course as Record<string, unknown>)))).toBe(true)
  })

  it('maps completed courses to real universityCourseId values', () => {
    expect(
      completedCourses.every((course) => universityCourses.some((universityCourse) => universityCourse.id === course.universityCourseId)),
    ).toBe(true)
  })
})
