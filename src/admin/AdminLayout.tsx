import {
  Bell,
  BookOpen,
  Buildings,
  Calendar,
  CaretDown,
  CaretLeft,
  ChatText,
  ChalkboardTeacher,
  Desktop,
  Scroll,
  SignOut,
  Tag,
  Users,
  Gear,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import Drawer from '../components/common/Drawer'
import { AdminRuntimeProvider, useAdminRuntime } from './context/AdminRuntimeContext'
import { adminPageTitles, adminPrimaryNav, adminSystemNav } from './config/navigation'
import { getUserPresentation, useAuth } from '../features/auth/state'

const navIcons: Record<string, typeof BookOpen> = {
  '课程管理': BookOpen,
  '评价管理': ChatText,
  '院校管理': Buildings,
  '教师管理': ChalkboardTeacher,
  '学期管理': Calendar,
  '标签管理': Tag,
  '用户管理': Users,
  '系统设置': Gear,
  '消息管理': Bell,
  '系统日志': Scroll,
} as const

export default function AdminLayout() {
  return (
    <AdminRuntimeProvider>
      <AdminLayoutContent />
    </AdminRuntimeProvider>
  )
}

function AdminLayoutContent() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { notifications } = useAdminRuntime()
  const presentation = getUserPresentation(user)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [systemOpen, setSystemOpen] = useState(pathname.startsWith('/admin/messages') || pathname.startsWith('/admin/logs'))
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

  useEffect(() => {
    if (pathname.startsWith('/admin/messages') || pathname.startsWith('/admin/logs')) {
      setSystemOpen(true)
    }
  }, [pathname])

  const pageTitle = useMemo(() => adminPageTitles.get(pathname) ?? '后台管理', [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      <aside
        className={`hidden shrink-0 border-r border-slate-200 bg-white shadow-sm shadow-slate-200/60 transition-all duration-300 lg:flex lg:flex-col ${
          sidebarCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-10 w-10 rounded-xl" />
          {!sidebarCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900">IRBTree Admin</p>
              <p className="text-xs text-slate-500">课程管理与治理后台</p>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm font-medium text-slate-600">
          {adminPrimaryNav.map((item) => (
            <SidebarLink key={item.to} to={item.to} label={item.label} collapsed={sidebarCollapsed} />
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSystemOpen((value) => !value)}
              className={`flex w-full items-center rounded-2xl px-4 py-3 transition hover:bg-slate-100 ${
                pathname.startsWith('/admin/messages') || pathname.startsWith('/admin/logs') ? 'bg-slate-100 text-slate-900' : ''
              }`}
              aria-label="系统设置"
            >
              <Gear size={20} className="shrink-0" />
              {!sidebarCollapsed ? (
                <>
                  <span className="ml-3 flex-1 text-left">系统设置</span>
                  <CaretDown size={16} className={`transition ${systemOpen ? 'rotate-180' : ''}`} />
                </>
              ) : null}
            </button>
            {systemOpen && !sidebarCollapsed ? (
              <div className="mt-1 space-y-1 rounded-2xl bg-slate-50 p-2">
                {adminSystemNav.map((item) => (
                  <SidebarLink key={item.to} to={item.to} label={item.label} collapsed={false} inset />
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4">
          {!sidebarCollapsed ? (
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-500">v1.0.2</p>
              <p className="font-mono text-[10px] text-slate-400">b7a9f2</p>
            </div>
          ) : <div />}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'}
          >
            <CaretLeft size={18} className={sidebarCollapsed ? 'rotate-180' : ''} />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm shadow-slate-100 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setNotificationOpen(true)}
              className="relative rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="通知"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-full px-2 py-1 transition hover:bg-slate-50"
                aria-label="管理员菜单"
                aria-expanded={menuOpen}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
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
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <SignOut size={18} />
                    退出登录
                  </button>
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

function SidebarLink({ to, label, collapsed, inset = false }: { to: string; label: string; collapsed: boolean; inset?: boolean }) {
  const Icon = navIcons[label]

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center rounded-2xl px-4 py-3 transition ${
          inset ? 'pl-8' : ''
        } ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
      }
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed ? <span className="ml-3">{label}</span> : null}
    </NavLink>
  )
}
