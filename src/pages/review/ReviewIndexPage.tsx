import { Bookmark, Heart, Search } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useRequireAuthAction } from '../../features/auth/useRequireAuthAction'
import { useReview } from '../../features/review/ReviewContext'

const SORTS = [
  { value: 'rating_desc', label: '评分高→低' },
  { value: 'rating_asc', label: '评分低→高' },
  { value: 'reviews_desc', label: '评价多→少' },
] as const

type SortValue = (typeof SORTS)[number]['value']

function toInt(value: string | null, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export default function ReviewIndexPage() {
  const { courses, toggleFavorite, toggleLike } = useReview()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const requireAuth = useRequireAuthAction()

  const query = params.get('query')?.trim() ?? ''
  const school = params.get('school')?.trim() ?? ''
  const sort = (params.get('sort') as SortValue | null) ?? 'rating_desc'
  const pageSize = toInt(params.get('pageSize'), 6)
  const page = toInt(params.get('page'), 1)

  const schoolOptions = useMemo(() => {
    const set = new Set<string>()
    courses.forEach((c) => set.add(c.uni))
    return Array.from(set).sort()
  }, [courses])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const list = courses.filter((c) => {
      const okQuery = !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      const okSchool = !school || c.uni === school
      return okQuery && okSchool
    })

    const sorted = [...list]
    if (sort === 'rating_desc') sorted.sort((a, b) => b.rating - a.rating)
    if (sort === 'rating_asc') sorted.sort((a, b) => a.rating - b.rating)
    if (sort === 'reviews_desc') sorted.sort((a, b) => b.reviewCount - a.reviewCount)
    return sorted
  }, [courses, query, school, sort])

  const total = filtered.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages)
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = total === 0 ? 0 : Math.min(safePage * pageSize, total)

  const paged = useMemo(() => {
    if (total === 0) return []
    const offset = (safePage - 1) * pageSize
    return filtered.slice(offset, offset + pageSize)
  }, [filtered, pageSize, safePage, total])

  function updateParams(next: Record<string, string | null>, resetPage?: boolean) {
    const current = new URLSearchParams(params)
    Object.entries(next).forEach(([key, value]) => {
      if (!value) current.delete(key)
      else current.set(key, value)
    })
    if (resetPage) current.set('page', '1')
    setParams(current, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">评课</h1>
        <div className="text-sm text-slate-500">按课程代码/课程名搜索，支持学校筛选、排序与分页。</div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_200px_180px_160px]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            value={query}
            onChange={(e) => updateParams({ query: e.target.value.trim() || null }, true)}
            placeholder="搜索课程，例如 COMP9021"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <select
          value={school}
          onChange={(e) => updateParams({ school: e.target.value || null }, true)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">全部学校</option>
          {schoolOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value || null }, true)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={String(pageSize)}
          onChange={(e) => updateParams({ pageSize: e.target.value }, true)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {[6, 9, 12].map((n) => (
            <option key={n} value={String(n)}>
              {n} / 页
            </option>
          ))}
        </select>
      </section>

      {total === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">暂无匹配课程</div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paged.map((c) => (
            <div
              key={c.universityCourseId}
              role="button"
              tabIndex={0}
              className="group flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-900/5 hover:border-slate-300 hover:shadow-md"
              onClick={() => navigate(`/review/${c.code}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/review/${c.code}`)
                }
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {c.code}{' '}
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {c.uni}
                    </span>
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-900">{c.name}</div>
                </div>
                <div className={`h-10 w-10 rounded-2xl ${c.color} opacity-90`} />
              </div>

              <div className="flex flex-wrap gap-2">
                {c.tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="text-sm text-slate-600">
                  评分 <span className="font-semibold text-slate-900">{c.rating.toFixed(1)}</span> · {c.reviewCount} 条评价
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      requireAuth(() => toggleLike(c.universityCourseId))
                    }}
                    aria-label="点赞课程"
                  >
                    <Heart size={14} className={c.isLiked ? 'text-rose-600' : 'text-slate-500'} />
                    {c.likes}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      requireAuth(() => toggleFavorite(c.universityCourseId))
                    }}
                    aria-label="收藏课程"
                  >
                    <Bookmark size={14} className={c.isFavorited ? 'text-slate-900' : 'text-slate-500'} />
                    {c.favorites}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <div>
          显示 {start}-{end} / {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
            disabled={safePage <= 1 || totalPages === 0}
            onClick={() => updateParams({ page: String(Math.max(safePage - 1, 1)) })}
          >
            上一页
          </button>
          <div className="px-2">
            {totalPages === 0 ? '0' : safePage} / {totalPages}
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
            disabled={totalPages === 0 || safePage >= totalPages}
            onClick={() => updateParams({ page: String(Math.min(safePage + 1, totalPages)) })}
          >
            下一页
          </button>
        </div>
      </section>
    </div>
  )
}
