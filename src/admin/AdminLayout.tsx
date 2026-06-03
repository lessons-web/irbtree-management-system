import { NavLink, Outlet } from 'react-router'

const links = [
  { to: '/admin', label: '工作台' },
  { to: '/admin/reviews', label: '评课治理' },
  { to: '/admin/students', label: '学员付费' },
  { to: '/admin/content', label: '学习内容' },
  { to: '/admin/system', label: '系统' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">IRBTree Admin</div>
            <nav className="mt-4 grid gap-1 text-sm">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 font-medium ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                  end={item.to === '/admin'}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
