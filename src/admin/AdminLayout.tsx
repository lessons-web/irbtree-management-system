import {
  Bell,
  BookOpen,
  CaretDown,
  CaretLeft,
  ChatText,
  Desktop,
  Users,
  Gear,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import Drawer from '../components/common/Drawer'
import { AdminRuntimeProvider, useAdminRuntime } from './context/AdminRuntimeContext'
import { adminNavGroups, getAdminPageTitle } from './config/navigation'
import { getUserPresentation, useAuth } from '../features/auth/state'

const navIconsByGroup: Record<(typeof adminNavGroups)[number]['key'], typeof BookOpen> = {
  'course-center': BookOpen,
  'review-management': ChatText,
  'student-management': Users,
  'problem-bank': Bell,
  'system-management': Gear,
} as const

function matchesAdminRoute(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function AdminLayout() {
  return (
    <AdminRuntimeProvider>
      <AdminLayoutContent />
    </AdminRuntimeProvider>
  )
}

function AdminLayoutContent() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { notifications } = useAdminRuntime()
  const presentation = getUserPresentation(user)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
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
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  const pageTitle = useMemo(() => getAdminPageTitle(pathname), [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      <aside
        className={`hidden shrink-0 border-r border-slate-200 bg-white transition-all duration-300 lg:flex lg:flex-col ${
          sidebarCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-9 w-9 bg-white p-1 ring-1 ring-slate-200" />
          {!sidebarCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">IRBTree Admin</p>
              <p className="text-xs text-slate-500">课程管理与治理后台</p>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm font-medium text-slate-600">
          {adminNavGroups.map((group) => {
            const groupTarget = group.items[0]?.to ?? group.basePath
            const groupActive = matchesAdminRoute(pathname, group.basePath)

            return (
              <section key={group.key} aria-label={group.label} className="space-y-1">
                <SidebarLink
                  to={groupTarget}
                  label={group.label}
                  collapsed={sidebarCollapsed}
                  active={groupActive}
                  icon={navIconsByGroup[group.key]}
                />
                {!sidebarCollapsed && group.items.length > 0 ? (
                  <div className="space-y-1 border-l border-slate-200 pl-4">
                    {group.items.map((item) => (
                      <SidebarLink
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        collapsed={false}
                        inset
                        variant="subtle"
                        active={matchesAdminRoute(pathname, item.to)}
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            )
          })}
        </nav>

        <div className="flex items-center justify-between border-t border-slate-200/70 px-4 py-4">
          {!sidebarCollapsed ? (
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-500">v1.0.2</p>
              <p className="font-mono text-[10px] text-slate-400">b7a9f2</p>
            </div>
          ) : <div />}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="rounded-xl border border-transparent bg-white/80 p-2 text-slate-400 transition hover:border-slate-200 hover:text-slate-700"
            aria-label={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'}
          >
            <CaretLeft size={18} className={sidebarCollapsed ? 'rotate-180' : ''} />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setNotificationOpen(true)}
              className="relative rounded-xl border border-transparent bg-white/80 p-2 text-slate-400 transition hover:border-slate-200 hover:bg-white hover:text-slate-700"
              aria-label="通知"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-50/90" />
            </button>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-transparent bg-white/80 px-2 py-1 transition hover:border-slate-200 hover:bg-white"
                aria-label="管理员菜单"
                aria-expanded={menuOpen}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {presentation.avatarText}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">{presentation.name}</p>
                  <p className="text-xs text-slate-500">管理员账户</p>
                </div>
                <CaretDown size={14} className={`text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 z-20 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10">
                  <NavLink
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Desktop size={18} />
                    切换到用户端
                  </NavLink>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <Drawer open={notificationOpen} title="消息通知" onClose={() => setNotificationOpen(false)} widthClassName="w-full sm:w-[420px]">
        <div className="space-y-3 p-5">
          {notifications.map((notification) => (
            <article key={notification.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-slate-900">{notification.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{notification.description}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{notification.time}</span>
              </div>
            </article>
          ))}
        </div>
      </Drawer>
    </div>
  )
}

function SidebarLink({
  to,
  label,
  collapsed,
  active,
  icon: Icon,
  inset = false,
  variant = 'primary',
}: {
  to: string
  label: string
  collapsed: boolean
  active: boolean
  icon?: typeof BookOpen
  inset?: boolean
  variant?: 'primary' | 'subtle'
}) {
  return (
    <NavLink
      to={to}
      className={`relative flex items-center px-4 py-3 transition ${
        inset ? 'pl-5' : ''
      } ${
        active
          ? variant === 'subtle'
            ? 'bg-brand-50 text-brand-700'
            : 'bg-brand-50 text-brand-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-2 bottom-2 left-0 w-0.5 transition ${
          active ? (variant === 'subtle' ? 'bg-brand-300' : 'bg-brand-500') : 'bg-transparent'
        }`}
      />
      {Icon ? (
        <Icon size={20} className={`shrink-0 ${active ? 'text-brand-600' : ''}`} />
      ) : (
        <span
          aria-hidden="true"
          className={`ml-1 h-1.5 w-1.5 ${active ? 'bg-brand-500' : 'bg-slate-300'}`}
        />
      )}
      {!collapsed ? <span className="ml-3">{label}</span> : null}
    </NavLink>
  )
}
