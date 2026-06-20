import SharedReviewDrawer from '../../../components/user/ReviewDrawer'
import type { ReviewDrawerSubmitPayload } from '../../../components/user/ReviewDrawer'
import type { ReviewDrawerRatings, ReviewTerm } from '../../../features/review/types'

export default function ReviewDrawer({
  open,
  courseLabel,
  userLabel,
  onClose,
  onSubmit,
}: {
  open: boolean
  courseLabel: string
  userLabel: string
  onClose: () => void
  onSubmit: (payload: { year: string; term: ReviewTerm; tags: string[]; content: string; ratings: ReviewDrawerRatings; user: string }) => void
}) {
  return (
    <SharedReviewDrawer
      open={open}
      courseName={courseLabel}
      userLabel={userLabel}
      onClose={onClose}
      onSubmit={(payload: ReviewDrawerSubmitPayload) => {
        onSubmit({
          year: payload.year,
          term: payload.term,
          tags: payload.tags,
          content: payload.content,
          ratings: payload.ratings,
          user: payload.user,
        })
      }}
    />
  )
}
