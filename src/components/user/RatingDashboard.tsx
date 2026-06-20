import { Star } from 'lucide-react'
import type { ReviewCourseDetail, ReviewCourseSummary } from '../../features/review/types'

function RatingBar({
  label,
  val,
  text,
  colorClass,
}: {
  label: string
  val: number
  text: string
  colorClass: string
}) {
  const pct = Math.max(0, Math.min(1, val / 5)) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-[11px] leading-5">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="text-slate-400">{text}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/80">
        <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

type RatingDashboardProps = {
  course: ReviewCourseSummary
  detail: ReviewCourseDetail
  className?: string
}

export default function RatingDashboard({ course, detail, className = '' }: RatingDashboardProps) {
  const ratingBars = [
    { label: '课程难度 (Difficulty)', item: detail.ratings.difficulty, colorClass: 'bg-rose-500' },
    { label: '作业多少 (Homework)', item: detail.ratings.homework, colorClass: 'bg-indigo-500' },
    { label: '给分好坏 (Grading)', item: detail.ratings.grading, colorClass: 'bg-emerald-500' },
    { label: '收获大小 (Harvest)', item: detail.ratings.harvest, colorClass: 'bg-amber-500' },
  ] as const

  return (
    <section
      className={`flex h-full flex-col rounded-[24px] border border-slate-200 bg-[#f3f6ff] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] ${className}`.trim()}
    >
      <div className="text-sm font-semibold text-slate-700">综合评分</div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="flex items-end gap-2">
          <Star size={18} className="mb-1 fill-amber-400 text-amber-400" />
          <div className="text-4xl font-bold tracking-tight text-slate-900">{course.rating.toFixed(1)}</div>
        </div>
        <div className="text-xs text-slate-500">{course.reviewCount} 条评价</div>
      </div>
      <div className="mt-5 space-y-3.5">
        {ratingBars.map(({ label, item, colorClass }) => (
          <RatingBar key={label} label={label} val={item.val} text={item.text} colorClass={colorClass} />
        ))}
      </div>
    </section>
  )
}
