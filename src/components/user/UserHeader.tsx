import { NotePencil, Sparkle } from '@phosphor-icons/react'
import { NavLink } from 'react-router'
import { useAuth } from '../../features/auth/state'

type UserHeaderProps = {
  onOpenLogin: () => void
  onOpenReview?: () => void
  onOpenCompleted?: () => void
}

const navItems = [
  { to: '/', label: '首页', end: true },
  { to: '/courses', label: '课程列表' },
  { to: '/recommendation', label: '选课推荐' },
]

export default function UserHeader({ onOpenLogin, onOpenReview, onOpenCompleted }: UserHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 text-slate-900">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight">IRBTree Forum</span>
        </NavLink>

        <nav className="hidden h-16 space-x-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex h-16 items-center border-b-4 px-1 pt-1 text-sm font-medium transition ${
                  isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
                }`
              }
            >
              {item.label}
              {item.label === '选课推荐' ? (
                <span className="absolute -right-4 text-yellow-400 animate-bounce">
                  <Sparkle size={12} weight="fill" />
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                type="button"
                className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:inline-flex"
                onClick={onOpenCompleted}
              >
                已修课程
              </button>
              {onOpenReview ? (
                <button
                  type="button"
                  className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:inline-flex"
                  onClick={onOpenReview}
                >
                  <NotePencil className="mr-2" size={16} weight="fill" />
                  写评价
                </button>
              ) : (
                <NavLink
                  to="/courses"
                  className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:inline-flex"
                >
                  <NotePencil className="mr-2" size={16} weight="fill" />
                  写评价
                </NavLink>
              )}
              <NavLink to="/profile" className="hidden px-1 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 lg:inline-flex">
                我的
              </NavLink>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={logout}
              >
                退出
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="px-1 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                onClick={onOpenLogin}
              >
                登录
              </button>
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
                onClick={onOpenLogin}
              >
                注册
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
