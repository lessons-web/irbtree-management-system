import { Bookmark, MessageCircle, Star, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router'
import type { ReviewCourseDetail, ReviewCourseSummary } from '../../features/review/types'

type CourseListItemProps = {
  course: ReviewCourseSummary
  detail: ReviewCourseDetail | null
  onLike: () => void
  onFavorite: () => void
}

function getTagClassName(tag: string) {
  if (/避雷|考试难|作业多/.test(tag)) {
    return 'border-rose-100 bg-rose-50 text-rose-600'
  }

  if (/较友好|干货满满|项目实用|就业向/.test(tag)) {
    return 'border-emerald-100 bg-emerald-50 text-emerald-700'
  }

  return 'border-amber-100 bg-amber-50 text-amber-700'
}

export default function CourseListItem({ course, detail, onLike, onFavorite }: CourseListItemProps) {
  const description = detail?.desc ?? '暂无课程简介。'
  const preview = description.length > 80 ? `${description.slice(0, 80)}...` : description
  const ratingItems = [
    ['课程难度', detail?.ratings.difficulty.text ?? 'N/A', detail?.ratings.difficulty.val ?? 0],
    ['作业多少', detail?.ratings.homework.text ?? 'N/A', detail?.ratings.homework.val ?? 0],
    ['给分好坏', detail?.ratings.grading.text ?? 'N/A', detail?.ratings.grading.val ?? 0],
    ['收获大小', detail?.ratings.harvest.text ?? 'N/A', detail?.ratings.harvest.val ?? 0],
  ] as const

  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:shadow-lg lg:flex-row">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/course/${course.code}`} className="text-xl font-bold text-slate-900 transition hover:text-indigo-600">
                {course.code}
              </Link>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {course.uni}
              </span>
            </div>
            <h3 className="text-base font-medium text-slate-600">{course.name}</h3>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${detail?.statusColor ?? 'bg-slate-100 text-slate-600'}`}>
            {detail?.status ?? '在开'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getTagClassName(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-500">“{preview}”</p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 transition hover:border-indigo-200 hover:text-indigo-600 ${course.isLiked ? 'border-indigo-100 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white'}`}
            onClick={onLike}
            aria-label={`推荐 ${course.code}`}
          >
            <ThumbsUp size={15} className={course.isLiked ? 'fill-current' : ''} />
            {course.likes} 推荐
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 transition hover:border-amber-200 hover:text-amber-500 ${course.isFavorited ? 'border-amber-100 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white'}`}
            onClick={onFavorite}
            aria-label={`收藏 ${course.code}`}
          >
            <Bookmark size={15} className={course.isFavorited ? 'fill-current' : ''} />
            {course.favorites} 收藏
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <MessageCircle size={15} />
            {course.reviewCount} 条评论
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col justify-between border-t border-slate-100 pt-6 lg:w-80 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <div>
          <div className="mb-4 flex items-center justify-end gap-2">
            <Star size={18} className="fill-amber-400 text-amber-400" />
            <span className="text-2xl font-bold text-slate-900">{course.rating.toFixed(1)}</span>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-500">
            {ratingItems.map(([label, text, value]) => (
              <div key={label} className="space-y-1 rounded-2xl bg-slate-50 px-3 py-2">
                <dt>{label}</dt>
                <dd className="font-medium text-slate-900">
                  {text} ({value.toFixed(1)})
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span>前置要求</span>
          <span className="font-medium text-slate-900">{detail?.prereq[0] ?? '暂无前置'}</span>
        </div>
      </div>
    </article>
  )
}
