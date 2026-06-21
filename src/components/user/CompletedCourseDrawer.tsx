import { MagnifyingGlass } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { courseCatalog } from '../../data/courses'
import type { ReviewTerm } from '../../features/review/types'
import Drawer from '../common/Drawer'

export type CompletedCourseItem = {
  universityCourseId: string
  code: string
  year: string
  term: ReviewTerm
}

type CompletedCourseDrawerProps = {
  open: boolean
  value: CompletedCourseItem[]
  onChange: (value: CompletedCourseItem[]) => void
  onClose: () => void
}

const years = ['2026', '2025', '2024']
const terms: ReviewTerm[] = ['T1', 'T2', 'T3', 'S1', 'S2', 'Summer']

export default function CompletedCourseDrawer({ open, value, onChange, onClose }: CompletedCourseDrawerProps) {
  const [year, setYear] = useState('2026')
  const [term, setTerm] = useState<ReviewTerm>('T1')
  const [keyword, setKeyword] = useState('')

  const candidates = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) return []

    return courseCatalog
      .filter((course) => {
        const target = `${course.code} ${course.name}`.toLowerCase()
        return target.includes(normalizedKeyword)
      })
      .slice(0, 6)
  }, [keyword])

  const currentTermCourses = value.filter((course) => course.year === year && course.term === term)

  return (
    <Drawer open={open} title="我已修的课程" onClose={onClose}>
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            学年
            <select
              className="mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
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
              className="mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              value={term}
              onChange={(event) => setTerm(event.target.value as ReviewTerm)}
            >
              {terms.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          搜索课程
          <div className="relative mt-2">
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              placeholder="输入课程代码或名称搜索..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        </label>

        {candidates.length > 0 ? (
          <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-3">
            {candidates.map((course) => (
              <button
                key={course.id}
                type="button"
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
                aria-label={`添加 ${course.code} ${course.name}`}
                onClick={() => {
                  const exists = value.some((item) => item.universityCourseId === course.id && item.year === year && item.term === term)
                  if (!exists) {
                    onChange([...value, { universityCourseId: course.id, code: course.code, year, term }])
                  }
                  setKeyword('')
                }}
              >
                <div>
                  <div className="font-semibold text-slate-900">{course.code}</div>
                  <div className="text-sm text-slate-500">{course.name}</div>
                </div>
                <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  添加
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-medium text-slate-700">当前学期已修课程</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {currentTermCourses.length > 0 ? (
              currentTermCourses.map((course) => (
                <span
                  key={`${course.universityCourseId}-${course.year}-${course.term}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {course.code}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">当前学期还没有添加课程。</span>
            )}
          </div>
        </section>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-500"
            onClick={onClose}
          >
            完成
          </button>
        </div>
      </div>
    </Drawer>
  )
}
