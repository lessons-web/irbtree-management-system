import { BookOpenText, ClipboardCheck, GraduationCap } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../../features/auth/state'
import { enrollments, productCourses } from '../../../domain/mockData'

export default function LearningSummary() {
  const { user } = useAuth()

  if (!user) {
    return (
      <section className="pb-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">学习摘要</h2>
              <p className="mt-2 text-sm text-slate-500">登录后查看我的课程、到期提醒与快捷入口。</p>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              去登录
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const myCourses = enrollments
    .filter((e) => e.userId === user.id)
    .map((e) => {
      const course = productCourses.find((c) => c.id === e.productCourseId)
      if (!course) return null
      return { enrollment: e, course }
    })
    .filter((x) => x !== null)
    .slice(0, 2)

  return (
    <section className="pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">学习摘要</h2>
          <p className="mt-2 text-sm text-slate-500">继续你的课件、刷题与模考进度。</p>
        </div>
        <Link to="/learn" className="text-sm font-medium text-indigo-700 hover:text-indigo-600">
          进入学习
        </Link>
      </div>

      {myCourses.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {myCourses.map(({ course, enrollment }) => (
            <div key={enrollment.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    学习中
                  </div>
                  <div className="mt-3 text-lg font-bold text-slate-900">{course.name}</div>
                </div>
                <div className="text-xs text-slate-400">有效期至：{enrollment.expiresAt.split('T')[0]}</div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Link
                  to="/learn"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <BookOpenText className="h-4 w-4" />
                  课件
                </Link>
                <Link
                  to="/learn"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  刷题
                </Link>
                <Link
                  to="/learn"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
                >
                  <GraduationCap className="h-4 w-4" />
                  模考
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">暂无已开通课程</div>
      )}
    </section>
  )
}
