import { ArrowLeft, Bookmark, Heart, MessageCircle, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import RatingDashboard from '../../components/user/RatingDashboard'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../features/auth/state'
import { useRequireAuthAction } from '../../features/auth/useRequireAuthAction'
import { useReview } from '../../features/review/useReview'
import { enrollments, findProductCourseByUniversityCourseId } from '../../domain/mockData'
import { useUserOverlay } from '../../components/user/useUserOverlay'

export default function CourseDetailPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const { courses, getDetail, toggleFavorite, toggleLike, toggleReviewLike, addReview } = useReview()
  const requireAuth = useRequireAuthAction()
  const { openReview } = useUserOverlay()

  const course = useMemo(() => {
    const key = (code ?? '').trim().toLowerCase()
    return courses.find((item) => item.code.toLowerCase() === key) ?? null
  }, [code, courses])

  const detail = course ? getDetail(course.universityCourseId) : null
  const linkedProductCourse = course ? findProductCourseByUniversityCourseId(course.universityCourseId) : null
  const hasEnrollment =
    linkedProductCourse !== null &&
    user !== null &&
    enrollments.some((item) => item.userId === user.id && item.productCourseId === linkedProductCourse.id)

  if (!course || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
          <ArrowLeft size={16} />
          返回课程列表
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">课程不存在</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            <ArrowLeft size={16} />
            返回课程列表
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
            onClick={() =>
              openReview({
                courseName: `${detail.code} ${detail.name}`,
                onSubmit: (payload) => addReview(course.universityCourseId, payload),
              })
            }
          >
            <MessageCircle size={16} />
            写评价
          </button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-4">
                <div className="text-base font-semibold text-slate-900">课程简介</div>
                <div className="text-sm leading-7 text-slate-600">{detail.desc}</div>
              </div>
              <div className="grid min-w-52 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div>
                  <div className="text-xs font-medium text-slate-500">学分</div>
                  <div className="mt-1 font-semibold">{detail.units}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Lecturer</div>
                  <div className="mt-1 font-semibold">{detail.lecturer}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Tutors</div>
                  <div className="mt-1 font-semibold">{detail.tutors.join(' / ')}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Prerequisites</div>
                  <div className="mt-1 font-semibold">{detail.prereq.join(', ') || '暂无前置'}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {detail.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {linkedProductCourse ? (
            <section className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-white p-6 shadow-sm shadow-indigo-950/5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-600">
                    <Sparkles size={14} />
                    关联学习课
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{linkedProductCourse.name}</h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600">
                    结合课程内容与学习路径推荐关联学习课，方便在查看评价后继续规划系统化学习安排。
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                    {hasEnrollment ? '已报名学习' : '可去学习页查看'}
                  </span>
                  <Link
                    to="/learn"
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {hasEnrollment ? '继续学习' : '查看学习课'}
                  </Link>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <RatingDashboard course={course} detail={detail} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-base font-semibold text-slate-900">同学评价</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={() =>
              openReview({
                courseName: `${detail.code} ${detail.name}`,
                onSubmit: (payload) => addReview(course.universityCourseId, payload),
              })
            }
          >
            <MessageCircle size={16} />
            写评价
          </button>
        </div>

        {detail.reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">暂无评价，成为第一个评价的人吧。</div>
        ) : (
          <div className="grid gap-4">
            {detail.reviews.map((review) => (
              <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">{review.user}</div>
                  <div className="text-xs text-slate-500">
                    {review.year} {review.term} · {review.date}
                  </div>
                </header>
                <div className="mt-2 text-sm text-slate-700">总评：{review.rating.toFixed(1)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{review.content}</div>
                <footer className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => requireAuth(() => toggleReviewLike(course.universityCourseId, review.id))}
                  >
                    <Heart size={14} className={review.isLiked ? 'text-rose-600' : 'text-slate-500'} />
                    {review.likes}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
