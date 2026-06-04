import type { ReactNode } from 'react'

export default function Hero({ children }: { children?: ReactNode }) {
  return (
    <section className="relative -mx-6 -mt-10 overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-white pb-16 pt-12 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute top-1/2 -right-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <span className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700">
          2024 选课季必备
        </span>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          拒绝挂科，
          <span className="relative inline-block text-indigo-700">
            选课不踩雷
            <svg
              className="absolute -bottom-1 left-0 -z-10 h-3 w-full text-indigo-200"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>
        <p className="mx-auto my-8 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl">
          澳洲留学生专属的课程评价平台。
          <br className="hidden sm:block" />
          查看 <span className="font-bold text-slate-700">12,000+</span> 真实学长学姐评价，查询 GPA 杀手课与水课。
        </p>

        {children}
      </div>
    </section>
  )
}

