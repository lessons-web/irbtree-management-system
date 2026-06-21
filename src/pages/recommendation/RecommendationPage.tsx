import { ArrowRight, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useProtectedNavigation } from '../../features/auth/useProtectedNavigation'
import { courseCatalog } from '../../data/courses'
import { saveCoursePlan, useSavedCoursePlans } from '../../lib/coursePlans'
import { useReview } from '../../features/review/useReview'
import { useUserOverlay } from '../../components/user/useUserOverlay'

type RecommendEngine = 'rule' | 'ai'
type RecommendStep = 1 | 2 | 3
type RuleKey = 'high_pass' | 'useful' | 'easy' | 'high_score'

const years = ['2026', '2025', '2024']
const terms = ['T1', 'T2', 'T3'] as const

const ruleOptions: Array<{ key: RuleKey; label: string; hint: string }> = [
  { key: 'high_pass', label: '好通过考试', hint: '优先给分稳定课程' },
  { key: 'useful', label: '能学到知识', hint: '偏向高收获课程' },
  { key: 'easy', label: '水课/事少', hint: '更轻 workload' },
  { key: 'high_score', label: '高分好评', hint: '综合评分更高' },
]

type RecommendationItem = {
  universityCourseId: string
  code: string
  name: string
  reason: string
  score: number
}

