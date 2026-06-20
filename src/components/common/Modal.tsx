import { X } from '@phosphor-icons/react'
import { useEffect, useId, type ReactNode } from 'react'

export type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        aria-label="关闭弹窗"
        data-testid="modal-backdrop"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-950/15"
      >
        <button
          type="button"
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          aria-label="关闭弹窗"
        >
          <X size={18} />
        </button>
        {title ? (
          <h2 id={titleId} className="pr-10 text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
        ) : null}
        <div className={title ? 'mt-4' : ''}>{children}</div>
      </section>
    </div>
  )
}
