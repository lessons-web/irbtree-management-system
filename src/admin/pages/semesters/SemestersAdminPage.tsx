import { useState } from 'react'
import {
  AdminActionButtons,
  AdminFilterSelect,
  AdminFooterPagination,
  AdminPageFrame,
  AdminPageTable,
  AdminStatusBadge,
  AdminTableCard,
  RowTitle,
  matchesSelect,
  matchesText,
} from '../../components/AdminScaffold'
import AdminEntityDialog from '../../components/AdminEntityDialog'
import AdminField from '../../components/AdminField'
import { useAdminRuntime } from '../../context/AdminRuntimeContext'
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters'
import { getUserPresentation, useAuth } from '../../../features/auth/state'
import type { AdminColumn, SemesterAdminRow, SemesterDraft } from '../../types/admin'

const pageSize = 6
const semesterStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: '进行中', label: '进行中' },
  { value: '筹备中', label: '筹备中' },
  { value: '已归档', label: '已归档' },
]
const semesterDialogStatusOptions = semesterStatusOptions.filter((option) => option.value !== 'all')
const defaultDraft: SemesterDraft = {
  name: '',
  year: '',
  range: '',
  courseCount: 0,
  status: '筹备中',
}

function getSemesterStatusTone(status: string) {
  if (status === '进行中') return 'info' as const
  if (status === '筹备中') return 'warning' as const
  if (status === '已归档') return 'neutral' as const
  return 'neutral' as const
}

function buildSemesterSearchText(draft: SemesterDraft) {
  return [draft.name, draft.year, draft.range, draft.status].join(' ').trim()
}

