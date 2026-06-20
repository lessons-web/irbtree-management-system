import type { ReviewCourseDetail, ReviewCourseSummary } from '../../features/review/types'

function RatingBar({ label, val, text }: { label: string; val: number; text: string }) {
  const pct = Math.max(0, Math.min(1, val / 5)) * 100
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="text-slate-700">
          {val.toFixed(1)} · {text}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
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
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 ${className}`.trim()}>
      <div className="text-base font-semibold text-slate-900">综合评分</div>
      <div className="mt-4 flex items-end gap-3">
        <div className="text-4xl font-bold text-slate-900">{course.rating.toFixed(1)}</div>
        <div className="text-sm text-slate-500">{course.reviewCount} 条评价</div>
      </div>
      <div className="mt-5 space-y-3">
        <RatingBar label="难度" val={detail.ratings.difficulty.val} text={detail.ratings.difficulty.text} />
        <RatingBar label="作业" val={detail.ratings.homework.val} text={detail.ratings.homework.text} />
        <RatingBar label="给分" val={detail.ratings.grading.val} text={detail.ratings.grading.text} />
        <RatingBar label="收获" val={detail.ratings.harvest.val} text={detail.ratings.harvest.text} />
      </div>
    </section>
  )
}
