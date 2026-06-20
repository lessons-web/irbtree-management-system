import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReviewProvider } from './reviewProvider'
import { useReview } from './useReview'

function ReviewStateProbe() {
  const { courses, getDetail, addReview } = useReview()
  const course = courses.find((item) => item.universityCourseId === 'uc_9311')
  const detail = getDetail('uc_9311')

  if (!course || !detail) {
    return <div>missing</div>
  }

  return (
    <div>
      <div data-testid="summary-rating">{course.rating.toFixed(1)}</div>
      <div data-testid="summary-count">{String(course.reviewCount)}</div>
      <div data-testid="detail-count">{String(detail.reviews.length)}</div>
      <button
        type="button"
        onClick={() =>
          addReview('uc_9311', {
            user: 'tester',
            year: '2026',
            term: 'T2',
            tags: ['项目实用'],
            content: '这是一条足够长的新评价内容，用于验证聚合逻辑。',
            ratings: { difficulty: 4, homework: 4, grading: 4, harvest: 4 },
          })
        }
      >
        add review
      </button>
    </div>
  )
}

describe('ReviewProvider', () => {
  it('keeps summary rating and count aligned with detail reviews on init', () => {
    render(
      <ReviewProvider>
        <ReviewStateProbe />
      </ReviewProvider>,
    )

    expect(screen.getByTestId('summary-rating')).toHaveTextContent('4.6')
    expect(screen.getByTestId('summary-count')).toHaveTextContent('1')
    expect(screen.getByTestId('detail-count')).toHaveTextContent('1')
  })

  it('recomputes summary aggregates from the same review source after adding a review', () => {
    render(
      <ReviewProvider>
        <ReviewStateProbe />
      </ReviewProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'add review' }))

    expect(screen.getByTestId('summary-rating')).toHaveTextContent('4.3')
    expect(screen.getByTestId('summary-count')).toHaveTextContent('2')
    expect(screen.getByTestId('detail-count')).toHaveTextContent('2')
  })
})
