import { useState } from 'react'
import {
  getUserRoleLabel,
  getUserStatusTone,
  roleOptions,
  userRoleOptions,
  userStatusOptions,
} from '../../data'
import {
  AdminActionButtons,
  AdminConfirmModal,
  AdminDrawerFooter,
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
import AdminField from '../../components/AdminField'
import { useAdminRuntime } from '../../context/AdminRuntimeContext'
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters'
import { getUserPresentation, useAuth } from '../../../features/auth/state'
import type { AdminColumn, UserAdminRow, UserDraft } from '../../types/admin'

const pageSize = 6
const defaultDraft: UserDraft = {
  name: '',
  email: '',
  role: 'user',
  status: '正常',
}

function buildUserSearchText(draft: UserDraft) {
  return [draft.name, draft.email, getUserRoleLabel(draft.role), draft.role, draft.status].join(' ').trim()
}

function buildUserUpdateAudit(current: UserAdminRow, next: UserDraft) {
  const changedFields: string[] = []
  const roleChanged = current.role !== next.role
  const statusChanged = current.status !== next.status

  if (current.name !== next.name) changedFields.push('昵称')
  if (current.email !== next.email) changedFields.push('邮箱')
  if (roleChanged) changedFields.push('角色')
  if (statusChanged) changedFields.push('状态')

  if (changedFields.length === 0) return null

  const changedSummary = changedFields.join('、')
  const description =
    changedFields.length === 1 && roleChanged
      ? `已更新账号：${next.name}，角色调整为${getUserRoleLabel(next.role)}`
      : changedFields.length === 1 && statusChanged
        ? `已更新账号：${next.name}，状态变更为${next.status}`
        : `已更新账号：${next.name}，更新项：${changedSummary}`

  const actionDetail =
    changedFields.length === 1 && roleChanged
      ? `角色调整为${getUserRoleLabel(next.role)}`
      : changedFields.length === 1 && statusChanged
        ? `状态变更为${next.status}`
        : changedFields.length === 1
          ? `更新${changedFields[0]}`
          : `更新${changedSummary}`

  return {
    description,
    action: `编辑账号《${current.name}》：${actionDetail}`,
  }
}

export default function UsersAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const currentAdminId = user?.id ?? ''
  const { appendOperation, createUser, updateUser, users } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState<UserDraft>(defaultDraft)
  const [confirmingRow, setConfirmingRow] = useState<UserAdminRow | null>(null)
  const [activeRow, setActiveRow] = useState<UserAdminRow | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows: users,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(role, row.role),
    resetDeps: [query, role],
  })

  function isCurrentAdminRow(row: UserAdminRow | null) {
    return Boolean(row && currentAdminId && row.id === currentAdminId)
  }

  const editingCurrentAdmin = isCurrentAdminRow(activeRow)

  const columns: AdminColumn<UserAdminRow>[] = [
    { key: 'name', header: '用户', render: (row) => <RowTitle title={row.name} subtitle={row.email} /> },
    { key: 'role', header: '角色', render: (row) => getUserRoleLabel(row.role) },
    { key: 'createdAt', header: '注册时间', render: (row) => row.createdAt },
    { key: 'lastSeen', header: '最近活跃', render: (row) => row.lastSeen },
    { key: 'status', header: '状态', render: (row) => <AdminStatusBadge label={row.status} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: '操作',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => (
        <AdminActionButtons
          onEdit={() => openEditDrawer(row)}
          onDelete={() => setConfirmingRow(row)}
          deleteLabel="停用"
          deleteDisabled={isCurrentAdminRow(row) || row.status === '已停用'}
        />
      ),
    },
  ]

  function resetDrawer() {
    setDraft(defaultDraft)
    setActiveRow(null)
    setDrawerOpen(false)
  }

  function openCreateDrawer() {
    setDraft(defaultDraft)
    setActiveRow(null)
    setDrawerOpen(true)
  }

  function openEditDrawer(row: UserAdminRow) {
    setDraft({
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
    })
    setActiveRow(row)
    setDrawerOpen(true)
  }

  function handleSaveAccount() {
    const requestedDraft: UserDraft = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      role: draft.role,
      status: draft.status,
    }

    if (!requestedDraft.name || !requestedDraft.email) return

    if (activeRow) {
      const nextDraft = isCurrentAdminRow(activeRow)
        ? {
            ...requestedDraft,
            role: activeRow.role,
            status: activeRow.status,
          }
        : requestedDraft

      const audit = buildUserUpdateAudit(activeRow, nextDraft)
      if (!audit) {
        resetDrawer()
        return
      }

      updateUser(activeRow.id, (current) => ({
        ...current,
        name: nextDraft.name,
        email: nextDraft.email,
        role: nextDraft.role,
        status: nextDraft.status,
        statusTone: getUserStatusTone(nextDraft.status),
        searchText: buildUserSearchText(nextDraft),
      }))
      appendOperation({
        module: '用户管理',
        title: '账号信息已更新',
        description: audit.description,
        action: audit.action,
        actor: presentation.name,
        status: '成功',
        statusTone: 'success',
      })
    } else {
      createUser({
        id: `user-${requestedDraft.email.toLowerCase()}-${Date.now()}`,
        name: requestedDraft.name,
        email: requestedDraft.email,
        role: requestedDraft.role,
        createdAt: '2026-06-21',
        lastSeen: '刚刚',
        status: requestedDraft.status,
        statusTone: getUserStatusTone(requestedDraft.status),
        searchText: buildUserSearchText(requestedDraft),
      })
      appendOperation({
        module: '用户管理',
        title: '账号已创建',
        description: `已新增账号：${requestedDraft.name}`,
        action: `新增账号《${requestedDraft.name}》`,
        actor: presentation.name,
        status: '成功',
        statusTone: 'success',
      })
    }

    setPage(1)
    resetDrawer()
  }

  function handleConfirmDisable() {
    if (!confirmingRow) return
    if (isCurrentAdminRow(confirmingRow) || confirmingRow.status === '已停用') {
      setConfirmingRow(null)
      return
    }

    updateUser(confirmingRow.id, (current) => ({
      ...current,
      status: '已停用',
      statusTone: 'danger',
      searchText: buildUserSearchText({
        name: current.name,
        email: current.email,
        role: current.role,
        status: '已停用',
      }),
    }))
    appendOperation({
      module: '用户管理',
      title: '账号已停用',
      description: `已停用账号：${confirmingRow.name}`,
      action: `停用账号《${confirmingRow.name}》`,
      actor: presentation.name,
      status: '成功',
      statusTone: 'success',
    })
    setConfirmingRow(null)
  }

  return (
    <>
      <AdminPageFrame
        title="用户管理"
        description="维护普通用户、运营与管理员账号状态。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索昵称、邮箱或角色..."
        filters={<AdminFilterSelect label="角色" value={role} options={roleOptions} onChange={setRole} />}
        primaryActionLabel="新增账号"
        onPrimaryAction={openCreateDrawer}
      >
        <AdminTableCard>
          <AdminPageTable columns={columns} rows={pagedRows} getRowKey={(row) => row.id} />
          <AdminFooterPagination currentPage={safePage} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
        </AdminTableCard>
      </AdminPageFrame>

      <AdminFormDrawer open={drawerOpen} title={activeRow ? '编辑账号' : '新增账号'} onClose={resetDrawer}>
        <AdminField.Input
          label="昵称"
          value={draft.name}
          placeholder="例如：Alex Student"
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <AdminField.Input
          label="邮箱"
          value={draft.email}
          placeholder="例如：admin@irbtree.com"
          onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
        />
        <AdminField.RadioGroup
          label="角色"
          value={draft.role}
          options={userRoleOptions}
          disabled={editingCurrentAdmin}
          onChange={(value) => setDraft((current) => ({ ...current, role: value as UserDraft['role'] }))}
        />
        <AdminField.Select
          label="状态"
          value={draft.status}
          options={userStatusOptions}
          disabled={editingCurrentAdmin}
          onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as UserDraft['status'] }))}
        />
        {editingCurrentAdmin ? <p className="text-sm text-amber-600">当前管理员不能修改自己的角色或停用自己。</p> : null}
        <AdminDrawerFooter>
          <button
            type="button"
            onClick={resetDrawer}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSaveAccount}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
            disabled={!draft.name.trim() || !draft.email.trim()}
          >
            保存账号
          </button>
        </AdminDrawerFooter>
      </AdminFormDrawer>

      <AdminConfirmModal
        open={Boolean(confirmingRow)}
        title="确认停用账号"
        description={confirmingRow ? `确认停用账号 ${confirmingRow.name} 吗？` : ''}
        confirmLabel="确认停用"
        onConfirm={handleConfirmDisable}
        onClose={() => setConfirmingRow(null)}
      />
    </>
  )
}
