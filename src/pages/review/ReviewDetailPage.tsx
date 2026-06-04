import { ArrowLeft, Bookmark, Heart, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../features/auth/state'
import { useRequireAuthAction } from '../../features/auth/useRequireAuthAction'
import { useReview } from '../../features/review/ReviewContext'
import ReviewDrawer from './components/ReviewDrawer'

function RatingBar({ label, val, text }: { label: string; val: number; text: string }) {
  const pct = Math.max(0, Math.min(1, val / 5)) * 100
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>{label}</div>
        <div className="text-slate-700">
          {val.toFixed(1)} · {text}
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ReviewDetailPage() {
  const { user } = useAuth()
  const { code } = useParams()
  const { courses, getDetail, toggleFavorite, toggleLike, toggleReviewLike, addReview } = useReview()
  const requireAuth = useRequireAuthAction()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const course = useMemo(() => {
    const key = (code ?? '').trim().toLowerCase()
    return courses.find((c) => c.code.toLowerCase() === key) ?? null
  }, [code, courses])

  const detail = course ? getDetail(course.universityCourseId) : null

  if (!course || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/review" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
          <ArrowLeft size={16} />
          返回评课列表
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">课程不存在</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Link to="/review" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            <ArrowLeft size={16} />
            返回评课列表
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {detail.code} {detail.name}
            </h1>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {detail.uni}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${detail.statusColor}`}>
              {detail.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => requireAuth(() => toggleLike(course.universityCourseId))}
          >
            <Heart size={16} className={course.isLiked ? 'text-rose-600' : 'text-slate-500'} />
            点赞
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => requireAuth(() => toggleFavorite(course.universityCourseId))}
          >
            <Bookmark size={16} className={course.isFavorited ? 'text-slate-900' : 'text-slate-500'} />
            收藏
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={() => requireAuth(() => setDrawerOpen(true))}
          >
            <MessageCircle size={16} />
            写评价
          </button>
        </div>
      </div>

      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="text-base font-semibold text-slate-900">课程简介</div>
          <div className="text-sm leading-relaxed text-slate-600">{detail.desc}</div>

          <div className="flex flex-wrap gap-2">
            {detail.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-slate-500">学分</div>
              <div className="mt-1 font-semibold">{detail.units}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Lecturer</div>
              <div className="mt-1 font-semibold">{detail.lecturer}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-slate-500">Tutors</div>
              <div className="mt-1 font-semibold">{detail.tutors.join(' / ')}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-slate-500">Prerequisites</div>
              <div className="mt-1 font-semibold">{detail.prereq.join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-base font-semibold text-slate-900">综合评分</div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-slate-900">{course.rating.toFixed(1)}</div>
            <div className="text-sm text-slate-500">{course.reviewCount} 条评价</div>
          </div>
          <div className="space-y-3">
            <RatingBar label="难度" val={detail.ratings.difficulty.val} text={detail.ratings.difficulty.text} />
            <RatingBar label="作业" val={detail.ratings.homework.val} text={detail.ratings.homework.text} />
            <RatingBar label="给分" val={detail.ratings.grading.val} text={detail.ratings.grading.text} />
            <RatingBar label="收获" val={detail.ratings.harvest.val} text={detail.ratings.harvest.text} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-base font-semibold text-slate-900">同学评价</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={() => requireAuth(() => setDrawerOpen(true))}
          >
            <MessageCircle size={16} />
            写评价
          </button>
        </div>

        {detail.reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            暂无评价，成为第一个评价的人吧。
          </div>
        ) : (
          <div className="grid gap-4">
            {detail.reviews.map((r) => (
              <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">{r.user}</div>
                  <div className="text-xs text-slate-500">
                    {r.year} {r.term} · {r.date}
                  </div>
                </header>
                <div className="mt-2 text-sm text-slate-700">总评：{r.rating.toFixed(1)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{r.content}</div>
                <footer className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => requireAuth(() => toggleReviewLike(course.universityCourseId, r.id))}
                  >
                    <Heart size={14} className={r.isLiked ? 'text-rose-600' : 'text-slate-500'} />
                    {r.likes}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      <ReviewDrawer
        open={drawerOpen}
        courseLabel={`${detail.code} ${detail.name}`}
        userLabel={user?.email ?? '我'}
        onClose={() => setDrawerOpen(false)}
        onSubmit={(payload) => {
          addReview(course.universityCourseId, payload)
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}
