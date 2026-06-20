import { Link } from 'react-router'
import { findUniversityCourseByProductCourseId, productCourses, reviews } from '../../domain/mockData'

export default function LearnIndexPage() {
  const product = productCourses[0]
  if (!product) {
    return <div className="text-slate-700">学习模块（空态）：暂无学习课程</div>
  }

  const uni = findUniversityCourseByProductCourseId(product.id)
  const rating = uni ? reviews.find((r) => r.universityCourseId === uni.id)?.rating : null

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold">{product.name}</div>
      {uni ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-800">对应评课课程：{uni.code}</div>
          <div className="mt-1 text-sm text-slate-500">当前评分参考：{rating ?? '-'}</div>
          <Link to="/courses" className="mt-3 inline-flex text-sm font-medium text-slate-900 underline">
            查看评课详情
          </Link>
        </div>
      ) : (
        <div className="text-sm text-slate-500">暂无对应评课课程</div>
      )}
    </div>
  )
}
