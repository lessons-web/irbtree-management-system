import { NavLink } from 'react-router'

export default function UserFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-8 w-8" />
          <p>© 2026 IRBTree. Made for AU Students.</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <NavLink to="/" className="transition hover:text-slate-700">
            关于我们
          </NavLink>
          <NavLink to="/" className="transition hover:text-slate-700">
            隐私政策
          </NavLink>
          <NavLink to="/" className="transition hover:text-slate-700">
            联系支持
          </NavLink>
        </div>
      </div>
    </footer>
  )
}
