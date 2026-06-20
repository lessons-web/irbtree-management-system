import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { completedCourses as initialCompletedCourses } from '../../data/profile'
import { useAuth } from '../../features/auth/state'
import CompletedCourseDrawer, { type CompletedCourseItem } from './CompletedCourseDrawer'
import LoginModal from './LoginModal'
import ReviewDrawer from './ReviewDrawer'
import { UserOverlayContext, type LoginOptions, type ReviewOverlayRequest, type UserOverlayContextValue } from './userOverlayShared'

export function UserOverlayProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
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
  const afterLoginRef = useRef<(() => void) | null>(null)

  const openLogin = useCallback(
    (options?: LoginOptions) => {
      afterLoginRef.current = options?.afterLogin ?? null
      setReviewRequest(null)
      setCompletedOpen(false)
      setLoginOpen(true)
    },
    [],
  )

  const openReview = useCallback(
    (request: ReviewOverlayRequest) => {
      const showReview = () => {
        setLoginOpen(false)
        setCompletedOpen(false)
        setReviewRequest(request)
      }

      if (!user) {
        openLogin({ afterLogin: showReview })
        return false
      }

      showReview()
      return true
    },
    [openLogin, user],
  )

  const openCompleted = useCallback(() => {
    const showCompleted = () => {
      setLoginOpen(false)
      setReviewRequest(null)
      setCompletedOpen(true)
    }

    if (!user) {
      openLogin({ afterLogin: showCompleted })
      return false
    }

    showCompleted()
    return true
  }, [openLogin, user])

  const value = useMemo<UserOverlayContextValue>(
    () => ({
      completedCourses: completedCourseItems,
      openLogin,
      openReview,
      openCompleted,
      closeCompleted: () => setCompletedOpen(false),
      setCompletedCourses: setCompletedCourseItems,
    }),
    [completedCourseItems, openCompleted, openLogin, openReview],
  )

  return (
    <UserOverlayContext.Provider value={value}>
      {children}
      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false)
          afterLoginRef.current = null
        }}
        onSuccess={() => {
          const action = afterLoginRef.current
          afterLoginRef.current = null
          action?.()
        }}
      />
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
