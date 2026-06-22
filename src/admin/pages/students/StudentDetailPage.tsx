import { CaretLeft } from '@phosphor-icons/react'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import { AdminStatusBadge, RowTitle } from '../../components/AdminScaffold'
import { useAdminRuntime } from '../../context/AdminRuntimeContext'
import { buildStudentDetailModel } from './studentsAdminData'

type StudentDetailLocationState = {
  fromList?: {
    pathname: string
    query: string
    page: number
  }
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">{children}</p>
}

export default function StudentDetailPage() {
  const { studentId } = useParams()
  const location = useLocation()
  const { students, enrollments, payments, studentNotes, courses } = useAdminRuntime()
  const fromList = (location.state as StudentDetailLocationState | null)?.fromList
  const backTarget = fromList?.pathname ?? '/admin/student-management/students'
  const backState = fromList ? { listContext: fromList } : undefined

  if (!studentId) {
    return <Navigate to="/admin/student-management/students" replace />
  }

  const detail = buildStudentDetailModel({
    studentId,
    students,
    enrollments,
    payments,
    studentNotes,
    courses,
  })

  if (!detail) {
    return <Navigate to="/admin/student-management/students" replace />
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <Link
          to={backTarget}
          state={backState}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition hover:text-brand-600"
        >
          <CaretLeft size={16} />
          返回学员列表
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{detail.student.name}</h1>
              <AdminStatusBadge label={detail.statusLabel} tone={detail.statusTone} />
            </div>
            <p className="text-sm text-slate-500">查看课程开通、有效期、缴费明细与跟进记录，便于运营快速完成续费和服务动作。</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="已开通课程" value={`${detail.courseCount} 门`} />
            <MetricCard label="累计缴费" value={detail.totalPaidLabel} />
            <MetricCard label="跟进记录" value={`${detail.notes.length} 条`} />
          </div>
        </div>
      </div>

      <SectionCard title="课程权限">
        {detail.enrollments.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {detail.enrollments.map((enrollment) => (
              <article key={enrollment.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <RowTitle title={enrollment.courseCode} subtitle={enrollment.courseName} />
                  <AdminStatusBadge label={enrollment.statusLabel} tone={enrollment.statusTone} />
                </div>
                <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <DetailItem label="有效期" value={`${enrollment.validFrom} 至 ${enrollment.validUntil}`} />
                  <DetailItem label="开通来源" value={enrollment.source} />
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>当前学员还没有课程权限记录。</EmptyState>
        )}
      </SectionCard>

      <SectionCard title="缴费记录">
        {detail.payments.length > 0 ? (
          <div className="space-y-3">
            {detail.payments.map((payment) => (
              <article key={payment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      {payment.courseCode} · {payment.courseName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {payment.paidAt} · {payment.method} · 操作人 {payment.operator}
                    </p>
                    <p className="text-sm text-slate-600">{payment.note}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-base font-semibold text-slate-900">{payment.amountLabel}</p>
                    <AdminStatusBadge label={payment.statusLabel} tone={payment.statusTone} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>当前学员还没有缴费记录。</EmptyState>
        )}
      </SectionCard>

      <SectionCard title="跟进备注">
        {detail.notes.length > 0 ? (
          <ol className="space-y-3">
            {detail.notes.map((note) => (
              <li key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{note.content}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {note.createdAt} · {note.createdBy}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState>当前学员还没有跟进备注。</EmptyState>
        )}
      </SectionCard>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </article>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="text-sm text-slate-700">{value}</dd>
    </div>
  )
}
