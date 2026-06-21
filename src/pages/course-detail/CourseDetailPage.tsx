import { ArrowLeft, Bookmark, Heart, MessageCircle, Star } from 'lucide-react'
import { useMemo } from 'react'
import RatingDashboard from '../../components/user/RatingDashboard'
import { Link, useParams } from 'react-router'
import { useRequireAuthAction } from '../../features/auth/useRequireAuthAction'
import { useReview } from '../../features/review/useReview'
import { useUserOverlay } from '../../components/user/useUserOverlay'

export default function CourseDetailPage() {
  const { code } = useParams()
  const { courses, getDetail, toggleFavorite, toggleLike, toggleReviewLike, addReview } = useReview()
  const requireAuth = useRequireAuthAction()
  const { openReview } = useUserOverlay()

  const course = useMemo(() => {
    const key = (code ?? '').trim().toLowerCase()
    return courses.find((item) => item.code.toLowerCase() === key) ?? null
  }, [code, courses])

  const detail = course ? getDetail(course.universityCourseId) : null

  if (!course || !detail) {
    return (
      <div className="mx-auto max-w-[1120px] space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
          <ArrowLeft size={16} />
          返回课程列表
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">课程不存在</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1120px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800">
          <ArrowLeft size={16} />
          返回课程列表
        </Link>
      </div>

      <section className="relative">
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_266px]">
          <section className="h-full rounded-[22px] border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 aria-label={`${detail.code} ${detail.name}`} className="text-slate-900">
                    <span className="block text-[2rem] font-bold leading-none tracking-tight">{detail.code}</span>
                    <span className="mt-2 block text-[1.05rem] font-medium text-slate-600">{detail.name}</span>
                  </h1>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${detail.statusColor}`}>
                    {detail.status}
                  </span>
                </div>
              </div>

              <div className="rounded-[14px] bg-slate-50 px-4 py-3 text-right">
                <div className="text-[11px] font-medium text-slate-400">学分</div>
                <div className="mt-0.5 text-[1.65rem] font-bold leading-none text-slate-900">{detail.units}</div>
              </div>
            </div>

            <div className="mt-6 rounded-[12px] bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-medium">导师</span>
                <span className="text-base font-semibold text-brand-600">{detail.lecturer}</span>
                <span className="ml-2 font-medium">助教</span>
                {detail.tutors.map((tutor) => (
                  <span key={tutor} className="rounded-md bg-slate-200/80 px-2 py-1 text-[11px] font-medium text-slate-600">
                    {tutor}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="text-sm font-semibold text-slate-900">课程简介</div>
              <p className="max-w-[640px] text-sm leading-8 text-slate-600">{detail.desc}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">前置要求：</span>
              {detail.prereq.length > 0 ? (
                detail.prereq.map((item) => (
                  <span key={item} className="inline-flex items-center rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 font-semibold text-brand-500">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">暂无前置</span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">课程标签：</span>
              {detail.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 font-medium ${
                    tag.includes('作业')
                      ? 'border-rose-200 bg-rose-50 text-rose-500'
                      : tag.includes('干货')
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <div className="h-full">
            <RatingDashboard course={course} detail={detail} className="h-full" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 lg:absolute lg:-right-20 lg:top-0 lg:mt-0 lg:flex-col">
          <button
            type="button"
            aria-label="点赞课程"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-rose-300 bg-white text-rose-500 shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
            onClick={() => requireAuth(() => toggleLike(course.universityCourseId))}
          >
            <Heart size={18} className={course.isLiked ? 'fill-rose-500' : ''} />
          </button>
          <button
            type="button"
            aria-label="收藏课程"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-500 shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
            onClick={() => requireAuth(() => toggleFavorite(course.universityCourseId))}
          >
            <Bookmark size={18} className={course.isFavorited ? 'fill-amber-400' : ''} />
          </button>
          <button
            type="button"
            aria-label="跳转到评价"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
            onClick={() => {
              document.getElementById('student-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </section>

      <section id="student-reviews" className="rounded-[22px] border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2 text-[1.15rem] font-semibold text-slate-900">
            <span>学生评价</span>
            <span className="text-[1.05rem]">(Student Reviews)</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-500"
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
          <div className="mt-6 rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            暂无评价，成为第一个评价的人吧。
          </div>
        ) : (
          <div className="mt-7 space-y-8">
            {detail.reviews.map((review, index) => (
              <article key={review.id} className={`${index === 0 ? '' : 'border-t border-slate-100 pt-8'} flex gap-3.5`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
                  {review.user.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">{review.user}</div>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          {review.year} {review.term}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{review.date}</div>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-500">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {review.rating.toFixed(1)}
                    </div>
                  </header>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span key={tag} className="text-xs font-semibold text-brand-500">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{review.content}</div>

                  {review.replies.map((reply) => (
                    <div
                      key={`${review.id}-${reply.user}-${reply.date}`}
                      className="mt-4 rounded-[12px] border-l-2 border-slate-200 bg-slate-50 px-5 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-slate-600">{reply.user}</div>
                        <div className="text-xs text-slate-400">{reply.date}</div>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-500">{reply.content}</div>
                    </div>
                  ))}

                  <footer className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-500 transition hover:text-rose-600"
                      onClick={() => requireAuth(() => toggleReviewLike(course.universityCourseId, review.id))}
                    >
                      <Heart size={13} className={review.isLiked ? 'fill-rose-500 text-rose-500' : 'text-rose-500'} />
                      {review.likes}
                    </button>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle size={13} />
                      {review.replies.length} 回复
                    </span>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
