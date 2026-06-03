import { NavLink, Outlet } from 'react-router'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="w-72 border-r border-slate-200 bg-white">
        <div className="px-6 py-5 text-lg font-bold">IRBTree Admin</div>
        <nav className="space-y-1 px-3 pb-6 text-sm font-medium text-slate-600">
          <AdminNavItem to="/admin" label="工作台" end />
          <AdminNavItem to="/admin/reviews" label="评课治理" />
          <AdminNavItem to="/admin/students" label="学员付费" />
          <AdminNavItem to="/admin/content" label="学习内容" />
          <AdminNavItem to="/admin/system" label="系统" />
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

function AdminNavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-xl px-4 py-2 ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`
      }
    >
      {label}
    </NavLink>
  )
}
