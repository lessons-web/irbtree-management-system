import { useMemo, useState } from 'react'
import { universityOptions } from '../../data'
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
import type { AdminColumn, TeacherAdminRow, TeacherDraft } from '../../types/admin'

const pageSize = 6
const teacherStatusOptions = [
  { value: '活跃', label: '活跃' },
  { value: '待认证', label: '待认证' },
  { value: '已移除', label: '已移除' },
]
const defaultDraft: TeacherDraft = {
  name: '',
  university: '',
  courses: '',
  title: '',
  email: '',
  status: '待认证',
}

function getTeacherStatusTone(status: string) {
  if (status === '活跃') return 'success' as const
  if (status === '待认证') return 'warning' as const
  if (status === '已移除') return 'danger' as const
  return 'neutral' as const
}

function buildTeacherSearchText(draft: TeacherDraft) {
  return [draft.name, draft.university, draft.courses, draft.title, draft.email, draft.status].join(' ').trim()
}

export default function TeachersAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const { appendOperation, createTeacher, removeTeacher, teachers, updateTeacher } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [university, setUniversity] = useState('all')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [draft, setDraft] = useState<TeacherDraft>(defaultDraft)
  const [editingRow, setEditingRow] = useState<TeacherAdminRow | null>(null)
  const [confirmingRow, setConfirmingRow] = useState<TeacherAdminRow | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows: teachers,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(university, row.university),
    resetDeps: [query, university],
  })

  const columns: AdminColumn<TeacherAdminRow>[] = [
    { key: 'name', header: '教师姓名', render: (row) => <RowTitle title={row.name} subtitle={row.title} /> },
    { key: 'university', header: '所属院校', render: (row) => row.university },
    { key: 'courses', header: '授课课程', render: (row) => row.courses || '待补充' },
    { key: 'email', header: '邮箱', render: (row) => row.email },
    { key: 'status', header: '状态', render: (row) => <AdminStatusBadge label={row.status} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: '操作',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => <AdminActionButtons onEdit={() => openEditDialog(row)} onDelete={() => setConfirmingRow(row)} deleteLabel="移除" />,
    },
  ]

  const teacherUniversityOptions = useMemo(
    () => [{ value: '', label: '请选择院校' }, ...universityOptions.filter((option) => option.value !== 'all')],
    [],
  )

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

  function openEditDialog(row: TeacherAdminRow) {
    setDialogMode('edit')
    setEditingRow(row)
    setDraft({
      name: row.name,
      university: row.university,
      courses: row.courses,
      title: row.title,
      email: row.email,
      status: row.status,
    })
  }

  function handleSaveTeacher() {
    const nextDraft: TeacherDraft = {
      name: draft.name.trim(),
      university: draft.university.trim(),
      courses: draft.courses.trim(),
      title: draft.title.trim(),
      email: draft.email.trim(),
      status: draft.status,
    }

    if (!nextDraft.name || !nextDraft.university || !nextDraft.email || !nextDraft.title) return

    if (editingRow) {
      updateTeacher(editingRow.id, (current) => ({
        ...current,
        ...nextDraft,
        searchText: buildTeacherSearchText(nextDraft),
        statusTone: getTeacherStatusTone(nextDraft.status),
      }))
      appendOperation({
        module: '教师管理',
        title: '教师信息已更新',
        description: `已更新教师：${nextDraft.name}`,
        action: `编辑教师《${editingRow.name}》`,
        actor: presentation.name,
      })
    } else {
      createTeacher({
        id: `teacher-${nextDraft.email.toLowerCase()}-${Date.now()}`,
        ...nextDraft,
        statusTone: getTeacherStatusTone(nextDraft.status),
        searchText: buildTeacherSearchText(nextDraft),
      })
      appendOperation({
        module: '教师管理',
        title: '教师已录入',
        description: `已新增教师：${nextDraft.name}`,
        action: `新增教师《${nextDraft.name}》`,
        actor: presentation.name,
      })
    }

    setPage(1)
    resetDialog()
  }

  function handleConfirmRemove() {
    if (!confirmingRow) return

    removeTeacher(confirmingRow.id)
    appendOperation({
      module: '教师管理',
      title: '教师已移除',
      description: `已移除教师：${confirmingRow.name}`,
      action: `移除教师《${confirmingRow.name}》`,
      actor: presentation.name,
    })
    setConfirmingRow(null)
  }

  const dialogTitle = dialogMode === 'edit' ? '编辑教师' : '新增教师'
  const saveDisabled = !draft.name.trim() || !draft.university.trim() || !draft.email.trim() || !draft.title.trim()

  return (
    <>
      <AdminPageFrame
        title="教师管理"
        description="维护教师信息、所属院校与认证状态。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索教师、课程或邮箱..."
        filters={<AdminFilterSelect label="院校" value={university} options={universityOptions} onChange={setUniversity} />}
        primaryActionLabel="新增教师"
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
        description="补充教师身份、院校和授课信息后即可提交。"
        widthClassName="max-w-xl"
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
              onClick={handleSaveTeacher}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
              disabled={saveDisabled}
            >
              保存教师
            </button>
          </>
        }
      >
        <AdminField.Input
          label="姓名"
          value={draft.name}
          placeholder="例如：David Wilson"
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <AdminField.Input
          label="邮箱"
          value={draft.email}
          placeholder="例如：david.wilson@unsw.edu.au"
          onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
        />
        <AdminField.Select
          label="所属院校"
          value={draft.university}
          options={teacherUniversityOptions}
          onChange={(event) => setDraft((current) => ({ ...current, university: event.target.value }))}
        />
        <AdminField.Input
          label="职称"
          value={draft.title}
          placeholder="例如：Professor"
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        />
        <AdminField.Input
          label="授课课程"
          value={draft.courses}
          placeholder="例如：COMP9021 / COMP9024"
          onChange={(event) => setDraft((current) => ({ ...current, courses: event.target.value }))}
        />
        <AdminField.Select
          label="状态"
          value={draft.status}
          options={teacherStatusOptions}
          onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
        />
      </AdminEntityDialog>

      <AdminEntityDialog
        open={Boolean(confirmingRow)}
        title="确认移除教师"
        description={confirmingRow ? `确认将 ${confirmingRow.name} 从教师列表中移除吗？该操作会保留操作日志。` : ''}
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
              onClick={handleConfirmRemove}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
            >
              确认移除
            </button>
          </>
        }
      >
        <p className="text-sm leading-6 text-slate-600">教师被移除后，不会继续出现在当前列表中，但本次操作会被完整记录。</p>
      </AdminEntityDialog>
    </>
  )
}
