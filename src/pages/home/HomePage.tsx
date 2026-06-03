import { Link } from 'react-router'

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          拒绝挂科，选课不踩雷
        </h1>
        <p className="mt-4 max-w-2xl text-slate-500">
          首页是引流入口：同时展示评课摘要与学员学习摘要。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/review" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
            去评课
          </Link>
          <Link
            to="/recommend"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800"
          >
            去选课
          </Link>
          <Link
            to="/learn"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800"
          >
            去学习
          </Link>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">评课摘要</h2>
          <p className="mt-2 text-sm text-slate-500">热门课程 / 最新评价 / 写点评入口（Mock）。</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">学习摘要</h2>
          <p className="mt-2 text-sm text-slate-500">我的课程 / 到期提醒 / 快捷入口（Mock）。</p>
        </div>
      </section>
    </div>
  )
}

