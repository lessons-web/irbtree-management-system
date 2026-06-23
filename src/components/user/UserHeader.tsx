import { Bell, CaretDown, ShieldCheck, Sparkle, SquaresFour, UserCircle } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router'
import { getUserPresentation, useAuth } from '../../features/auth/state'

type UserHeaderProps = {
  onOpenReview?: () => void
  onOpenCompleted?: () => void
}

const navItems = [
  { to: '/', label: '首页', end: true },
  { to: '/courses', label: '课程列表' },
  { to: '/recommendation', label: '选课推荐' },
]

export default function UserHeader({ onOpenReview, onOpenCompleted }: UserHeaderProps) {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 text-slate-900">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight">IRBTree Forum</span>
        </NavLink>

        <nav className="hidden h-16 space-x-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex h-16 items-center border-b-4 px-1 pt-1 text-md transition ${
                  isActive ? 'border-brand-600 text-brand-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-800'
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
          <div ref={menuRef} className="relative flex items-center gap-4">
            <button
              type="button"
              className="hidden items-center gap-2 p-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 md:inline-flex"
              aria-label="消息中心"
            >
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-50">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              </span>
              <span>消息中心</span>
            </button>

            <div className="hidden items-end gap-3 lg:flex">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900">{presentation.name}</span>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600">
                  <ShieldCheck size={12} weight="fill" />
                  {presentation.badgeLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 bg-transparent text-left transition hover:text-slate-800"
              onClick={() => setMenuOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`${presentation.name} 用户菜单`}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 bg-white text-sm font-semibold text-brand-600">
                {presentation.avatarText}
              </span>
              <CaretDown size={14} className={`text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                aria-label="用户菜单"
                className="absolute right-0 top-[calc(100%+12px)] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-lg shadow-slate-900/10"
              >
                {presentation.canAccessAdmin ? (
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    <SquaresFour size={18} />
                    进入 Admin 系统
                  </NavLink>
                ) : null}
                <NavLink
                  to="/profile"
                  className="flex items-center gap-3 border-t border-slate-100 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle size={18} />
                  个人中心
                </NavLink>
              </div>
            ) : null}
            {onOpenReview || onOpenCompleted ? (
              <div className="sr-only" aria-hidden="true">
                {onOpenReview ? 'review-enabled' : ''}
                {onOpenCompleted ? 'completed-enabled' : ''}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
