import { Star, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BAD_TAGS, GOOD_TAGS, TAG_POOL } from '../../../features/review/mockData'
import type { ReviewDrawerRatings, ReviewTerm } from '../../../features/review/types'

const TERMS: { value: ReviewTerm; label: string }[] = [
  { value: 'T1', label: 'T1' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'Summer', label: 'Summer' },
]

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            className="rounded-md p-1 text-slate-400 hover:text-slate-900"
            onClick={() => onChange(v)}
            aria-label={`${label} ${v} 星`}
          >
            <Star size={18} className={v <= value ? 'text-amber-500' : 'text-slate-300'} fill={v <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  )
}

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
  const years = useMemo(() => {
    const y = new Date().getFullYear()
    return Array.from({ length: 7 }, (_, i) => String(y - i))
  }, [])

  const [year, setYear] = useState(years[0] ?? String(new Date().getFullYear()))
  const [term, setTerm] = useState<ReviewTerm>('T1')
  const [ratings, setRatings] = useState<ReviewDrawerRatings>({ difficulty: 0, homework: 0, grading: 0, harvest: 0 })
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setError(null)
  }, [open])

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function submit() {
    const trimmed = content.trim()
    if (trimmed.length < 10) {
      setError('评价至少 10 个字')
      return
    }

    onSubmit({
      user: userLabel,
      year,
      term,
      tags,
      content: trimmed,
      ratings,
    })

    setContent('')
    setTags([])
    setRatings({ difficulty: 0, homework: 0, grading: 0, harvest: 0 })
    setYear(years[0] ?? year)
    setTerm('T1')
    setError(null)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" role="presentation" onClick={onClose} />
      <section
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
        aria-label="写评价"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-900">写评价</div>
            <div className="text-xs text-slate-500">{courseLabel}</div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-6 px-5 py-5">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs font-medium text-slate-500">学年</div>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-slate-500">学期</div>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as ReviewTerm)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {TERMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">打分（1-5）</div>
            <StarRow label="难度" value={ratings.difficulty} onChange={(v) => setRatings((p) => ({ ...p, difficulty: v }))} />
            <StarRow label="作业" value={ratings.homework} onChange={(v) => setRatings((p) => ({ ...p, homework: v }))} />
            <StarRow label="给分" value={ratings.grading} onChange={(v) => setRatings((p) => ({ ...p, grading: v }))} />
            <StarRow label="收获" value={ratings.harvest} onChange={(v) => setRatings((p) => ({ ...p, harvest: v }))} />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">标签</div>
            <div className="flex flex-wrap gap-2">
              {TAG_POOL.map((t) => {
                const selected = tags.includes(t)
                const kind = GOOD_TAGS.has(t) ? 'good' : BAD_TAGS.has(t) ? 'bad' : 'neutral'
                const base = 'rounded-full border px-3 py-1 text-xs font-medium'
                const theme =
                  kind === 'good'
                    ? selected
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-emerald-50/50'
                    : kind === 'bad'
                      ? selected
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-rose-50/50'
                      : selected
                        ? 'border-slate-200 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                return (
                  <button key={t} type="button" className={`${base} ${theme}`} onClick={() => toggleTag(t)}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">评价内容</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="写下你的真实体验（至少 10 个字）"
            />
            {error ? <div className="text-xs font-medium text-rose-600">{error}</div> : null}
          </div>

          <div className="flex items-center justify-end gap-2 pb-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={submit}
            >
              提交评价
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
