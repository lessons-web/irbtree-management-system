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
import type { AdminColumn, TagAdminRow, TagDraft } from '../../types/admin'

const pageSize = 6
const tagStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: '启用中', label: '启用中' },
  { value: '待下线', label: '待下线' },
  { value: '已下线', label: '已下线' },
]
const tagDialogStatusOptions = tagStatusOptions.filter((option) => option.value !== 'all')
const scopeOptions = [
  { value: '课程评价', label: '课程评价', description: '用于课程评价与评论标签' },
  { value: '系统保留', label: '系统保留', description: '用于兼容历史数据或系统用途' },
]
const defaultDraft: TagDraft = {
  name: '',
  scope: '课程评价',
  description: '',
  status: '启用中',
}

function getTagStatusTone(status: string) {
  if (status === '启用中') return 'success' as const
  if (status === '待下线') return 'warning' as const
  if (status === '已下线') return 'danger' as const
  return 'neutral' as const
}

function buildTagSearchText(draft: TagDraft, usageCount: number) {
  return [draft.name, draft.scope, draft.description, draft.status, String(usageCount)].join(' ').trim()
}

export default function TagsAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const { appendOperation, createTag, tags, updateTag } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [draft, setDraft] = useState<TagDraft>(defaultDraft)
  const [editingRow, setEditingRow] = useState<TagAdminRow | null>(null)
  const [confirmingRow, setConfirmingRow] = useState<TagAdminRow | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows: tags,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(status, row.status),
    resetDeps: [query, status],
  })

  const columns: AdminColumn<TagAdminRow>[] = [
    { key: 'name', header: '标签名称', render: (row) => <RowTitle title={row.name} subtitle={row.scope} /> },
    { key: 'usage', header: '使用次数', render: (row) => `${row.usageCount}` },
    { key: 'description', header: '描述', render: (row) => <p className="max-w-xs leading-6 text-slate-500">{row.description}</p> },
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
          deleteLabel="下线"
          deleteDisabled={row.status === '已下线'}
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

  function openEditDialog(row: TagAdminRow) {
    setDialogMode('edit')
    setEditingRow(row)
    setDraft({
      name: row.name,
      scope: row.scope,
      description: row.description,
      status: row.status,
    })
  }

  function handleSaveTag() {
    const nextDraft: TagDraft = {
      name: draft.name.trim(),
      scope: draft.scope,
      description: draft.description.trim(),
      status: draft.status,
    }

    if (!nextDraft.name || !nextDraft.scope) return

    if (editingRow) {
      updateTag(editingRow.id, (current) => ({
        ...current,
        ...nextDraft,
        searchText: buildTagSearchText(nextDraft, current.usageCount),
        statusTone: getTagStatusTone(nextDraft.status),
      }))
      appendOperation({
        module: '标签管理',
        title: '标签信息已更新',
        description: `已更新标签：${nextDraft.name}`,
        action: `编辑标签《${editingRow.name}》`,
        actor: presentation.name,
      })
    } else {
      createTag({
        id: `tag-${nextDraft.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: nextDraft.name,
        scope: nextDraft.scope,
        description: nextDraft.description,
        usageCount: 0,
        status: nextDraft.status,
        statusTone: getTagStatusTone(nextDraft.status),
        searchText: buildTagSearchText(nextDraft, 0),
      })
      appendOperation({
        module: '标签管理',
        title: '标签已创建',
        description: `已新增标签：${nextDraft.name}`,
        action: `新增标签《${nextDraft.name}》`,
        actor: presentation.name,
      })
    }

    setPage(1)
    resetDialog()
  }

  function handleConfirmOffline() {
    if (!confirmingRow || confirmingRow.status === '已下线') {
      setConfirmingRow(null)
      return
    }

    updateTag(confirmingRow.id, (current) => ({
      ...current,
      status: '已下线',
      statusTone: getTagStatusTone('已下线'),
      searchText: buildTagSearchText(
        {
          name: current.name,
          scope: current.scope,
          description: current.description,
          status: '已下线',
        },
        current.usageCount,
      ),
    }))
    appendOperation({
      module: '标签管理',
      title: '标签已下线',
      description: `已下线标签：${confirmingRow.name}`,
      action: `下线标签《${confirmingRow.name}》`,
      actor: presentation.name,
    })
    setConfirmingRow(null)
  }

  const dialogTitle = dialogMode === 'edit' ? '编辑标签' : '新增标签'
  const saveDisabled = !draft.name.trim() || !draft.scope.trim()

  return (
    <>
      <AdminPageFrame
        title="标签管理"
        description="统一维护课程与评价标签的名称、范围和状态。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索标签名称或范围..."
        filters={<AdminFilterSelect label="状态" value={status} options={tagStatusOptions} onChange={setStatus} />}
        primaryActionLabel="新增标签"
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
        description="标签支持新增、编辑和状态调整，提交后会同步记录后台操作。"
        widthClassName="max-w-lg"
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
              onClick={handleSaveTag}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
              disabled={saveDisabled}
            >
              保存标签
            </button>
          </>
        }
      >
        <AdminField.Input
          label="标签名称"
          value={draft.name}
          placeholder="例如：干货多"
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <AdminField.RadioGroup
          label="适用范围"
          value={draft.scope}
          options={scopeOptions}
          onChange={(value) => setDraft((current) => ({ ...current, scope: value }))}
        />
        <AdminField.Select
          label="状态"
          value={draft.status}
          options={tagDialogStatusOptions}
          onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
        />
        <AdminField.Textarea
          label="描述"
          value={draft.description}
          placeholder="补充该标签的用途、触发场景和展示说明。"
          rows={4}
          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
        />
      </AdminEntityDialog>

      <AdminEntityDialog
        open={Boolean(confirmingRow)}
        title="确认下线标签"
        description={confirmingRow ? `确认将标签“${confirmingRow.name}”标记为下线吗？历史评价中的展示将保持可追溯。` : ''}
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
              onClick={handleConfirmOffline}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
            >
              确认下线
            </button>
          </>
        }
      >
        <p className="text-sm leading-6 text-slate-600">下线后的标签仍可用于历史记录展示，但不会继续出现在运营可选项中。</p>
      </AdminEntityDialog>
    </>
  )
}
