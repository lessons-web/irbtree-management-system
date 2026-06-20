import { ChatsCircle, CopySimple, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'

export default function FloatingConsultButton() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrImageUrl = useMemo(() => {
    const prompt = encodeURIComponent(
      'realistic WeChat QR code poster, black and white QR code centered, minimal clean white background, high contrast, sharp edges, small label irbtree_cs under the code, professional and clean, square',
    )
    return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`
  }, [])

  return (
    <div className="fixed right-6 bottom-6 z-30">
      {open ? (
        <section className="absolute right-0 bottom-[72px] w-[356px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">联系教务完成报名</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">支持课程咨询、排课建议和选课时间提醒。</p>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="关闭咨询面板"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-500">微信号</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[15px] font-semibold tracking-wide text-slate-900">irbtree_cs</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('irbtree_cs')
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 1600)
                    } catch {
                      setCopied(false)
                    }
                  }}
                >
                  <CopySimple size={14} />
                  {copied ? '已复制' : '一键复制'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-4">
              <img
                src={qrImageUrl}
                alt="微信二维码（示意图）"
                className="h-28 w-28 rounded-[20px] border border-slate-200 bg-white object-cover"
              />
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">扫码添加教务</div>
                <div className="text-xs leading-6 text-slate-500">二维码为示意图，请复制微信号搜索添加</div>
              </div>
            </div>

            <div className="rounded-[22px] border border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-xs leading-6 text-indigo-700">
              工作日 10:00-20:00 回复更快；如遇选课高峰，建议先添加微信备注学校与专业方向。
            </div>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className="fixed right-6 bottom-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800"
        onClick={() => setOpen((current) => !current)}
        aria-label="报名咨询"
      >
        <ChatsCircle size={22} weight="fill" />
        报名咨询
      </button>
    </div>
  )
}
