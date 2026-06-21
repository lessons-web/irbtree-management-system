import type { ReviewRatingBreakdown } from '../types/admin'

type ReviewRatingDisplayProps = {
  rating: number
  breakdown?: ReviewRatingBreakdown
  compact?: boolean
}

const dimensionConfigs: Array<{
  key: keyof ReviewRatingBreakdown
  label: string
  barClassName: string
}> = [
  { key: 'difficulty', label: '课程难度', barClassName: 'bg-rose-400' },
  { key: 'homework', label: '作业多少', barClassName: 'bg-brand-400' },
  { key: 'grading', label: '给分好坏', barClassName: 'bg-emerald-400' },
  { key: 'harvest', label: '收获大小', barClassName: 'bg-amber-400' },
]

function buildToneLabel(rating: number) {
  if (rating >= 4.5) return '口碑优秀'
  if (rating >= 3.5) return '整体稳定'
  if (rating >= 2.5) return '评价分化'
  return '风险偏高'
}

export default function ReviewRatingDisplay({ rating, breakdown, compact = false }: ReviewRatingDisplayProps) {
  const roundedRating = Math.max(0, Math.min(5, rating))
  const filledStars = Math.round(roundedRating)
  const toneLabel = buildToneLabel(roundedRating)
  const wrapperClassName = compact ? 'space-y-1' : 'space-y-2'
  const valueClassName = compact ? 'text-sm' : 'text-3xl'
  const labelClassName = compact ? 'text-xs' : 'text-sm'

  return (
    <div className={wrapperClassName} aria-label={`评分 ${roundedRating.toFixed(1)} / 5`}>
      <div className="flex items-center gap-2">
        <span className={`font-semibold text-slate-900 ${valueClassName}`}>{roundedRating.toFixed(1)}</span>
        <span className="text-sm text-amber-500">
          {Array.from({ length: 5 }, (_, index) => (index < filledStars ? '★' : '☆')).join('')}
        </span>
      </div>
      <p className={`${labelClassName} text-slate-500`}>{toneLabel}</p>

      {!compact && breakdown ? (
        <div className="mt-4 space-y-3 border-t border-amber-200 pt-4">
          {dimensionConfigs.map((item) => {
            const value = Math.max(0, Math.min(5, breakdown[item.key]))

            return (
              <div key={item.key} className="flex items-center gap-3 text-sm" aria-label={`${item.label} ${value.toFixed(1)} / 5`}>
                <span className="w-20 shrink-0 text-slate-600">{item.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/90 ring-1 ring-slate-200">
                  <div className={`h-full ${item.barClassName}`} style={{ width: `${(value / 5) * 100}%` }} />
                </div>
                <span className="w-10 text-right font-medium text-slate-700">{value.toFixed(1)}</span>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
