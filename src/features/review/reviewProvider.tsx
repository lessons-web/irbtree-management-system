import { useMemo, useReducer, type ReactNode } from 'react'
import { createInitialReviewState } from './mockData'
import { ReviewContext, type AddReviewPayload } from './reviewContext'
import { syncReviewSummaryWithDetail } from './reviewAdapter'
import type { ReviewCourseDetail, ReviewCourseSummary, ReviewDrawerRatings, ReviewEntry } from './types'

type ReviewState = {
  courses: ReviewCourseSummary[]
  detailsByCourseId: Record<string, ReviewCourseDetail>
}

type Action =
  | { type: 'toggle_like'; universityCourseId: string }
  | { type: 'toggle_favorite'; universityCourseId: string }
  | { type: 'toggle_review_like'; universityCourseId: string; reviewId: string }
  | { type: 'add_review'; universityCourseId: string; payload: AddReviewPayload }

function computeRatingFromDrawer(ratings: ReviewDrawerRatings) {
  const vals = [ratings.difficulty, ratings.homework, ratings.grading, ratings.harvest].filter((v) => v > 0)
  if (vals.length === 0) return 0
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.round(avg * 10) / 10
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`
}

function reducer(state: ReviewState, action: Action): ReviewState {
  if (action.type === 'toggle_like') {
    const nextCourses = state.courses.map((c) => {
      if (c.universityCourseId !== action.universityCourseId) return c
      const nextLiked = !c.isLiked
      return { ...c, isLiked: nextLiked, likes: c.likes + (nextLiked ? 1 : -1) }
    })

    const detail = state.detailsByCourseId[action.universityCourseId]
    const nextDetailsByCourseId = detail
      ? {
          ...state.detailsByCourseId,
          [action.universityCourseId]: { ...detail, isLiked: !detail.isLiked },
        }
      : state.detailsByCourseId

    return { ...state, courses: nextCourses, detailsByCourseId: nextDetailsByCourseId }
  }

  if (action.type === 'toggle_favorite') {
    const nextCourses = state.courses.map((c) => {
      if (c.universityCourseId !== action.universityCourseId) return c
      const nextFavorited = !c.isFavorited
      return { ...c, isFavorited: nextFavorited, favorites: c.favorites + (nextFavorited ? 1 : -1) }
    })

    const detail = state.detailsByCourseId[action.universityCourseId]
    const nextDetailsByCourseId = detail
      ? {
          ...state.detailsByCourseId,
          [action.universityCourseId]: { ...detail, isBookmarked: !detail.isBookmarked },
        }
      : state.detailsByCourseId

    return { ...state, courses: nextCourses, detailsByCourseId: nextDetailsByCourseId }
  }

  if (action.type === 'toggle_review_like') {
    const detail = state.detailsByCourseId[action.universityCourseId]
    if (!detail) return state
    const nextReviews = detail.reviews.map((r) => {
      if (r.id !== action.reviewId) return r
      const nextLiked = !r.isLiked
      return { ...r, isLiked: nextLiked, likes: r.likes + (nextLiked ? 1 : -1) }
    })

    return {
      ...state,
      detailsByCourseId: {
        ...state.detailsByCourseId,
        [action.universityCourseId]: { ...detail, reviews: nextReviews },
      },
    }
  }

  if (action.type === 'add_review') {
    const detail = state.detailsByCourseId[action.universityCourseId]
    if (!detail) return state

    const rating = computeRatingFromDrawer(action.payload.ratings)
    const newReview: ReviewEntry = {
      id: makeId('rv'),
      user: action.payload.user,
      year: action.payload.year,
      term: action.payload.term,
      tags: action.payload.tags,
      content: action.payload.content,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      isLiked: false,
      rating,
      replies: [],
    }

    const nextDetail: ReviewCourseDetail = { ...detail, reviews: [newReview, ...detail.reviews] }

    const nextCourses = state.courses.map((c) => {
      if (c.universityCourseId !== action.universityCourseId) return c
      return syncReviewSummaryWithDetail(c, nextDetail)
    })

    return {
      ...state,
      courses: nextCourses,
      detailsByCourseId: { ...state.detailsByCourseId, [action.universityCourseId]: nextDetail },
    }
  }

  return state
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const initialState = useMemo<ReviewState>(() => {
    return createInitialReviewState()
  }, [])

  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo(() => {
    return {
      courses: state.courses,
      getDetail: (universityCourseId: string) => state.detailsByCourseId[universityCourseId] ?? null,
      toggleLike: (universityCourseId: string) => dispatch({ type: 'toggle_like', universityCourseId }),
      toggleFavorite: (universityCourseId: string) => dispatch({ type: 'toggle_favorite', universityCourseId }),
      toggleReviewLike: (universityCourseId: string, reviewId: string) =>
        dispatch({ type: 'toggle_review_like', universityCourseId, reviewId }),
      addReview: (universityCourseId: string, params: AddReviewPayload) =>
        dispatch({ type: 'add_review', universityCourseId, payload: params }),
    }
  }, [state.courses, state.detailsByCourseId])

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
}
