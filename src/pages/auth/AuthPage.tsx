import { useNavigate, useLocation } from 'react-router'
import { useAuth, type Role } from '../../features/auth/state'

const ROLES: { key: Role; label: string }[] = [
  { key: 'student', label: '学生' },
  { key: 'teacher', label: '教师' },
  { key: 'admin', label: '管理员' },
]

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

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold">选择登录身份</h1>
      <p className="mt-2 text-sm text-slate-500">
        选择身份后会回到你刚才访问的页面，继续完成学习、评课或选课相关操作。
      </p>
      <div className="mt-6 grid gap-2">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            onClick={() => {
              loginAs(r.key)
              navigate(to, { replace: true })
            }}
          >
            以{r.label}身份登录
          </button>
        ))}
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
      <div className="mt-4 text-xs text-slate-500">当前用户：{user ? user.email : '未登录'}</div>
    </div>
  )
}
