import { Search } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import Pagination from '../../components/common/Pagination'
import CourseListItem from '../../components/user/CourseListItem'
import { getSchoolLabel } from '../../data/courses'
import { useRequireAuthAction } from '../../features/auth/useRequireAuthAction'
import { useReview } from '../../features/review/useReview'
import type { CourseSort } from '../../lib/courseFilters'
import { filterCourses, getSchoolIds, paginateItems, sortCourses } from '../../lib/courseFilters'

const DEFAULT_PAGE_SIZE = 5

const sortOptions: Array<{ value: CourseSort; label: string }> = [
  { value: 'rating_desc', label: '评分 (从高到低)' },
  { value: 'rating_asc', label: '评分 (从低到高)' },
  { value: 'reviews_desc', label: '热度 (从高到低)' },
  { value: 'reviews_asc', label: '热度 (从低到高)' },
]

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

export default function CoursesPage() {
  const { courses, getDetail, toggleFavorite, toggleLike } = useReview()
  const requireAuth = useRequireAuthAction()
  const [params, setParams] = useSearchParams()

  const query = params.get('query')?.trim() ?? ''
  const schoolId = params.get('school')?.trim() ?? 'all'
  const sortParam = params.get('sort')?.trim() ?? 'rating_desc'
  const sort = sortOptions.some((option) => option.value === sortParam) ? (sortParam as CourseSort) : 'rating_desc'
  const page = toPositiveInt(params.get('page'), 1)
  const pageSize = toPositiveInt(params.get('pageSize'), DEFAULT_PAGE_SIZE)

  const schoolOptions = useMemo(() => getSchoolIds(courses), [courses])

  const filteredCourses = useMemo(() => {
    return sortCourses(
      filterCourses(courses, {
        keyword: query,
        schoolId: schoolId === 'all' ? undefined : schoolId,
      }),
      sort,
    )
  }, [courses, query, schoolId, sort])

  const pagination = useMemo(() => paginateItems(filteredCourses, page, pageSize), [filteredCourses, page, pageSize])
  const total = pagination.total
  const currentPage = pagination.page
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = total === 0 ? 0 : Math.min(currentPage * pageSize, total)

  function updateParams(next: Record<string, string | null>, resetPage = false) {
    const current = new URLSearchParams(params)

    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === 'all') {
        current.delete(key)
        return
      }

      current.set(key, value)
    })

    if (resetPage) {
      current.set('page', '1')
    }

    setParams(current, { replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <label htmlFor="courses-search" className="mb-1 block text-xs font-medium text-slate-700">
              搜索课程
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={16} />
              </div>
              <input
                id="courses-search"
                type="text"
                value={query}
                onChange={(event) => updateParams({ query: event.target.value.trim() || null }, true)}
                placeholder="代码 / 名称"
                className="block w-full rounded-xl border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="courses-school" className="mb-1 block text-xs font-medium text-slate-700">
              学校
            </label>
            <select
              id="courses-school"
              value={schoolId}
              onChange={(event) => updateParams({ school: event.target.value }, true)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            >
              <option value="all">全部学校</option>
              {schoolOptions.map((value) => (
                <option key={value} value={value}>
                  {getSchoolLabel(value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="courses-sort" className="mb-1 block text-xs font-medium text-slate-700">
              排序方式
            </label>
            <select
              id="courses-sort"
              value={sort}
              onChange={(event) => updateParams({ sort: event.target.value }, true)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="courses-page-size" className="mb-1 block text-xs font-medium text-slate-700">
                每页条数
              </label>
              <select
                id="courses-page-size"
                value={String(pageSize)}
                onChange={(event) => updateParams({ pageSize: event.target.value }, true)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              >
                {[5, 10, 20].map((value) => (
                  <option key={value} value={String(value)}>
                    {value} 条/页
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams()
                next.set('pageSize', String(DEFAULT_PAGE_SIZE))
                setParams(next, { replace: true })
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              重置筛选
            </button>
          </div>
        </div>
      </section>

      {total === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
          没有找到匹配的课程，换个关键词试试？
        </section>
      ) : (
        <section className="space-y-4">
          {pagination.items.map((course) => (
            <CourseListItem
              key={course.universityCourseId}
              course={course}
              detail={getDetail(course.universityCourseId)}
              onLike={() => requireAuth(() => toggleLike(course.universityCourseId))}
              onFavorite={() => requireAuth(() => toggleFavorite(course.universityCourseId))}
            />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          显示第 <span className="font-medium text-slate-900">{start}</span> 到 <span className="font-medium text-slate-900">{end}</span> 条，共 <span className="font-medium text-slate-900">{total}</span> 条
        </p>
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
        />
      </section>
    </div>
  )
}
