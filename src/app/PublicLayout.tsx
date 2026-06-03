import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../features/auth/state'

export default function PublicLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="text-lg font-bold text-slate-900">
            IRBTree
          </NavLink>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
              <NavLink to="/review" className="hover:text-slate-900">
                评课
              </NavLink>
              <NavLink to="/recommend" className="hover:text-slate-900">
                选课
              </NavLink>
              <NavLink to="/learn" className="hover:text-slate-900">
                学习
              </NavLink>
              <NavLink to="/me" className="hover:text-slate-900">
                我的
              </NavLink>
            </nav>
            {user ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                onClick={logout}
              >
                退出
              </button>
            ) : (
              <NavLink
                to="/auth"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                登录
              </NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