export default function RecommendationPage() {
  const protectedNavigate = useProtectedNavigation()
  const [step, setStep] = useState<RecommendStep>(1)
  const [engine, setEngine] = useState<RecommendEngine>('rule')
  const [year, setYear] = useState('2026')
  const [term, setTerm] = useState<(typeof terms)[number]>('T1')
  const [prompt, setPrompt] = useState('')
  const [selectedRules, setSelectedRules] = useState<RuleKey[]>([])
  const [results, setResults] = useState<RecommendationItem[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [latestSavedPlanId, setLatestSavedPlanId] = useState<string | null>(null)
  const { completedCourses } = useUserOverlay()
  const { courses, getDetail } = useReview()
  const savedPlans = useSavedCoursePlans()

  const groupedCompleted = useMemo(() => {
    const map = new Map<string, string[]>()
    completedCourses.forEach((course) => {
      const key = `${course.year} ${course.term}`
      const group = map.get(key) ?? []
      group.push(course.code)
      map.set(key, group)
    })
    return Array.from(map.entries())
      .sort((left, right) => right[0].localeCompare(left[0]))
      .map(([semester, items]) => ({ semester, items: items.slice().sort() }))
  }, [completedCourses])

  const completedCourseIdSet = useMemo(() => new Set(completedCourses.map((course) => course.universityCourseId)), [completedCourses])

  function toggleRule(rule: RuleKey) {
    setSelectedRules((current) => (current.includes(rule) ? current.filter((item) => item !== rule) : [...current, rule]))
  }

  function buildRuleReason(courseCode: string) {
    if (selectedRules.includes('easy')) return '作业量与难度相对更友好，适合控制 workload。'
    if (selectedRules.includes('useful')) return '收获维度更高，适合补齐知识结构。'
    if (selectedRules.includes('high_pass')) return '给分和通过体验更稳，适合作为保底组合。'
    if (selectedRules.includes('high_score')) return '综合评分与口碑更高，适合作为优先候选。'
    return `${courseCode} 在现有课程评价数据中表现均衡，适合作为默认推荐。`
  }

  function generateRuleRecommendations() {
    const nextResults = courses
      .filter((course) => !completedCourseIdSet.has(course.universityCourseId))
      .map((course) => {
        const detail = getDetail(course.universityCourseId)
        let score = course.rating * 10 + course.reviewCount

        if (selectedRules.includes('high_score')) score += course.rating * 20
        if (detail) {
          if (selectedRules.includes('useful')) score += detail.ratings.harvest.val * 18
          if (selectedRules.includes('high_pass')) score += detail.ratings.grading.val * 14
          if (selectedRules.includes('easy')) score += (6 - detail.ratings.homework.val) * 10 + (6 - detail.ratings.difficulty.val) * 8
        }

        return {
          universityCourseId: course.universityCourseId,
          code: course.code,
          name: course.name,
          reason: buildRuleReason(course.code),
          score,
        }
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 4)

    setHasGenerated(true)
    setResults(nextResults)
    setLatestSavedPlanId(null)
  }

  function generateAiRecommendations() {
    const normalizedPrompt = prompt.toLowerCase()
    const preferredCodes = [
      ...(normalizedPrompt.includes('全栈') || normalizedPrompt.includes('实习') ? ['COMP9311', 'COMP1531'] : []),
      ...(normalizedPrompt.includes('ai') || normalizedPrompt.includes('算法') ? ['COMP9101', 'COMP30024'] : []),
    ]

    const nextResults = courses
      .filter((course) => !completedCourseIdSet.has(course.universityCourseId))
      .map((course) => {
        const courseMeta = courseCatalog.find((item) => item.code === course.code)
        const matchedPreference = preferredCodes.includes(course.code) ? 80 : 0
        const matchedTag = courseMeta?.tags.some((tag) => normalizedPrompt.includes(tag.toLowerCase())) ? 20 : 0
        return {
          universityCourseId: course.universityCourseId,
          code: course.code,
          name: course.name,
          reason: prompt.trim()
            ? `结合“${prompt.trim()}”的诉求，优先考虑该课程在评价、标签和方向匹配度上的综合表现。`
            : '综合课程口碑、方向匹配度与学习偏好生成推荐结果。',
          score: course.rating * 10 + matchedPreference + matchedTag,
        }
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 4)

    setHasGenerated(true)
    setResults(nextResults)
    setLatestSavedPlanId(null)
  }

  function saveCurrentPlan() {
    if (results.length === 0) return

    const plan = saveCoursePlan({
      title: `${year} ${term} 推荐计划`,
      year,
      term,
      status: 'saved',
      items: results.map((item) => ({
        universityCourseId: item.universityCourseId,
        recommendationReason: item.reason,
      })),
    })

    setLatestSavedPlanId(plan.id)
  }

  const latestSavedPlan = latestSavedPlanId ? savedPlans.find((plan) => plan.id === latestSavedPlanId) ?? null : null

  const canGoToStepThree = results.length > 0
  const resultSummary = `${year} ${term} · 已自动排除 ${completedCourses.length} 门已修课程`

  function renderResults() {
    if (results.length > 0) {
      return (
        <section aria-label="推荐课程清单" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">推荐课程清单</h3>
              <p className="mt-1 text-sm text-slate-500">{resultSummary}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{results.length} 门候选课</span>
          </div>

          <div className="mt-5 grid gap-4">
            {results.map((item) => (
              <article key={item.universityCourseId} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{item.code}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.name}</div>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    分数 {item.score.toFixed(0)}
                  </span>
                </div>
                <div className="mt-4 text-sm leading-6 text-slate-600">{item.reason}</div>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (hasGenerated) {
      return (
        <section className="mt-8 rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h3 className="text-lg font-bold text-slate-900">暂无可推荐课程</h3>
          <p className="mt-2 text-sm text-slate-500">当前课程都已在已修列表中，或已被现有条件过滤。可以先去维护已修课程，或切换推荐条件再试一次。</p>
        </section>
      )
    }

    return null
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">选课推荐</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">结合课程评价、学习计划与已修课程记录，帮助你更高效地生成下一学期的选课方案。</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
          onClick={() => protectedNavigate('/profile?tab=completed')}
        >
          去个人中心维护已修课程
          <ArrowRight size={16} />
        </button>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">已修课程概览</h2>
            <p className="mt-1 text-sm text-slate-500">当前使用 overlay 中维护的已修课程，推荐结果会自动排除这些课程。</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{completedCourses.length} 门已修课程</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {groupedCompleted.length > 0 ? (
            groupedCompleted.map((group) => (
              <article key={group.semester} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-base font-semibold text-slate-900">{group.semester}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={`${group.semester}-${item}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-500">还没有维护已修课程，先补齐历史修读记录吧。</div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="grid gap-4 md:grid-cols-5">
          <div className={`flex items-center gap-3 ${step >= 1 ? '' : 'opacity-60'}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</div>
            <div>
              <div className="font-bold text-slate-900">基础设置</div>
              <div className="text-xs text-slate-500">目标学年学期</div>
            </div>
          </div>
          <div className="hidden h-1 self-center rounded-full bg-slate-100 md:block" />
          <div className={`flex items-center gap-3 ${step >= 2 ? '' : 'opacity-60'}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
            <div>
              <div className="font-bold text-slate-900">维度选择</div>
              <div className="text-xs text-slate-500">规则式或AI推荐</div>
            </div>
          </div>
          <div className="hidden h-1 self-center rounded-full bg-slate-100 md:block" />
          <div className={`flex items-center gap-3 ${step >= 3 ? '' : 'opacity-60'}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>3</div>
            <div>
              <div className="font-bold text-slate-900">分组配置</div>
              <div className="text-xs text-slate-500">确认并保存计划</div>
            </div>
          </div>
        </div>
      </section>

      {step === 1 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5">
          <h2 className="flex items-center text-xl font-bold text-slate-900">
            <span aria-hidden="true" className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">1</span>
            选择排课学期
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              目标学年
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                {years.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              目标学期
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                value={term}
                onChange={(event) => setTerm(event.target.value as (typeof terms)[number])}
              >
                {terms.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
              onClick={() => setStep(2)}
            >
              下一步
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center text-xl font-bold text-slate-900">
              <span aria-hidden="true" className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">2</span>
              生成推荐课程
            </h2>
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => setStep(1)}
            >
              返回上一步
            </button>
          </div>

          <div className="mt-6 border-b border-slate-100">
            <div role="tablist" aria-label="推荐模式" className="flex flex-wrap gap-6">
              <button
                type="button"
                role="tab"
                aria-selected={engine === 'rule'}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition ${
                  engine === 'rule' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setEngine('rule')}
              >
                规则式选课
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={engine === 'ai'}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition ${
                  engine === 'ai' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setEngine('ai')}
              >
                AI 大模型选课
              </button>
            </div>
          </div>

          {engine === 'rule' ? (
            <div className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {ruleOptions.map((rule) => {
                  const active = selectedRules.includes(rule.key)
                  return (
                    <button
                      key={rule.key}
                      type="button"
                      className={`rounded-3xl border p-4 text-left transition ${
                        active ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200'
                      }`}
                      onClick={() => toggleRule(rule.key)}
                    >
                      <div className="font-semibold">{rule.label}</div>
                      <div className="mt-1 text-xs text-slate-500">{rule.hint}</div>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={generateRuleRecommendations}
              >
                <Sparkles size={16} />
                生成推荐清单
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700">
                AI 需求描述
                <textarea
                  className="mt-2 min-h-32 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                  placeholder="例如：我想找实习，偏全栈方向，希望 workload 不要太重。"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                onClick={generateAiRecommendations}
              >
                <Sparkles size={16} />
                AI 智能生成
              </button>
            </div>
          )}

          {renderResults()}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                canGoToStepThree ? 'bg-brand-600 text-white hover:bg-brand-500' : 'cursor-not-allowed bg-slate-100 text-slate-400'
              }`}
              disabled={!canGoToStepThree}
              onClick={() => setStep(3)}
            >
              确认选课，进入下一步
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center text-xl font-bold text-slate-900">
              <span aria-hidden="true" className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">3</span>
              选课确认与保存
            </h2>
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => setStep(2)}
            >
              返回上一步
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-brand-100 bg-brand-50/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{year} {term} 推荐计划</h3>
                <p className="mt-1 text-sm text-slate-500">{results.length} 门课待确认，保存后会同步出现在推荐页与个人中心的共享计划数据中。</p>
              </div>
              <span className="rounded-full border border-brand-100 bg-white px-3 py-1 text-xs font-semibold text-brand-600">{engine === 'rule' ? '规则式选课' : 'AI 大模型选课'}</span>
            </div>

            <div className="mt-5 grid gap-4">
              {results.map((item) => (
                <article key={item.universityCourseId} className="rounded-3xl border border-brand-100 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{item.code}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.name}</div>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      分数 {item.score.toFixed(0)}
                    </span>
                  </div>
                  <div className="mt-4 text-sm leading-6 text-slate-600">{item.reason}</div>
                </article>
              ))}
            </div>
          </div>

          {latestSavedPlan ? (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              已将“{latestSavedPlan.title}”保存到共享计划数据。
            </div>
          ) : null}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                results.length > 0 ? 'bg-brand-600 text-white hover:bg-brand-500' : 'cursor-not-allowed bg-slate-100 text-slate-400'
              }`}
              disabled={results.length === 0}
              onClick={saveCurrentPlan}
            >
              保存并生成计划
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
              <Sparkles size={14} />
              共享计划数据
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900">最近保存的选课计划</h2>
            <p className="mt-1 text-sm text-slate-500">最近保存的计划会同步展示在这里，方便对照推荐结果继续调整。</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{savedPlans.length} 份计划</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {savedPlans.map((plan) => (
            <article key={plan.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{plan.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan.year} {plan.term} · {plan.status === 'saved' ? '已保存' : '草稿'}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{plan.items.length} 门课</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.items.map((item) => (
                  <span key={item.universityCourseId} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                    {item.code}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
