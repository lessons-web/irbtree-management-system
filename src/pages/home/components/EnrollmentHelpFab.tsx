import { Copy, MessageCircle, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function EnrollmentHelpFab() {
  const [open, setOpen] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const qrImageUrl = useMemo(() => {
    const prompt = encodeURIComponent(
      'realistic WeChat QR code poster, black and white QR code centered, minimal clean white background, high contrast, sharp edges, small label irbtree_cs under the code, professional and clean, square',
    )
    return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setCanHover(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => {
      media.removeEventListener('change', sync)
    }
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const handleHoverOpen = useCallback(() => {
    if (!canHover) return
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setOpen(true)
  }, [canHover])

  const handleHoverClose = useCallback(() => {
    if (!canHover) return
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false)
    }, 120)
  }, [canHover])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('irbtree_cs')
      setCopied(true)
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch {
      setCopied(false)
    }
  }, [])

  return (
    <div
      className="fixed right-6 bottom-6 z-50"
      onMouseEnter={handleHoverOpen}
      onMouseLeave={handleHoverClose}
    >
      {open ? (
        <section
          className="absolute right-0 bottom-[72px] w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          aria-label="报名咨询"
          onMouseEnter={handleHoverOpen}
          onMouseLeave={handleHoverClose}
        >
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="text-sm font-semibold text-slate-900">联系教务完成报名</div>
            {canHover ? null : (
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={handleClose}
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            )}
          </header>

          <div className="space-y-4 px-5 py-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-medium text-slate-500">微信号</div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="font-mono text-sm font-semibold text-slate-900">irbtree_cs</div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={handleCopy}
                >
                  <Copy size={14} />
                  {copied ? '已复制' : '一键复制'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <img
                src={qrImageUrl}
                alt="微信二维码（模拟）"
                className="h-28 w-28 rounded-xl border border-slate-200 bg-white object-cover"
              />
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">扫码添加教务</div>
                <div className="text-xs leading-relaxed text-slate-500">
                  二维码为示意图，请复制微信号搜索添加
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 hover:bg-slate-800"
        onClick={canHover ? undefined : handleToggle}
        aria-label="报名咨询"
      >
        <MessageCircle size={18} />
        报名咨询
      </button>
    </div>
  )
}
