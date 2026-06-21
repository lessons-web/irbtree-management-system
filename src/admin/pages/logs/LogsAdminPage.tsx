import { useState } from 'react'
import {
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
import { useAdminRuntime } from '../../context/AdminRuntimeContext'
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters'
import type { AdminColumn, LogAdminRow } from '../../types/admin'

const pageSize = 8

const moduleOptions = [
  { value: 'all', label: '全部模块' },
  { value: '课程管理', label: '课程管理' },
  { value: '评价管理', label: '评价管理' },
  { value: '院校管理', label: '院校管理' },
  { value: '教师管理', label: '教师管理' },
  { value: '学期管理', label: '学期管理' },
  { value: '标签管理', label: '标签管理' },
  { value: '用户管理', label: '用户管理' },
  { value: '消息管理', label: '消息管理' },
  { value: '系统日志', label: '系统日志' },
]

export default function LogsAdminPage() {
  const { logs } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [module, setModule] = useState('all')

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows: logs,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(module, row.module),
    resetDeps: [module, query],
  })

  const columns: AdminColumn<LogAdminRow>[] = [
    {
      key: 'module',
      header: '模块',
      render: (row) => <RowTitle title={row.module} subtitle={row.actor} />,
    },
    {
      key: 'action',
      header: '操作',
      render: (row) => row.action,
    },
    {
      key: 'createdAt',
      header: '时间',
      render: (row) => row.createdAt,
    },
    {
      key: 'status',
      header: '结果',
      render: (row) => <AdminStatusBadge label={row.status} tone={row.statusTone} />,
    },
  ]

  return (
    <AdminPageFrame
      title="系统日志"
      description="查看后台操作流水、模块来源与执行结果。"
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="搜索模块、操作或执行人..."
      filters={<AdminFilterSelect label="模块" value={module} options={moduleOptions} onChange={setModule} />}
    >
      <AdminTableCard>
        <AdminPageTable columns={columns} rows={pagedRows} getRowKey={(row) => row.id} />
        <AdminFooterPagination currentPage={safePage} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
      </AdminTableCard>
    </AdminPageFrame>
  )
}
