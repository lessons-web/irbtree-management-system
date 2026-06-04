import type { Id } from '../../domain/types'

export type ReviewTerm = 'T1' | 'T2' | 'T3' | 'S1' | 'S2' | 'Summer'

export type ReviewReply = {
  user: string
  content: string
  date: string
}

export type ReviewEntry = {
  id: Id
  user: string
  term: ReviewTerm
  year: string
  tags: string[]
  content: string
  date: string
  likes: number
  isLiked: boolean
  rating: number
  replies: ReviewReply[]
}

export type ReviewDetailRatingItem = {
  val: number
  text: string
}

export type ReviewDetailRatings = {
  difficulty: ReviewDetailRatingItem
  homework: ReviewDetailRatingItem
  grading: ReviewDetailRatingItem
  harvest: ReviewDetailRatingItem
}

export type ReviewCourseSummary = {
  universityCourseId: Id
  code: string
  name: string
  uni: string
  rating: number
  reviewCount: number
  tags: string[]
  color: string
  likes: number
  favorites: number
  isLiked: boolean
  isFavorited: boolean
}

export type ReviewCourseDetail = {
  universityCourseId: Id
  code: string
  name: string
  uni: string
  status: string
  statusColor: string
  units: string
  desc: string
  lecturer: string
  tutors: string[]
  prereq: string[]
  tags: string[]
  isLiked: boolean
  isBookmarked: boolean
  ratings: ReviewDetailRatings
  reviews: ReviewEntry[]
}

export type ReviewDrawerRatings = {
  difficulty: number
  homework: number
  grading: number
  harvest: number
}

