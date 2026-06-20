import { useMemo, useState } from 'react'
import { reviewTagOptions } from '../../data/reviews'
import type { ReviewDrawerRatings, ReviewTerm } from '../../features/review/types'
import Drawer from '../common/Drawer'

export type ReviewDrawerSubmitPayload = {
  courseName: string
  year: string
  term: ReviewTerm
  tags: string[]
  content: string
  ratings: ReviewDrawerRatings
  user: string
}

type ReviewDrawerProps = {
  open: boolean
  courseName: string
  userLabel?: string
  onClose: () => void
  onSubmit: (payload: ReviewDrawerSubmitPayload) => void
}

const ratingLabels: Array<{ key: keyof ReviewDrawerRatings; label: string }> = [
  { key: 'difficulty', label: '难度' },
  { key: 'homework', label: '作业量' },
  { key: 'grading', label: '给分' },
  { key: 'harvest', label: '收获' },
]

const termOptions: ReviewTerm[] = ['T1', 'T2', 'T3']
const initialRatings: ReviewDrawerRatings = {
  difficulty: 4,
  homework: 4,
  grading: 4,
  harvest: 4,
}

export default function ReviewDrawer({ open, courseName, userLabel = 'Alex Student', onClose, onSubmit }: ReviewDrawerProps) {
  return (
    <Drawer open={open} title="写评价" onClose={onClose}>
      {open ? <ReviewDrawerForm key={courseName} courseName={courseName} userLabel={userLabel} onClose={onClose} onSubmit={onSubmit} /> : null}
    </Drawer>
  )
}

type ReviewDrawerFormProps = {
  courseName: string
  userLabel: string
  onClose: () => void
  onSubmit: (payload: ReviewDrawerSubmitPayload) => void
}

function ReviewDrawerForm({ courseName, userLabel, onClose, onSubmit }: ReviewDrawerFormProps) {
  const [year, setYear] = useState('2026')
  const [term, setTerm] = useState<ReviewTerm>('T1')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [ratings, setRatings] = useState<ReviewDrawerRatings>(initialRatings)

  const years = useMemo(() => ['2026', '2025', '2024'], [])

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-5">
        <div className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">当前课程</div>
        <div className="mt-2 text-lg font-semibold text-slate-900">{courseName}</div>
        <div className="mt-2 text-sm leading-6 text-slate-500">填写你的修读体验、作业压力和收获感受，帮助后来同学更快做出判断。</div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          学年
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          学期
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            value={term}
            onChange={(event) => setTerm(event.target.value as ReviewTerm)}
          >
            {termOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section>
        <div className="text-sm font-medium text-slate-700">评分维度</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {ratingLabels.map((item) => (
            <label key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="text-indigo-600">{ratings[item.key]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                className="mt-3 w-full accent-indigo-600"
                value={ratings[item.key]}
                onChange={(event) =>
                  setRatings((current) => ({
                    ...current,
                    [item.key]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <div className="text-sm font-medium text-slate-700">课程标签</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {reviewTagOptions.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                }`}
                onClick={() =>
                  setSelectedTags((current) =>
                    current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
                  )
                }
              >
                {tag}
              </button>
            )
          })}
        </div>
      </section>

      <label className="block text-sm font-medium text-slate-700">
        评论内容
        <textarea
          className="mt-2 min-h-36 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          placeholder="分享上课体验、作业情况和老师风格。"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          onClick={onClose}
        >
          取消
        </button>
        <button
          type="button"
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500"
          onClick={() => {
            onSubmit({
              courseName,
              year,
              term,
              tags: selectedTags,
              content,
              ratings,
              user: userLabel,
            })
          }}
        >
          提交评价
        </button>
      </div>
    </div>
  )
}
