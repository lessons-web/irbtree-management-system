import { ArrowRight, Flame, Star } from 'lucide-react'
import { Link } from 'react-router'
import { reviews, universityCourses } from '../../../domain/mockData'

export default function PopularCourses() {
  const items = universityCourses.slice(0, 6).map((c) => {
    const rating = reviews.find((r) => r.universityCourseId === c.id)?.rating
    return { ...c, rating }
  })

  return (
    <section className="py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="flex items-center text-2xl font-bold text-slate-900">
          <Flame className="mr-2 h-6 w-6 text-orange-500" />
          热门课程
        </h2>
        <Link to="/review" className="flex items-center text-sm font-medium text-indigo-700 hover:text-indigo-600">
          查看全部 <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {items.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Link
              key={c.id}
              to={`/review?query=${encodeURIComponent(c.code)}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-indigo-700">{c.code}</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{c.name}</div>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-sm font-semibold text-indigo-700">
                  <Star className="h-4 w-4 fill-indigo-600 text-indigo-600" />
                  {c.rating ?? '-'}
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-500">
                查看真实评价与对应学习资源
                <span className="ml-1 font-medium text-slate-900 group-hover:underline">立即查看</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">暂无热门课程</div>
      )}
    </section>
  )
}
