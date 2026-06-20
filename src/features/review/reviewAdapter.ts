import {
  courseCatalog,
  courseCatalogById,
  formatCourseCredits,
  getSchoolLabel,
} from '../../data/courses'
import {
  getCourseReviewsByUniversityCourseId,
  reviewTagOptions,
} from '../../data/reviews'
import type { ReviewCourseDetail, ReviewCourseSummary, ReviewDetailRatingItem, ReviewEntry } from './types'

const COURSE_COLOR_BY_ID: Record<string, string> = {
  uc_9021: 'bg-emerald-600',
  uc_9311: 'bg-sky-600',
  uc_9101: 'bg-rose-600',
  uc_1531: 'bg-amber-600',
  uc_2017: 'bg-violet-600',
  uc_2823: 'bg-teal-600',
  uc_30023: 'bg-fuchsia-600',
  uc_30024: 'bg-cyan-600',
}

const COURSE_SOCIAL_BY_ID: Record<string, { likes: number; favorites: number }> = {
  uc_9021: { likes: 321, favorites: 189 },
  uc_9311: { likes: 210, favorites: 140 },
  uc_9101: { likes: 166, favorites: 98 },
  uc_1531: { likes: 90, favorites: 70 },
  uc_2017: { likes: 105, favorites: 82 },
  uc_2823: { likes: 60, favorites: 41 },
  uc_30023: { likes: 150, favorites: 112 },
  uc_30024: { likes: 140, favorites: 95 },
}

const COURSE_STATUS_BY_ID: Record<string, { status: string; statusColor: string }> = {
  uc_9021: { status: '在开', statusColor: 'bg-emerald-100 text-emerald-700' },
  uc_9311: { status: '热门', statusColor: 'bg-sky-100 text-sky-700' },
  uc_9101: { status: '硬核', statusColor: 'bg-rose-100 text-rose-700' },
  uc_1531: { status: '友好', statusColor: 'bg-amber-100 text-amber-800' },
}

export const TAG_POOL = reviewTagOptions
export const GOOD_TAGS = new Set(['较友好', '干货满满', '项目实用', '就业向'])
export const BAD_TAGS = new Set(['避雷', '作业多', '考试难'])

type ReviewStateSeed = {
  courses: ReviewCourseSummary[]
  detailsByCourseId: Record<string, ReviewCourseDetail>
}

function aggregateReviews(reviews: ReviewEntry[]) {
  if (reviews.length === 0) {
    return { rating: 0, reviewCount: 0 }
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  return {
    rating: Math.round((totalRating / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  }
}

function createRatingText(kind: 'difficulty' | 'homework' | 'grading' | 'harvest', value: number): string {
  if (kind === 'difficulty') {
    if (value >= 4.2) return '偏难'
    if (value >= 3.2) return '中等'
    return '较友好'
  }

  if (kind === 'homework') {
    if (value >= 4.2) return '作业很多'
    if (value >= 3.2) return '作业适中'
    return '作业较少'
  }

  if (kind === 'grading') {
    if (value >= 4.2) return '给分友好'
    if (value >= 3.2) return '给分正常'
    return '给分偏严'
  }

  if (value >= 4.2) return '收获很大'
  if (value >= 3.2) return '收获不错'
  return '收获一般'
}

function createRatingItem(kind: 'difficulty' | 'homework' | 'grading' | 'harvest', value: number): ReviewDetailRatingItem {
  return {
    val: value,
    text: createRatingText(kind, value),
  }
}

function buildReviewCourseDetail(universityCourseId: string): ReviewCourseDetail {
  const course = courseCatalogById[universityCourseId]
  if (!course) {
    throw new Error(`Unknown course: ${universityCourseId}`)
  }

  const statusMeta = COURSE_STATUS_BY_ID[universityCourseId] ?? {
    status: '在开',
    statusColor: 'bg-emerald-100 text-emerald-700',
  }

  return {
    universityCourseId: course.id,
    code: course.code,
    name: course.name,
    uni: getSchoolLabel(course.schoolId),
    status: statusMeta.status,
    statusColor: statusMeta.statusColor,
    units: formatCourseCredits(course),
    desc: course.description,
    lecturer: course.lecturer,
    tutors: course.tutors,
    prereq: course.prerequisiteCodes,
    tags: course.tags,
    isLiked: false,
    isBookmarked: false,
    ratings: {
      difficulty: createRatingItem('difficulty', course.ratingBreakdown.difficulty),
      homework: createRatingItem('homework', course.ratingBreakdown.homework),
      grading: createRatingItem('grading', course.ratingBreakdown.grading),
      harvest: createRatingItem('harvest', course.ratingBreakdown.harvest),
    },
    reviews: getCourseReviewsByUniversityCourseId(universityCourseId),
  }
}

function buildReviewCourseSummary(detail: ReviewCourseDetail): ReviewCourseSummary {
  const course = courseCatalogById[detail.universityCourseId]
  if (!course) {
    throw new Error(`Unknown course: ${detail.universityCourseId}`)
  }

  const aggregate = aggregateReviews(detail.reviews)
  const socialMeta = COURSE_SOCIAL_BY_ID[detail.universityCourseId] ?? { likes: 0, favorites: 0 }

  return {
    universityCourseId: course.id,
    schoolId: course.schoolId,
    code: course.code,
    name: course.name,
    uni: getSchoolLabel(course.schoolId),
    rating: aggregate.rating,
    reviewCount: aggregate.reviewCount,
    tags: course.tags,
    color: COURSE_COLOR_BY_ID[detail.universityCourseId] ?? 'bg-indigo-600',
    likes: socialMeta.likes,
    favorites: socialMeta.favorites,
    isLiked: false,
    isFavorited: false,
  }
}

export function createInitialReviewState(): ReviewStateSeed {
  const details = courseCatalog.map((course) => buildReviewCourseDetail(course.id))
  return {
    courses: details.map(buildReviewCourseSummary),
    detailsByCourseId: Object.fromEntries(details.map((detail) => [detail.universityCourseId, detail])),
  }
}

export function syncReviewSummaryWithDetail(summary: ReviewCourseSummary, detail: ReviewCourseDetail): ReviewCourseSummary {
  const aggregate = aggregateReviews(detail.reviews)

  return {
    ...summary,
    rating: aggregate.rating,
    reviewCount: aggregate.reviewCount,
    tags: detail.tags,
  }
}
