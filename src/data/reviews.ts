import type { ReviewEntry, ReviewReply, ReviewTerm } from '../features/review/types'

export type CourseReviewRecord = {
  id: string
  universityCourseId: string
  user: string
  year: string
  term: ReviewTerm
  date: string
  rating: number
  tags: string[]
  content: string
  likes: number
  replies?: ReviewReply[]
}

export const reviewTagOptions = ['较友好', '避雷', '作业多', '考试难', '干货满满', '项目实用', '就业向']

function createCourseReviewRecord(record: CourseReviewRecord) {
  return record
}

export function toReviewEntry(record: CourseReviewRecord): ReviewEntry {
  return {
    ...record,
    isLiked: false,
    replies: record.replies ?? [],
  }
}

export const courseReviewRecords: CourseReviewRecord[] = [
  createCourseReviewRecord({
    id: 'review-uc-9021-1',
    universityCourseId: 'uc_9021',
    user: 'Alex',
    year: '2024',
    term: 'T3',
    date: '2024-12-10',
    rating: 5,
    tags: ['干货满满', '作业多'],
    content: '课程内容非常扎实，Eric 老师讲得很好，但是作业量真的很大，建议提前预习。',
    likes: 12,
    replies: [
      {
        user: 'Eric',
        date: '2024-12-11',
        content: '感谢你的认可，作业确实有点多，加油！',
      },
    ],
  }),
  createCourseReviewRecord({
    id: 'review-uc-9021-2',
    universityCourseId: 'uc_9021',
    user: 'Sarah',
    year: '2024',
    term: 'T1',
    date: '2024-05-20',
    rating: 4.6,
    tags: ['水课', '给分好'],
    content: '对于没有编程基础的人来说有点难，需要花大量时间练习，不过整体收获很大。',
    likes: 8,
  }),
  createCourseReviewRecord({
    id: 'review-uc-9311-1',
    universityCourseId: 'uc_9311',
    user: 'Ryan',
    year: '2025',
    term: 'T3',
    date: '2025-11-03',
    rating: 4.6,
    tags: ['项目实用', '就业向'],
    content: 'SQL 和数据库设计非常实用，项目部分也比较贴近真实开发场景。',
    likes: 24,
  }),
  createCourseReviewRecord({
    id: 'review-uc-9101-1',
    universityCourseId: 'uc_9101',
    user: 'Sophia',
    year: '2026',
    term: 'T1',
    date: '2026-03-29',
    rating: 4.7,
    tags: ['考试难', '干货满满'],
    content: '课程难度高，但内容很硬核，适合想认真做算法与机器学习基础的同学。',
    likes: 41,
  }),
  createCourseReviewRecord({
    id: 'review-uc-1531-1',
    universityCourseId: 'uc_1531',
    user: 'Leo',
    year: '2025',
    term: 'T1',
    date: '2025-04-11',
    rating: 4.1,
    tags: ['较友好'],
    content: '课堂参与感强，项目协作多，对转工程化思维很有帮助。',
    likes: 15,
  }),
]

export function getCourseReviewRecordsByUniversityCourseId(universityCourseId: string) {
  return courseReviewRecords.filter((review) => review.universityCourseId === universityCourseId)
}

export function getCourseReviewsByUniversityCourseId(universityCourseId: string) {
  return getCourseReviewRecordsByUniversityCourseId(universityCourseId).map(toReviewEntry)
}
