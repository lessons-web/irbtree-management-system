import { useNavigate, useLocation } from 'react-router'
import { getUserPresentation, useAuth } from '../../features/auth/state'

type FromLocation = {
  pathname: string
  search: string
  hash: string
}

export default function AuthPage() {
  const { loginAs, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: FromLocation | string } | null
  const from = state?.from
  const to =
    typeof from === 'string' ? from : from ? `${from.pathname}${from.search}${from.hash}` : '/'

  const presentation = getUserPresentation(user)

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold">进入 IRBTree 演示系统</h1>
      <p className="mt-2 text-sm text-slate-500">
        使用固定原型账号即可回到你刚才访问的页面，继续完成学习、评课、选课和后台原型浏览。
      </p>
      <div className="mt-6 grid gap-2">
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          onClick={() => {
            loginAs('student')
            navigate(to, { replace: true })
          }}
        >
          进入演示系统
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800"
          onClick={() => {
            logout()
          }}
        >
          退出登录
        </button>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <div className="font-medium text-slate-900">默认账号</div>
        <div className="mt-1">{presentation.name}</div>
        <div className="mt-1 text-xs text-slate-500">{user ? user.email : 'alex.student@irbtree.com'}</div>
      </div>
    </div>
  )
}
