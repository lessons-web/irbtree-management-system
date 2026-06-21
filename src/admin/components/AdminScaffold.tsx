import { CaretLeft, CaretRight, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import Drawer from '../../components/common/Drawer'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import type { AdminColumn, AdminStatusTone } from '../types/admin'

type PageFrameProps = {
  title: string
  description: string
  query: string
  onQueryChange: (value: string) => void
  searchPlaceholder: string
  filters?: ReactNode
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  children: ReactNode
}

type TableProps<T> = {
  columns: AdminColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
}

type AdminDrawerProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

type AdminConfirmProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

export function AdminPageFrame({
  title,
  description,
  query,
  onQueryChange,
  searchPlaceholder,
  filters,
  primaryActionLabel,
  onPrimaryAction,
  children,
}: PageFrameProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[28px] font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <MagnifyingGlass size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label="搜索"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
            />
          </label>
          {filters ? <div className="flex flex-wrap gap-3">{filters}</div> : null}
        </div>

        {primaryActionLabel && onPrimaryAction ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus size={18} />
            {primaryActionLabel}
          </button>
        ) : null}
      </div>

      {children}
    </section>
  )
}

export function AdminFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-[160px] flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function AdminTableCard({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">{children}</div>
}

export function AdminPageTable<T>({ columns, rows, getRowKey }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="align-top transition hover:bg-slate-50/80">
              {columns.map((column) => (
                <td key={column.key} className={`px-5 py-4 text-sm text-slate-700 ${column.cellClassName ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <div className="rounded-full bg-slate-100 p-3 text-slate-500">
            <MagnifyingGlass size={20} />
          </div>
          <p className="text-sm font-medium text-slate-700">暂无符合条件的数据</p>
          <p className="text-sm text-slate-500">可以调整筛选条件或更换关键词后重试。</p>
        </div>
      ) : null}
    </div>
  )
}

export function AdminStatusBadge({ label, tone }: { label: string; tone: AdminStatusTone }) {
  const classes = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-rose-50 text-rose-700 ring-rose-200',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
    info: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  }[tone]

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>{label}</span>
}

export function AdminActionButtons({
  onEdit,
  onDelete,
  editLabel = '编辑',
  deleteLabel = '删除',
  deleteTone = 'danger',
  editDisabled = false,
  deleteDisabled = false,
}: {
  onEdit: () => void
  onDelete: () => void
  editLabel?: string
  deleteLabel?: string
  deleteTone?: 'danger' | 'neutral'
  editDisabled?: boolean
  deleteDisabled?: boolean
}) {
  const deleteClassName =
    deleteTone === 'danger'
      ? 'rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400'
      : 'rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400'

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        disabled={editDisabled}
        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {editLabel}
      </button>
      <button type="button" onClick={onDelete} disabled={deleteDisabled} className={deleteClassName}>
        {deleteLabel}
      </button>
    </div>
  )
}

export function AdminFooterPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">共 {totalItems} 条数据</p>
      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={totalItems} onPageChange={onPageChange} />
    </div>
  )
}

export function AdminFormDrawer({ open, title, onClose, children }: AdminDrawerProps) {
  return (
    <Drawer open={open} title={title} onClose={onClose} widthClassName="w-full sm:w-[560px]">
      <div className="space-y-5 p-6">{children}</div>
    </Drawer>
  )
}

export function AdminDrawerFooter({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">{children}</div>
}

export function AdminConfirmModal({ open, title, description, confirmLabel, onConfirm, onClose }: AdminConfirmProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-600">{description}</p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            取消
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500">
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function DetailGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="text-sm leading-6 text-slate-700">{value}</p>
    </div>
  )
}

export function clampPage(page: number, totalItems: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  return Math.min(page, totalPages)
}

export function sliceRows<T>(rows: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

export function matchesSelect(value: string, expected: string) {
  return value === 'all' || value === expected
}

export function matchesText(searchText: string, query: string) {
  return searchText.toLowerCase().includes(query.trim().toLowerCase())
}

export function RowTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-slate-900">{title}</p>
      {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  )
}

export function ArrowHint() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <CaretLeft size={12} />
      <CaretRight size={12} />
    </span>
  )
}
