import { useState, type ReactNode } from 'react'
import {
  AlertCircle,
  BookOpen,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Palette,
  PlayCircle,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react'

const THEMES = {
  blue: {
    primary: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    hover: 'hover:bg-blue-700',
    ring: 'ring-blue-600',
  },
  indigo: {
    primary: 'bg-indigo-600',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    light: 'bg-indigo-50',
    hover: 'hover:bg-indigo-700',
    ring: 'ring-indigo-600',
  },
  emerald: {
    primary: 'bg-emerald-600',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    light: 'bg-emerald-50',
    hover: 'hover:bg-emerald-700',
    ring: 'ring-emerald-600',
  },
} as const

type Role = 'visitor' | 'student' | 'admin'
type ThemeKey = keyof typeof THEMES
type ThemeClasses = (typeof THEMES)[ThemeKey]

type ViewProps = {
  t: ThemeClasses
}

type NavItemProps = {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
  t: ThemeClasses
}

type StudentRowProps = {
  name: string
  email: string
  courses: string[]
  status: string
  statusColor: string
  remark: string
  t: ThemeClasses
}

export default function App() {
  const [role, setRole] = useState<Role>('admin')
  const [theme, setTheme] = useState<ThemeKey>('blue')
  const t = THEMES[theme]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
      <div className="z-50 flex items-center justify-between bg-slate-900 p-3 text-sm text-white shadow-md">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-300">原型控制台：</span>
          <div className="flex rounded-lg bg-slate-800 p-1">
            {(['visitor', 'student', 'admin'] as Role[]).map((currentRole) => (
              <button
                key={currentRole}
                type="button"
                onClick={() => setRole(currentRole)}
                className={`rounded-md px-4 py-1.5 capitalize transition-colors ${
                  role === currentRole
                    ? 'bg-white font-medium text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentRole === 'visitor'
                  ? '访客端'
                  : currentRole === 'student'
                    ? '学生端'
                    : '管理端'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Palette size={16} className="text-slate-400" />
          <div className="flex gap-2">
            {(Object.keys(THEMES) as ThemeKey[]).map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`切换到${color}主题`}
                onClick={() => setTheme(color)}
                className={`h-6 w-6 rounded-full ${THEMES[color].primary} ${
                  theme === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {role === 'visitor' && <VisitorView t={t} />}
        {role === 'student' && <StudentView t={t} />}
        {role === 'admin' && <AdminView t={t} />}
      </div>
    </div>
  )
}

function VisitorView({ t }: ViewProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <div className={`flex items-center gap-2 text-2xl font-bold ${t.text}`}>
          <BookOpen size={28} />
          红黑树 CS 培训
        </div>
        <div className="flex gap-4">
          <button type="button" className="px-5 py-2 font-medium text-slate-600 hover:text-slate-900">
            公开课
          </button>
          <button type="button" className="px-5 py-2 font-medium text-slate-600 hover:text-slate-900">
            课程介绍
          </button>
          <button
            type="button"
            className={`rounded-lg px-6 py-2 font-medium text-white transition-colors ${t.primary} ${t.hover}`}
          >
            登录 / 注册
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-16">
        <div className="mb-16 space-y-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            搞定 UNSW CS 核心课程
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-500">
            专属题库、全真模考、保姆级解析。告别无效刷题，建立你的全栈知识体系。
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button
              type="button"
              className={`rounded-xl px-8 py-3 text-lg font-medium text-white shadow-lg shadow-blue-500/30 ${t.primary} ${t.hover}`}
            >
              立即报名
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-lg font-medium text-slate-700 hover:bg-slate-50"
            >
              试听公开课
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {[
            {
              title: 'COMP9021 编程基础',
              desc: 'Python 核心语法、数据结构与算法入门，配套 100+ 专项练习题。',
              icon: <FileText size={24} />,
            },
            {
              title: 'COMP9024 数据结构',
              desc: 'C语言进阶，图论与高级树结构，全真期末模拟卷。',
              icon: <LayoutDashboard size={24} />,
            },
            {
              title: 'COMP1511 C语言',
              desc: '零基础入门首选，手把手带你理解指针与内存管理。',
              icon: <PlayCircle size={24} />,
            },
          ].map((course) => (
            <div
              key={course.title}
              className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${t.light} ${t.text}`}>
                {course.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold">{course.title}</h3>
              <p className="leading-relaxed text-slate-500">{course.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function StudentView({ t }: ViewProps) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <div className={`flex items-center gap-2 text-xl font-bold ${t.text}`}>
          <BookOpen size={24} />
          我的学习空间
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-600">
            S
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 px-8 py-8">
        <div className="w-full">
          <h2 className="mb-8 text-2xl font-bold">我的课程</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className={`mb-2 inline-block rounded-md px-2 py-1 text-xs font-bold ${t.light} ${t.text}`}>
                    学习中
                  </span>
                  <h3 className="text-xl font-bold">COMP9021 Python 基础</h3>
                </div>
                <span className="text-sm text-slate-400">有效期至: 2026-12-31</span>
              </div>

              <div className="mt-auto flex gap-4 pt-6">
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-2.5 text-center font-medium text-white ${t.primary} ${t.hover}`}
                >
                  去刷题
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-slate-100 py-2.5 text-center font-medium text-slate-700 hover:bg-slate-200"
                >
                  看课件
                </button>
              </div>
            </div>

            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 opacity-75 shadow-sm">
              <div className="absolute top-0 right-0 rounded-bl-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                已过期
              </div>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-500">COMP9024 数据结构</h3>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-600">
                <AlertCircle size={16} />
                课程已到期，请联系教务微信开通续费。
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function AdminView({ t }: ViewProps) {
  const [activeTab, setActiveTab] = useState('students')

  return (
    <div className="flex flex-1 overflow-hidden bg-slate-50">
      <aside className="flex w-64 flex-col bg-slate-900 text-slate-300">
        <div className="flex items-center gap-2 p-6 text-xl font-bold text-white">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.primary}`}>
            <Settings size={20} />
          </div>
          红黑树 Admin
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="工作台"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            t={t}
          />
          <NavItem
            icon={<Users size={18} />}
            label="学员管理"
            active={activeTab === 'students'}
            onClick={() => setActiveTab('students')}
            t={t}
          />
          <NavItem
            icon={<BookOpen size={18} />}
            label="课程与题库"
            active={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
            t={t}
          />
          <NavItem
            icon={<CreditCard size={18} />}
            label="财务流水"
            active={activeTab === 'finance'}
            onClick={() => setActiveTab('finance')}
            t={t}
          />
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-slate-400 transition-colors hover:text-white"
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <h1 className="text-xl font-bold text-slate-800">学员管理</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索邮箱或姓名..."
                className={`rounded-lg border border-transparent bg-slate-100 py-2 pr-4 pl-9 text-sm focus:border-slate-300 focus:bg-white focus:ring-2 focus:outline-none ${t.ring}`}
              />
            </div>
            <button
              type="button"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${t.primary} ${t.hover}`}
            >
              <Plus size={16} />
              录入学员
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">学员信息</th>
                  <th className="px-6 py-4 font-medium">已开通课程</th>
                  <th className="px-6 py-4 font-medium">付款状态</th>
                  <th className="px-6 py-4 font-medium">最近备注</th>
                  <th className="px-6 py-4 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <StudentRow
                  name="张三"
                  email="zhangsan@unsw.edu.au"
                  courses={['COMP9021']}
                  status="已付全款"
                  statusColor="border-emerald-200 bg-emerald-50 text-emerald-700"
                  remark="26/6/3: 已发课件权限"
                  t={t}
                />
                <StudentRow
                  name="李四"
                  email="lisi@gmail.com"
                  courses={['COMP9024', 'COMP1511']}
                  status="部分付款"
                  statusColor="border-amber-200 bg-amber-50 text-amber-700"
                  remark="26/6/1: 承诺下周补齐尾款"
                  t={t}
                />
                <StudentRow
                  name="王五"
                  email="wangwu@outlook.com"
                  courses={['COMP9021']}
                  status="未付款"
                  statusColor="border-rose-200 bg-rose-50 text-rose-700"
                  remark="26/5/28: 试听结束，考虑中"
                  t={t}
                />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, t }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        active ? `${t.primary} text-white` : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function StudentRow({ name, email, courses, status, statusColor, remark, t }: StudentRowProps) {
  return (
    <tr className="group transition-colors hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="font-medium text-slate-900">{name}</div>
        <div className="mt-1 text-xs text-slate-500">{email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {courses.map((course) => (
            <span key={course} className={`rounded border px-2 py-1 text-xs ${t.light} ${t.text} ${t.border}`}>
              {course}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="max-w-[200px] truncate px-6 py-4 text-xs text-slate-500">{remark}</td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          className={`text-sm font-medium transition-opacity ${t.text} opacity-0 group-hover:opacity-100`}
        >
          详情 / 编辑
        </button>
      </td>
    </tr>
  )
}
