import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { completedCourses as initialCompletedCourses } from '../../data/profile'
import { useAuth } from '../../features/auth/state'
import CompletedCourseDrawer, { type CompletedCourseItem } from './CompletedCourseDrawer'
import ReviewDrawer from './ReviewDrawer'
import { UserOverlayContext, type ReviewOverlayRequest, type UserOverlayContextValue } from './userOverlayShared'

export function UserOverlayProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [reviewRequest, setReviewRequest] = useState<ReviewOverlayRequest | null>(null)
  const [completedOpen, setCompletedOpen] = useState(false)
  const [completedCourseItems, setCompletedCourseItems] = useState<CompletedCourseItem[]>(
    initialCompletedCourses.map((course) => ({
      universityCourseId: course.universityCourseId,
      code: course.code,
      year: course.year,
      term: course.term,
    })),
  )

  const openReview = useCallback(
    (request: ReviewOverlayRequest) => {
      setCompletedOpen(false)
      setReviewRequest(request)
      return true
    },
    [],
  )

  const openCompleted = useCallback(() => {
    setReviewRequest(null)
    setCompletedOpen(true)
    return true
  }, [])

  const value = useMemo<UserOverlayContextValue>(
    () => ({
      completedCourses: completedCourseItems,
      openReview,
      openCompleted,
      closeCompleted: () => setCompletedOpen(false),
      setCompletedCourses: setCompletedCourseItems,
    }),
    [completedCourseItems, openCompleted, openReview],
  )

  return (
    <UserOverlayContext.Provider value={value}>
      {children}
      <ReviewDrawer
        open={reviewRequest !== null}
        courseName={reviewRequest?.courseName ?? ''}
        userLabel={user?.email ?? 'Alex Student'}
        onClose={() => setReviewRequest(null)}
        onSubmit={(payload) => {
          reviewRequest?.onSubmit(payload)
          setReviewRequest(null)
        }}
      />
      <CompletedCourseDrawer
        open={completedOpen}
        value={completedCourseItems}
        onChange={setCompletedCourseItems}
        onClose={() => setCompletedOpen(false)}
      />
    </UserOverlayContext.Provider>
  )
}
