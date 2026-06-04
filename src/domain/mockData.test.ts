import { describe, expect, it } from 'vitest'
import { findProductCourseByUniversityCourseId, findUniversityCourseByProductCourseId } from './mockData'

describe('mockData 查找函数', () => {
  it('findProductCourseByUniversityCourseId：能通过 universityCourseId 找到对应 productCourse', () => {
    const course = findProductCourseByUniversityCourseId('uc_9021')
    expect(course).not.toBeNull()
    expect(course?.id).toBe('pc_9021')
  })

  it('findProductCourseByUniversityCourseId：找不到时返回 null', () => {
    expect(findProductCourseByUniversityCourseId('uc_not_exists')).toBeNull()
  })

  it('findUniversityCourseByProductCourseId：能通过 productCourseId 找到对应 universityCourse', () => {
    const course = findUniversityCourseByProductCourseId('pc_9021')
    expect(course).not.toBeNull()
    expect(course?.id).toBe('uc_9021')
  })

  it('findUniversityCourseByProductCourseId：找不到时返回 null', () => {
    expect(findUniversityCourseByProductCourseId('pc_not_exists')).toBeNull()
  })
})
