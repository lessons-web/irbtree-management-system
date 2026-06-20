import { LockKey, User as UserIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAuth } from '../../features/auth/state'
import Modal from '../common/Modal'

type LoginModalProps = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { loginAs, user } = useAuth()
  const [email, setEmail] = useState('student@uni.edu.au')
  const [password, setPassword] = useState('password123')

  return (
    <Modal open={open} title="请先登录" onClose={onClose}>
      <div className="mb-6 text-sm leading-6 text-slate-500">
        登录后查看详细评价、GPA 分布及更多功能。
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          loginAs('student')
          onSuccess?.()
          onClose()
        }}
      >
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
            邮箱 / 用户名
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="login-email"
              type="text"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-10 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">
            密码
          </label>
          <div className="relative">
            <LockKey className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="login-password"
              type="password"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-10 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500"
        >
          立即登录
        </button>
      </form>

      <div className="mt-5 text-xs text-slate-500">默认账号已预填，直接点击登录即可体验。</div>
      <div className="mt-2 text-xs text-slate-400">当前用户：{user ? user.email : '未登录'}</div>
    </Modal>
  )
}
