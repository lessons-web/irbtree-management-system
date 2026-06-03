import { Link } from 'react-router'
import { findProductCourseByUniversityCourseId, reviews, universityCourses } from '../../domain/mockData'

export default function ReviewIndexPage() {
  const course = universityCourses[0]
  if (!course) {
    return <div className="text-slate-700">评课模块（空态）：暂无课程数据</div>
  }

  const rating = reviews.find((r) => r.universityCourseId === course.id)?.rating
  const productCourse = findProductCourseByUniversityCourseId(course.id)

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold">
        {course.code} {course.name}
      </div>
      <div className="text-sm text-slate-500">评分（Mock）：{rating ?? '-'}</div>
      {productCourse ? (
        <Link to="/learn" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          去学习：{productCourse.name}
        </Link>
      ) : (
        <div className="text-sm text-slate-500">暂无对应学习课程</div>
      )}
    </div>
  )
}
