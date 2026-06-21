import { useState } from 'react'
import { messageAudienceOptions } from '../../data'
import {
  AdminActionButtons,
  AdminConfirmModal,
  AdminFilterSelect,
  AdminFooterPagination,
  AdminFormDrawer,
  AdminPageFrame,
  AdminPageTable,
  AdminStatusBadge,
  AdminTableCard,
  RowTitle,
  matchesSelect,
  matchesText,
} from '../../components/AdminScaffold'
import { useAdminRuntime } from '../../context/AdminRuntimeContext'
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters'
import { getUserPresentation, useAuth } from '../../../features/auth/state'
import type { AdminColumn, MessageAdminRow, MessageDraft } from '../../types/admin'

const pageSize = 6
const defaultDraft: MessageDraft = {
  title: '',
  audience: '全站用户',
  publishAt: '',
  content: '',
}

export default function MessagesAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const { appendOperation, createMessage, messages } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [audience, setAudience] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState<MessageDraft>(defaultDraft)
  const [activeRow, setActiveRow] = useState<MessageAdminRow | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows: messages,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(audience, row.audience),
    resetDeps: [audience, query],
  })

  const columns: AdminColumn<MessageAdminRow>[] = [
    { key: 'title', header: '消息标题', render: (row) => <RowTitle title={row.title} subtitle={row.author} /> },
    { key: 'audience', header: '发送对象', render: (row) => row.audience },
    { key: 'publishAt', header: '发布时间', render: (row) => row.publishAt },
    { key: 'status', header: '状态', render: (row) => <AdminStatusBadge label={row.status} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: '操作',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => (
        <AdminActionButtons
          onEdit={() => {
            setActiveRow(row)
            setDraft({
              title: row.title,
              audience: row.audience,
              publishAt: row.publishAt,
              content: row.content ?? '',
            })
            setDrawerOpen(true)
          }}
          onDelete={() => setActiveRow(row)}
          deleteLabel="撤回"
        />
      ),
    },
  ]

  function resetComposer() {
    setDraft(defaultDraft)
    setActiveRow(null)
    setDrawerOpen(false)
  }

  function handleCreateMessage() {
    const trimmedTitle = draft.title.trim()
    if (!trimmedTitle) return

    const row: MessageAdminRow = {
      id: `message-${Date.now()}`,
      title: trimmedTitle,
      audience: draft.audience,
      publishAt: draft.publishAt || '立即发送',
      author: presentation.name,
      content: draft.content.trim(),
      status: '已发送',
      statusTone: 'success',
      searchText: `${trimmedTitle} ${draft.audience} ${presentation.name} ${draft.content}`.trim(),
    }

    createMessage(row)
    appendOperation({
      module: '消息管理',
      title: '系统消息已创建',
      description: `已创建消息：${trimmedTitle}`,
      action: `创建消息《${trimmedTitle}》`,
      actor: presentation.name,
    })
    resetComposer()
  }

  return (
    <>
      <AdminPageFrame
        title="消息管理"
        description="统一维护站内消息、推送对象与发送排期。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索消息标题或作者..."
        filters={<AdminFilterSelect label="发送对象" value={audience} options={messageAudienceOptions} onChange={setAudience} />}
        primaryActionLabel="新建消息"
        onPrimaryAction={() => {
          setActiveRow(null)
          setDraft(defaultDraft)
          setDrawerOpen(true)
        }}
      >
        <AdminTableCard>
          <AdminPageTable columns={columns} rows={pagedRows} getRowKey={(row) => row.id} />
          <AdminFooterPagination currentPage={safePage} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
        </AdminTableCard>
      </AdminPageFrame>

      <AdminFormDrawer
        open={drawerOpen}
        title={activeRow ? '编辑消息' : '新建消息'}
        onClose={resetComposer}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">标题</span>
          <input
            aria-label="标题"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">发送对象</span>
          <select
            aria-label="发送对象"
            value={draft.audience}
            onChange={(event) => setDraft((current) => ({ ...current, audience: event.target.value }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
          >
            {messageAudienceOptions
              .filter((option) => option.value !== 'all')
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">发布时间</span>
          <input
            aria-label="发布时间"
            value={draft.publishAt}
            onChange={(event) => setDraft((current) => ({ ...current, publishAt: event.target.value }))}
            placeholder="例如：2026-06-20 18:00"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">消息内容</span>
          <textarea
            aria-label="消息内容"
            value={draft.content}
            onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
            rows={5}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
          />
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={resetComposer}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleCreateMessage}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={!draft.title.trim()}
          >
            保存消息
          </button>
        </div>
      </AdminFormDrawer>

      <AdminConfirmModal
        open={Boolean(activeRow) && !drawerOpen}
        title="确认撤回消息"
        description={activeRow ? `确认撤回消息“${activeRow.title}”吗？` : ''}
        confirmLabel="确认撤回"
        onConfirm={() => setActiveRow(null)}
        onClose={() => setActiveRow(null)}
      />
    </>
  )
}
