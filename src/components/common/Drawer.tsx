import { X } from '@phosphor-icons/react'
import { useEffect, useId, type ReactNode } from 'react'

export type DrawerProps = {
  open: boolean
  title?: string
  widthClassName?: string
  onClose: () => void
  children: ReactNode
}

export default function Drawer({
  open,
  title,
  widthClassName = 'w-full sm:w-[540px]',
  onClose,
  children,
}: DrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30"
        aria-label="关闭抽屉遮罩"
        data-testid="drawer-backdrop"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`absolute top-0 right-0 flex h-full ${widthClassName} flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/15`}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="关闭抽屉"
          >
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>
  )
}
