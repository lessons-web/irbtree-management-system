import type { CompletedCourseItem } from './CompletedCourseDrawer'
import { createContext } from 'react'
import type { ReviewDrawerSubmitPayload } from './ReviewDrawer'

export type ReviewOverlayRequest = {
  courseName: string
  onSubmit: (payload: ReviewDrawerSubmitPayload) => void
}

export type LoginOptions = {
  afterLogin?: () => void
}

export type UserOverlayContextValue = {
  completedCourses: CompletedCourseItem[]
  openLogin: (options?: LoginOptions) => void
  openReview: (request: ReviewOverlayRequest) => boolean
  openCompleted: () => boolean
  closeCompleted: () => void
  setCompletedCourses: (value: CompletedCourseItem[]) => void
}

export const UserOverlayContext = createContext<UserOverlayContextValue | null>(null)
