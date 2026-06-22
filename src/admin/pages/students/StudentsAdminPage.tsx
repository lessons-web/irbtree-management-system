import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  AdminFooterPagination,
  AdminPageFrame,
  AdminPageTable,
  AdminStatusBadge,
  AdminTableCard,
  RowTitle,
  matchesText,
} from '../../components/AdminScaffold'
import { useAdminRuntime } from '../../context/AdminRuntimeContext'
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters'
import type { AdminColumn } from '../../types/admin'
import { buildStudentListRows, type StudentListRow } from './studentsAdminData'

const pageSize = 10

type StudentsListLocationState = {
  listContext?: {
    pathname: string
    query: string
    page: number
  }
}

export default function StudentsAdminPage() {
  const { students, enrollments, payments, courses } = useAdminRuntime()
  const location = useLocation()
  const restoredContext = (location.state as StudentsListLocationState | null)?.listContext
  const [query, setQuery] = useState(() => restoredContext?.query ?? '')
  const rows = useMemo(
    () =>
      buildStudentListRows({
        students,
        enrollments,
        payments,
        courses,
      }),
    [courses, enrollments, payments, students],
  )
  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query),
    resetDeps: [query],
    initialPage: restoredContext?.page ?? 1,
  })

  const columns: AdminColumn<StudentListRow>[] = [
    {
      key: 'student',
      header: '学员',
      render: (row) => <RowTitle title={row.name} subtitle={`注册于 ${row.registeredAt}`} />,
    },
    {
      key: 'contact',
      header: '联系方式',
      render: (row) => (
        <div className="space-y-1">
          <p>{row.email}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'enrollments',
      header: '开通课程',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900">{row.courseCountLabel}</p>
          <p className="max-w-sm text-xs leading-5 text-slate-500">{row.courseSummary}</p>
        </div>
      ),
    },
    {
      key: 'payments',
      header: '缴费概况',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900">{row.paymentSummary}</p>
          <p className="text-xs text-slate-500">最近缴费：{row.latestPaymentAt}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: '状态',
      render: (row) => <AdminStatusBadge label={row.statusLabel} tone={row.statusTone} />,
    },
    {
      key: 'actions',
      header: '操作',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => (
        <Link
          to={`/admin/student-management/students/${row.id}`}
          state={{
            fromList: {
              pathname: location.pathname,
              query,
              page: safePage,
            },
          }}
          className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
        >
          查看详情
        </Link>
      ),
    },
  ]

  return (
    <AdminPageFrame
      title="学员列表"
      description="查看学员、课程开通、有效期和缴费概况。"
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="搜索学员姓名、邮箱、手机号或课程..."
    >
      <AdminTableCard>
        <AdminPageTable columns={columns} rows={pagedRows} getRowKey={(row) => row.id} />
        <AdminFooterPagination currentPage={safePage} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
      </AdminTableCard>
    </AdminPageFrame>
  )
}