export default function SemestersAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const { appendOperation, createSemester, semesters, updateSemester } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [draft, setDraft] = useState<SemesterDraft>(defaultDraft)
  const [editingRow, setEditingRow] = useState<SemesterAdminRow | null>(null)
  const [confirmingRow, setConfirmingRow] = useState<SemesterAdminRow | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows: semesters,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(status, row.status),
    resetDeps: [query, status],
  })

  const columns: AdminColumn<SemesterAdminRow>[] = [
    { key: 'name', header: '学期', render: (row) => <RowTitle title={row.name} subtitle={row.range} /> },
    { key: 'year', header: '年份', render: (row) => row.year },
    { key: 'courseCount', header: '课程数', render: (row) => `${row.courseCount}` },
    { key: 'status', header: '状态', render: (row) => <AdminStatusBadge label={row.status} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: '操作',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => (
        <AdminActionButtons
          onEdit={() => openEditDialog(row)}
          onDelete={() => setConfirmingRow(row)}
          deleteLabel="归档"
          deleteTone="neutral"
          deleteDisabled={row.status === '已归档'}
        />
      ),
    },
  ]

  function resetDialog() {
    setDialogMode(null)
    setDraft(defaultDraft)
    setEditingRow(null)
  }

  function openCreateDialog() {
    setDialogMode('create')
    setDraft(defaultDraft)
    setEditingRow(null)
  }

  function openEditDialog(row: SemesterAdminRow) {
    setDialogMode('edit')
    setEditingRow(row)
    setDraft({
      name: row.name,
      year: row.year,
      range: row.range,
      courseCount: row.courseCount,
      status: row.status,
    })
  }

  function handleSaveSemester() {
    const nextDraft: SemesterDraft = {
      name: draft.name.trim(),
      year: draft.year.trim(),
      range: draft.range.trim(),
      courseCount: Number.isFinite(draft.courseCount) ? Math.max(0, draft.courseCount) : 0,
      status: draft.status,
    }

    if (!nextDraft.name || !nextDraft.year || !nextDraft.range) return

    if (editingRow) {
      updateSemester(editingRow.id, (current) => ({
        ...current,
        ...nextDraft,
        searchText: buildSemesterSearchText(nextDraft),
        statusTone: getSemesterStatusTone(nextDraft.status),
      }))
      appendOperation({
        module: '学期管理',
        title: '学期信息已更新',
        description: `已更新学期：${nextDraft.name}`,
        action: `编辑学期《${editingRow.name}》`,
        actor: presentation.name,
      })
    } else {
      createSemester({
        id: `semester-${nextDraft.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        ...nextDraft,
        statusTone: getSemesterStatusTone(nextDraft.status),
        searchText: buildSemesterSearchText(nextDraft),
      })
      appendOperation({
        module: '学期管理',
        title: '学期已创建',
        description: `已新增学期：${nextDraft.name}`,
        action: `新增学期《${nextDraft.name}》`,
        actor: presentation.name,
      })
    }

    setPage(1)
    resetDialog()
  }

  function handleConfirmArchive() {
    if (!confirmingRow || confirmingRow.status === '已归档') {
      setConfirmingRow(null)
      return
    }

    updateSemester(confirmingRow.id, (current) => ({
      ...current,
      status: '已归档',
      statusTone: getSemesterStatusTone('已归档'),
      searchText: buildSemesterSearchText({
        name: current.name,
        year: current.year,
        range: current.range,
        courseCount: current.courseCount,
        status: '已归档',
      }),
    }))
    appendOperation({
      module: '学期管理',
      title: '学期已归档',
      description: `已归档学期：${confirmingRow.name}`,
      action: `归档学期《${confirmingRow.name}》`,
      actor: presentation.name,
    })
    setConfirmingRow(null)
  }

  const dialogTitle = dialogMode === 'edit' ? '编辑学期' : '新增学期'
  const saveDisabled = !draft.name.trim() || !draft.year.trim() || !draft.range.trim()

  return (
    <>
      <AdminPageFrame
        title="学期管理"
        description="维护学期时间范围、课程数量与归档状态。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索学期名称或年份..."
        filters={<AdminFilterSelect label="状态" value={status} options={semesterStatusOptions} onChange={setStatus} />}
        primaryActionLabel="新增学期"
        onPrimaryAction={openCreateDialog}
      >
        <AdminTableCard>
          <AdminPageTable columns={columns} rows={pagedRows} getRowKey={(row) => row.id} />
          <AdminFooterPagination currentPage={safePage} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
        </AdminTableCard>
      </AdminPageFrame>

      <AdminEntityDialog
        open={dialogMode !== null}
        title={dialogTitle}
        description="设置学期名称、时间范围和状态后即可提交。"
        widthClassName="max-w-xl"
        bodyClassName="grid gap-4 p-6 md:grid-cols-2"
        onClose={resetDialog}
        footer={
          <>
            <button
              type="button"
              onClick={resetDialog}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveSemester}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
              disabled={saveDisabled}
            >
              保存学期
            </button>
          </>
        }
      >
        <AdminField.Input
          label="学期名称"
          value={draft.name}
          placeholder="例如：2026 T3"
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <AdminField.Input
          label="年份"
          value={draft.year}
          placeholder="例如：2026"
          onChange={(event) => setDraft((current) => ({ ...current, year: event.target.value }))}
        />
        <div className="md:col-span-2">
          <AdminField.Input
            label="时间范围"
            value={draft.range}
            placeholder="例如：2026-09-14 ~ 2026-12-20"
            onChange={(event) => setDraft((current) => ({ ...current, range: event.target.value }))}
          />
        </div>
        <AdminField.Input
          label="课程数"
          type="number"
          min={0}
          value={draft.courseCount}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              courseCount: Number(event.target.value || 0),
            }))
          }
        />
        <AdminField.Select
          label="状态"
          value={draft.status}
          options={semesterDialogStatusOptions}
          onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
        />
      </AdminEntityDialog>

      <AdminEntityDialog
        open={Boolean(confirmingRow)}
        title="确认归档学期"
        description={confirmingRow ? `确认将 ${confirmingRow.name} 归档吗？归档后会保留课程统计和审计记录。` : ''}
        widthClassName="max-w-md"
        onClose={() => setConfirmingRow(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmingRow(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirmArchive}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              确认归档
            </button>
          </>
        }
      >
        <p className="text-sm leading-6 text-slate-600">已归档学期仍可查看历史信息，但不会继续参与当前学期筛选和运营操作。</p>
      </AdminEntityDialog>
    </>
  )
}
