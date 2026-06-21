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
import type { AdminColumn, UniversityAdminRow, UniversityDraft } from '../../types/admin'

const pageSize = 6
const universityStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: '已启用', label: '已启用' },
  { value: '维护中', label: '维护中' },
  { value: '已停用', label: '已停用' },
]
const countryOptions = [
  { value: 'Australia', label: 'Australia' },
  { value: 'UK', label: 'UK' },
  { value: 'USA', label: 'USA' },
  { value: 'Canada', label: 'Canada' },
]
const defaultDraft: UniversityDraft = {
  name: '',
  city: '',
  country: 'Australia',
  contact: '',
  courseCount: 0,
}

function getUniversityStatusTone(status: string) {
  if (status === '已启用') return 'success' as const
  if (status === '维护中') return 'warning' as const
  if (status === '已停用') return 'danger' as const
  return 'neutral' as const
}

function buildUniversitySearchText(draft: UniversityDraft) {
  return [draft.name, draft.city, draft.country, draft.contact].join(' ').trim()
}

export default function UniversitiesAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const { appendOperation, createUniversity, universities, updateUniversity } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [draft, setDraft] = useState<UniversityDraft>(defaultDraft)
  const [editingRow, setEditingRow] = useState<UniversityAdminRow | null>(null)
  const [confirmingRow, setConfirmingRow] = useState<UniversityAdminRow | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows: universities,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(status, row.status),
    resetDeps: [query, status],
  })

  const columns: AdminColumn<UniversityAdminRow>[] = [
    { key: 'name', header: '院校名称', render: (row) => <RowTitle title={row.name} subtitle={`${row.city}, ${row.country}`} /> },
    { key: 'courseCount', header: '课程数', render: (row) => `${row.courseCount}` },
    { key: 'contact', header: '联系邮箱', render: (row) => row.contact },
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
          deleteLabel="停用"
          deleteDisabled={row.status === '已停用'}
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

  function openEditDialog(row: UniversityAdminRow) {
    setDialogMode('edit')
    setEditingRow(row)
    setDraft({
      name: row.name,
      city: row.city,
      country: row.country,
      contact: row.contact,
      courseCount: row.courseCount,
    })
  }

  function handleSaveUniversity() {
    const nextDraft: UniversityDraft = {
      name: draft.name.trim(),
      city: draft.city.trim(),
      country: draft.country.trim(),
      contact: draft.contact.trim(),
      courseCount: Number.isFinite(draft.courseCount) ? Math.max(0, draft.courseCount) : 0,
    }

    if (!nextDraft.name || !nextDraft.city || !nextDraft.country || !nextDraft.contact) return

    if (editingRow) {
      updateUniversity(editingRow.id, (current) => ({
        ...current,
        ...nextDraft,
        searchText: buildUniversitySearchText(nextDraft),
      }))
      appendOperation({
        module: '院校管理',
        title: '院校信息已更新',
        description: `已更新院校：${nextDraft.name}`,
        action: `编辑院校《${editingRow.name}》`,
        actor: presentation.name,
      })
    } else {
      createUniversity({
        id: `university-${nextDraft.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        ...nextDraft,
        status: '已启用',
        statusTone: 'success',
        searchText: buildUniversitySearchText(nextDraft),
      })
      appendOperation({
        module: '院校管理',
        title: '院校已创建',
        description: `已新增院校：${nextDraft.name}`,
        action: `新增院校《${nextDraft.name}》`,
        actor: presentation.name,
      })
    }

    setPage(1)
    resetDialog()
  }

  function handleConfirmDisable() {
    if (!confirmingRow || confirmingRow.status === '已停用') {
      setConfirmingRow(null)
      return
    }

    updateUniversity(confirmingRow.id, (current) => ({
      ...current,
      status: '已停用',
      statusTone: getUniversityStatusTone('已停用'),
    }))
    appendOperation({
      module: '院校管理',
      title: '院校已停用',
      description: `已停用院校：${confirmingRow.name}`,
      action: `停用院校《${confirmingRow.name}》`,
      actor: presentation.name,
    })
    setConfirmingRow(null)
  }

  const dialogTitle = dialogMode === 'edit' ? '编辑院校' : '新增院校'
  const saveDisabled = !draft.name.trim() || !draft.city.trim() || !draft.country.trim() || !draft.contact.trim()

  return (
    <>
      <AdminPageFrame
        title="院校管理"
        description="维护合作院校、课程数量与联系信息。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索院校名称、城市或邮箱..."
        filters={<AdminFilterSelect label="状态" value={status} options={universityStatusOptions} onChange={setStatus} />}
        primaryActionLabel="新增院校"
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
        description="补充院校基础信息后即可提交，保存后会同步写入后台操作记录。"
        widthClassName="max-w-2xl"
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
              onClick={handleSaveUniversity}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={saveDisabled}
            >
              保存院校
            </button>
          </>
        }
      >
        <AdminField.Input
          label="院校名称"
          value={draft.name}
          placeholder="例如：UNSW"
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <AdminField.Input
          label="所在城市"
          value={draft.city}
          placeholder="例如：Sydney"
          onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
        />
        <AdminField.Select
          label="所属国家"
          value={draft.country}
          options={countryOptions}
          onChange={(event) => setDraft((current) => ({ ...current, country: event.target.value }))}
        />
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
        <div className="md:col-span-2">
          <AdminField.Input
            label="联系邮箱"
            value={draft.contact}
            placeholder="例如：admin@unsw.edu.au"
            onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))}
          />
        </div>
      </AdminEntityDialog>

      <AdminEntityDialog
        open={Boolean(confirmingRow)}
        title="确认停用院校"
        description={confirmingRow ? `确认将 ${confirmingRow.name} 标记为停用状态吗？停用后仍会保留历史记录。` : ''}
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
              onClick={handleConfirmDisable}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
            >
              确认停用
            </button>
          </>
        }
      >
        <p className="text-sm leading-6 text-slate-600">停用后的院校不会自动删除，便于后续恢复课程归属和历史审计。</p>
      </AdminEntityDialog>
    </>
  )
}
