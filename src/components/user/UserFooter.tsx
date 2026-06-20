import { NavLink } from 'react-router'

export default function UserFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-9 w-9" />
          <p>© 2026 IRBTree. Made for AU Students.</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <NavLink to="/" className="transition hover:text-slate-900">
            关于我们
          </NavLink>
          <NavLink to="/" className="transition hover:text-slate-900">
            隐私政策
          </NavLink>
          <NavLink to="/" className="transition hover:text-slate-900">
            联系支持
          </NavLink>
        </div>
      </div>
    </footer>
  )
}
