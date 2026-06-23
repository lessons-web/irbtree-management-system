import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'

export type PublicLayoutNavItem = {
  to: string
  label: string
}

type PublicLayoutProps = {
  brand?: ReactNode
  navigationItems?: PublicLayoutNavItem[]
  footer?: ReactNode
  headerClassName?: string
  containerClassName?: string
  mainClassName?: string
}

const defaultNavigationItems: PublicLayoutNavItem[] = [
  { to: '/review', label: '评课' },
  { to: '/recommend', label: '选课' },
  { to: '/learn', label: '学习' },
  { to: '/me', label: '我的' },
]

export default function PublicLayout({
  brand,
  navigationItems = defaultNavigationItems,
  footer,
  headerClassName,
  containerClassName,
  mainClassName,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className={headerClassName ?? 'sticky top-0 z-40 border-b border-slate-200 bg-white'}>
        <div className={containerClassName ?? 'flex w-full items-center justify-between px-6 py-4'}>
          <NavLink to="/" className="text-lg font-bold text-slate-900">
            {brand ?? 'IRBTree'}
          </NavLink>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
              {navigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="hover:text-slate-900">
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className={mainClassName ?? 'w-full flex-1 px-6 py-10'}>
        <Outlet />
      </main>
      {footer}
    </div>
  )
}
