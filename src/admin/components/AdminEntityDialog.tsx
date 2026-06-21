import { X } from '@phosphor-icons/react'
import { useEffect, useId, type ReactNode } from 'react'

type AdminEntityDialogProps = {
  open: boolean
  title: string
  description?: string
  widthClassName?: string
  bodyClassName?: string
  footer?: ReactNode
  onClose: () => void
  children: ReactNode
}

export default function AdminEntityDialog({
  open,
  title,
  description,
  widthClassName = 'max-w-xl',
  bodyClassName = 'space-y-5 p-6',
  footer,
  onClose,
  children,
}: AdminEntityDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

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
    <div className="fixed inset-0 z-[85] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative z-10 flex max-h-[min(88vh,960px)] w-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 ${widthClassName}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="space-y-1.5">
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭弹窗"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>
        <div className={`overflow-y-auto ${bodyClassName}`}>{children}</div>
        {footer ? <footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">{footer}</footer> : null}
      </section>
    </div>
  )
}
