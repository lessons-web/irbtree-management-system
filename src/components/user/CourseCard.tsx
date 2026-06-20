import { ArrowRight, Flame, Star } from 'lucide-react'
import { Link } from 'react-router'
import type { ReviewCourseSummary } from '../../features/review/types'

type CourseCardProps = {
  course: ReviewCourseSummary
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

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      to={`/course/${course.code}`}
      className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
            {course.uni}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {course.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 transition group-hover:text-indigo-600">{course.code}</h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">{course.name}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getTagClassName(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-500">
          <Flame size={15} className="text-orange-500" />
          {course.reviewCount} 条评价
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-indigo-600 transition group-hover:text-indigo-500">
          查看详情
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}
