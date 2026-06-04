const STATS = [
  { label: '已收录课程', value: '12,403' },
  { label: '真实评价', value: '45,291' },
  { label: '注册用户', value: '8,902' },
] as const

export default function Stats() {
  return (
    <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:scale-110 hover:border-indigo-600 hover:bg-indigo-100"
        >
          <dt className="truncate text-sm font-medium text-slate-500">{s.label}</dt>
          <dd className="mt-1 text-3xl font-semibold text-indigo-600">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

