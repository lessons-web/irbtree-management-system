import { BookMarked, CheckCircle2, Heart, MapPin, MessageSquareReply, Sparkles, Star, UserRoundCheck } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { courseCatalog } from '../../data/courses'
import { profile } from '../../data/profile'
import { useReview } from '../../features/review/useReview'
import { useSavedCoursePlans } from '../../lib/coursePlans'
import { useUserOverlay } from '../../components/user/useUserOverlay'

type ProfileTab = 'likes' | 'favorites' | 'replies' | 'completed'

const tabs: Array<{ key: ProfileTab; label: string; icon: typeof Heart }> = [
  { key: 'likes', label: '我点赞的课程', icon: Heart },
  { key: 'favorites', label: '我收藏的课程', icon: Star },
  { key: 'replies', label: '相关的回复', icon: MessageSquareReply },
  { key: 'completed', label: '我已修的课程', icon: CheckCircle2 },
]

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-500">{text}</div>
}

export default function ProfilePage() {
  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab')
  const activeTab: ProfileTab = tabParam && tabs.some((tab) => tab.key === tabParam) ? (tabParam as ProfileTab) : 'likes'
  const { courses, getDetail } = useReview()
  const { completedCourses, openCompleted } = useUserOverlay()
  const savedPlans = useSavedCoursePlans()

  const likedCourses = useMemo(() => courses.filter((course) => course.isLiked), [courses])
  const favoriteCourses = useMemo(() => courses.filter((course) => course.isFavorited), [courses])
  const replyItems = useMemo(
    () =>
      courses.flatMap((course) => {
        const detail = getDetail(course.universityCourseId)
        if (!detail) return []
        return detail.reviews.flatMap((review) =>
          review.replies.map((reply) => ({
            id: `${review.id}-${reply.user}-${reply.date}`,
            courseCode: course.code,
            from: reply.user,
            content: reply.content,
            date: reply.date,
            reviewContent: review.content,
          })),
        )
      }),
    [courses, getDetail],
  )

  const groupedCompleted = useMemo(() => {
    const map = new Map<string, Array<(typeof completedCourses)[number]>>()
    completedCourses.forEach((course) => {
      const key = `${course.year} ${course.term}`
      const group = map.get(key) ?? []
      group.push(course)
      map.set(key, group)
    })

    return Array.from(map.entries())
      .sort((left, right) => right[0].localeCompare(left[0]))
      .map(([semester, items]) => ({
        semester,
        items: items
          .slice()
          .sort((left, right) => left.code.localeCompare(right.code))
          .map((item) => ({
            ...item,
                name: courseCatalog.find((course) => course.id === item.universityCourseId)?.name ?? '课程信息待补充',
          })),
      }))
  }, [completedCourses])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 px-8 py-10 text-white">
          <div className="absolute -top-16 right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/70 bg-white text-3xl font-bold text-indigo-600 shadow-lg">
                {profile.name.slice(0, 1)}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold">
                    <UserRoundCheck size={14} />
                    UNSW 认证学生
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1.5">
                    <BookMarked size={15} />
                    {profile.major}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} />
                    {profile.location}
                  </span>
                </div>
                <p className="max-w-2xl rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm leading-6 text-white/90">
                  “{profile.bio}”
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                <div className="text-xs uppercase tracking-wide text-white/70">目标方向</div>
                <div className="mt-2 text-lg font-semibold">{profile.targetRole}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                <div className="text-xs uppercase tracking-wide text-white/70">毕业规划</div>
                <div className="mt-2 text-lg font-semibold">{profile.graduationTerm}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              <Sparkles size={14} />
              我的选课计划
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">保存的历史计划</h2>
            <p className="mt-1 text-sm text-slate-500">汇总你保存过的选课计划，便于从推荐结果回到个人中心持续复盘和调整。</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {savedPlans.map((plan) => (
            <article key={plan.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{plan.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan.year} {plan.term} · {plan.status === 'saved' ? '已保存' : '草稿'}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {plan.items.length} 门课
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {plan.items.map((item) => (
                  <div key={item.universityCourseId} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="font-semibold text-slate-900">{item.code}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.recommendationReason}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-100 px-6 pt-2">
          <div className="flex flex-wrap gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = tab.key === activeTab
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition ${
                    active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    const next = new URLSearchParams(params)
                    next.set('tab', tab.key)
                    setParams(next, { replace: true })
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'likes' ? (
            likedCourses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {likedCourses.map((course) => (
                  <article key={course.universityCourseId} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{course.code}</div>
                        <div className="mt-1 text-sm text-slate-500">{course.name}</div>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{course.uni}</span>
                    </div>
                    <div className="mt-4 text-sm text-slate-600">{getDetail(course.universityCourseId)?.desc ?? '暂无课程简介。'}</div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="暂时还没有点赞过课程，去课程详情页给你认可的课程点个赞吧。" />
            )
          ) : null}

          {activeTab === 'favorites' ? (
            favoriteCourses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteCourses.map((course) => (
                  <article key={course.universityCourseId} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{course.code}</div>
                        <div className="mt-1 text-sm text-slate-500">{course.name}</div>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{course.favorites} 收藏</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="还没有收藏课程，可以先从课程列表挑几门感兴趣的课存起来。" />
            )
          ) : null}

          {activeTab === 'replies' ? (
            replyItems.length > 0 ? (
              <div className="space-y-4">
                {replyItems.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {item.from} 回复了你在 {item.courseCode} 的评价
                      </div>
                      <div className="text-xs text-slate-500">{item.date}</div>
                    </div>
                    <div className="mt-3 text-sm text-slate-700">{item.content}</div>
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">你的原评：</span>
                      {item.reviewContent}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="暂时没有收到新的回复，后续有新的互动会第一时间汇总到这里。" />
            )
          ) : null}

          {activeTab === 'completed' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">已修课程管理</h3>
                  <p className="mt-1 text-sm text-slate-500">按学期维护已修课程，推荐页会基于同一份 overlay 数据自动过滤。</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500"
                  onClick={() => openCompleted()}
                >
                  添加已修课程
                </button>
              </div>

              {groupedCompleted.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {groupedCompleted.map((group) => (
                    <article key={group.semester} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="text-base font-semibold text-slate-900">{group.semester}</div>
                      <div className="mt-4 grid gap-3">
                        {group.items.map((course) => (
                          <div key={`${group.semester}-${course.code}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <div className="font-semibold text-slate-900">{course.code}</div>
                            <div className="mt-1 text-sm text-slate-500">{course.name}</div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState text="还没有维护已修课程，先去补齐历史修读记录吧。" />
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
