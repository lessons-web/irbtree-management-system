import { ArrowRight, Flame } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import CourseCard from '../../components/user/CourseCard'
import HeroSearch from '../../components/user/HeroSearch'
import { featuredUniversityCourseIds } from '../../data/courses'
import { useReview } from '../../features/review/useReview'

const heroStats = [
  { label: '已收录课程', value: '12,403' },
  { label: '真实评价', value: '45,291' },
  { label: '注册用户', value: '8,902' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { courses } = useReview()
  const featuredCourses = useMemo(() => {
    const courseMap = new Map(courses.map((course) => [course.universityCourseId, course]))

    return featuredUniversityCourseIds
      .map((courseId) => courseMap.get(courseId) ?? null)
      .filter((course) => course !== null)
  }, [courses])

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white pb-16 pt-12 lg:pt-20">
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="absolute top-1/2 -right-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 inline-block rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            2024 选课季必备
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            拒绝挂科，
            <span className="relative inline-block text-indigo-600">
              选课不踩雷
              <svg className="absolute -bottom-1 left-0 -z-10 h-3 w-full text-indigo-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="mx-auto my-8 max-w-2xl text-xl leading-relaxed text-slate-500">
            澳洲留学生专属的课程评价平台。
            <br className="hidden sm:block" />
            查看 <span className="font-bold text-slate-700">12,000+</span> 真实学长学姐评价，查询 GPA 杀手课与水课。
          </p>

          <HeroSearch
            onSearch={(keyword) => {
              const params = new URLSearchParams()
              if (keyword) params.set('query', keyword)
              navigate(`/courses${params.toString() ? `?${params.toString()}` : ''}`)
            }}
          />

          <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="flex cursor-default flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:scale-110 hover:border-indigo-600 hover:bg-indigo-100"
              >
                <dt className="truncate text-sm font-medium text-slate-500">{item.label}</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="flex items-center text-2xl font-bold text-slate-900">
            <Flame className="mr-2 text-orange-500" size={24} />
            热门课程
          </h2>
          <Link to="/courses" className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
            查看全部
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard key={course.universityCourseId} course={course} />
          ))}
        </div>
      </section>
    </div>
  )
}
