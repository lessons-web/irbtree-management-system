import { createContext } from 'react'
import type { ReviewCourseDetail, ReviewCourseSummary, ReviewDrawerRatings, ReviewTerm } from './types'

export type AddReviewPayload = {
  user: string
  year: string
  term: ReviewTerm
  tags: string[]
  content: string
  ratings: ReviewDrawerRatings
}

export type ReviewContextValue = {
  courses: ReviewCourseSummary[]
  getDetail: (universityCourseId: string) => ReviewCourseDetail | null
  toggleLike: (universityCourseId: string) => void
  toggleFavorite: (universityCourseId: string) => void
  toggleReviewLike: (universityCourseId: string, reviewId: string) => void
  addReview: (universityCourseId: string, params: AddReviewPayload) => void
}

export const ReviewContext = createContext<ReviewContextValue | null>(null)
