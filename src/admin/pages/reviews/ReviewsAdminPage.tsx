import { useMemo, useState } from 'react'
import { moderationOptions, reviewRows } from '../../data'
import {
  AdminActionButtons,
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
import ReviewRatingDisplay from '../../components/ReviewRatingDisplay'
import { useAdminRuntime } from '../../context/AdminRuntimeContext'
import { useAdminEntityCollection } from '../../hooks/useAdminEntityCollection'
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters'
import { getUserPresentation, useAuth } from '../../../features/auth/state'
import type { AdminColumn, AdminStatusTone, ReviewAdminRow, ReviewModerationStatus } from '../../types/admin'

const pageSize = 6

const moderationToneMap: Record<ReviewModerationStatus, AdminStatusTone> = {
  待复核: 'warning',
  已通过: 'success',
  已驳回: 'danger',
}

const defaultBulkRejectReason = '批量治理命中高风险标记，已先行驳回并等待人工复核。'

function buildReviewSearchText(row: ReviewAdminRow) {
  return [
    row.course,
    row.courseTitle,
    row.author,
    row.tags.join(' '),
    row.submittedAt,
    row.moderation,
    row.content,
    row.semester,
    row.source,
    row.issueFlags.join(' '),
    String(row.ratingBreakdown.difficulty),
    String(row.ratingBreakdown.homework),
    String(row.ratingBreakdown.grading),
    String(row.ratingBreakdown.harvest),
    row.moderationNote ?? '',
  ]
    .join(' ')
    .trim()
}

function applyModeration(row: ReviewAdminRow, moderation: ReviewModerationStatus, moderationNote?: string): ReviewAdminRow {
  const nextRow: ReviewAdminRow = {
    ...row,
    moderation,
    status: moderation,
    statusTone: moderationToneMap[moderation],
    moderationNote,
  }

  return {
    ...nextRow,
    searchText: buildReviewSearchText(nextRow),
  }
}

export default function ReviewsAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const { appendOperation } = useAdminRuntime()
  const { activeRow, rows, setActiveRow, replaceRows, updateEntity } = useAdminEntityCollection(reviewRows)
  const [query, setQuery] = useState('')
  const [moderation, setModeration] = useState('all')
  const [drawerMode, setDrawerMode] = useState<'detail' | 'bulk' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [bulkRejectReason, setBulkRejectReason] = useState(defaultBulkRejectReason)
  const [rejectConfirming, setRejectConfirming] = useState(false)
  const [bulkActionIntent, setBulkActionIntent] = useState<'approve' | 'reject' | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows,
    pageSize,
    predicate: (row) => matchesText(row.searchText, query) && matchesSelect(moderation, row.moderation),
    resetDeps: [moderation, query],
  })

  const columns: AdminColumn<ReviewAdminRow>[] = [
    { key: 'course', header: '课程', render: (row) => <RowTitle title={row.course} subtitle={row.courseTitle} /> },
    { key: 'author', header: '评价人', render: (row) => <RowTitle title={row.author} subtitle={row.semester} /> },
    { key: 'rating', header: '评分', render: (row) => <ReviewRatingDisplay rating={row.rating} compact /> },
    { key: 'tags', header: '标签', render: (row) => row.tags.join(' / ') },
    { key: 'submittedAt', header: '提交信息', render: (row) => <RowTitle title={row.submittedAt} subtitle={row.source} /> },
    { key: 'moderation', header: '处理状态', render: (row) => <AdminStatusBadge label={row.moderation} tone={row.statusTone} /> },
    {
      key: 'actions',
      header: '操作',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (row) => (
        <AdminActionButtons
          onEdit={() => openDetailDrawer(row)}
          onDelete={() => openModerationDrawer(row)}
          editLabel={row.moderation === '待复核' ? '查看' : '详情'}
          deleteLabel={row.moderation === '待复核' ? '审核' : '查看记录'}
          deleteTone={row.moderation === '待复核' ? 'danger' : 'neutral'}
        />
      ),
    },
  ]

  const pendingRows = useMemo(() => rows.filter((row) => row.moderation === '待复核'), [rows])
  const highRiskRows = useMemo(
    () => pendingRows.filter((row) => row.issueFlags.length > 0),
    [pendingRows],
  )
  const approvedCount = useMemo(() => rows.filter((row) => row.moderation === '已通过').length, [rows])
  const rejectedCount = useMemo(() => rows.filter((row) => row.moderation === '已驳回').length, [rows])

  function resetDrawer() {
    setDrawerMode(null)
    setActiveRow(null)
    setRejectReason('')
    setBulkRejectReason(defaultBulkRejectReason)
    setRejectConfirming(false)
    setBulkActionIntent(null)
  }

  function openDetailDrawer(row: ReviewAdminRow) {
    setActiveRow(row)
    setRejectReason(row.moderationNote ?? '')
    setRejectConfirming(false)
    setDrawerMode('detail')
  }

  function openModerationDrawer(row: ReviewAdminRow) {
    setActiveRow(row)
    setRejectReason(row.moderationNote ?? '')
    setRejectConfirming(false)
    setDrawerMode('detail')
  }

  function handleApproveReview() {
    if (!activeRow) return

    updateEntity(activeRow.id, (current) => applyModeration(current, '已通过', '已完成人工审核并放行展示。'))
    appendOperation({
      module: '评价管理',
      title: '评价已通过审核',
      description: `已通过 ${activeRow.author} 在 ${activeRow.course} 下提交的评价`,
      action: `通过评价《${activeRow.course} ${activeRow.author}》`,
      actor: presentation.name,
    })
    resetDrawer()
  }

  function handleRejectReview() {
    if (!activeRow) return

    const trimmedReason = rejectReason.trim()
    if (!trimmedReason) return

    updateEntity(activeRow.id, (current) => applyModeration(current, '已驳回', trimmedReason))
    appendOperation({
      module: '评价管理',
      title: '评价已驳回',
      description: `已驳回 ${activeRow.author} 在 ${activeRow.course} 下提交的评价`,
      action: `驳回评价《${activeRow.course} ${activeRow.author}》`,
      actor: presentation.name,
      status: '已驳回',
      statusTone: 'danger',
    })
    resetDrawer()
  }

  function handleStartRejectReview() {
    if (!rejectReason.trim()) return
    setRejectConfirming(true)
  }

  function handleCancelRejectReview() {
    setRejectConfirming(false)
  }

  function handleBulkApprove() {
    if (pendingRows.length === 0) return

    replaceRows(
      rows.map((row) =>
        row.moderation === '待复核' ? applyModeration(row, '已通过', '批量治理：已完成首轮通过。') : row,
      ),
    )
    appendOperation({
      module: '评价管理',
      title: '批量治理已完成',
      description: `已批量通过 ${pendingRows.length} 条待复核评价`,
      action: `批量通过 ${pendingRows.length} 条评价`,
      actor: presentation.name,
    })
    setPage(1)
    resetDrawer()
  }

  function handleBulkReject() {
    const trimmedReason = bulkRejectReason.trim()
    if (highRiskRows.length === 0 || !trimmedReason) return

    replaceRows(
      rows.map((row) =>
        row.moderation === '待复核' && row.issueFlags.length > 0 ? applyModeration(row, '已驳回', trimmedReason) : row,
      ),
    )
    appendOperation({
      module: '评价管理',
      title: '高风险评价已批量驳回',
      description: `已批量驳回 ${highRiskRows.length} 条高风险评价`,
      action: `批量驳回 ${highRiskRows.length} 条高风险评价`,
      actor: presentation.name,
      status: '已驳回',
      statusTone: 'danger',
    })
    setPage(1)
    resetDrawer()
  }

  function handleStartBulkApprove() {
    if (pendingRows.length === 0) return
    setBulkActionIntent('approve')
  }

  function handleStartBulkReject() {
    if (highRiskRows.length === 0 || !bulkRejectReason.trim()) return
    setBulkActionIntent('reject')
  }

  function handleCancelBulkAction() {
    setBulkActionIntent(null)
  }

  return (
    <>
      <AdminPageFrame
        title="评价管理"
        description="治理异常评价、复核敏感内容，并查看课程评论的标签与评分。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索课程、作者或标签..."
        filters={<AdminFilterSelect label="处理状态" value={moderation} options={moderationOptions} onChange={setModeration} />}
        primaryActionLabel="批量治理"
        onPrimaryAction={() => {
          setActiveRow(null)
          setDrawerMode('bulk')
        }}
      >
        <AdminTableCard>
          <AdminPageTable columns={columns} rows={pagedRows} getRowKey={(row) => row.id} />
          <AdminFooterPagination currentPage={safePage} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
        </AdminTableCard>
      </AdminPageFrame>

      <AdminFormDrawer
        open={drawerMode === 'detail' && Boolean(activeRow)}
        title="评价复核详情"
        onClose={resetDrawer}
      >
        {activeRow ? (
          <>
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">课程</p>
                <p className="text-sm font-semibold text-slate-900">{activeRow.course}</p>
                <p className="text-sm text-slate-500">{activeRow.courseTitle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">处理状态</p>
                <AdminStatusBadge label={activeRow.moderation} tone={activeRow.statusTone} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">评价人</p>
                <p className="text-sm text-slate-700">{activeRow.author}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">提交信息</p>
                <p className="text-sm text-slate-700">{activeRow.submittedAt}</p>
                <p className="text-sm text-slate-500">
                  {activeRow.semester} · {activeRow.source}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">评分展示</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <ReviewRatingDisplay rating={activeRow.rating} breakdown={activeRow.ratingBreakdown} />
                <div className="text-right text-sm text-amber-800">
                  <p>{activeRow.helpfulCount} 人标记为有帮助</p>
                  <p>{activeRow.tags.join(' / ')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">评价内容</p>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                {activeRow.content}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">风险提示</p>
              <div className="flex flex-wrap gap-2">
                {activeRow.issueFlags.length > 0 ? (
                  activeRow.issueFlags.map((flag) => (
                    <span key={flag} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                      {flag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">未命中风险标记</span>
                )}
              </div>
            </div>

            {activeRow.moderation === '待复核' ? (
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h4 className="text-sm font-medium text-slate-900">审核操作</h4>
                <AdminField.Textarea
                  label="驳回原因"
                  value={rejectReason}
                  placeholder="请输入驳回原因，将在治理记录中展示。"
                  onChange={(event) => {
                    setRejectReason(event.target.value)
                    if (rejectConfirming) setRejectConfirming(false)
                  }}
                  rows={4}
                />
                {rejectConfirming ? (
                  <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <p className="text-sm text-rose-700">确认驳回后将更新状态，并写入通知与系统日志。</p>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCancelRejectReview}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectReview}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
                      >
                        确认驳回
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeRow.moderationNote ? (
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">{activeRow.moderation === '已驳回' ? '驳回原因' : '处理备注'}</p>
                <p className="text-sm leading-6 text-slate-600">{activeRow.moderationNote}</p>
              </div>
            ) : null}

            <AdminDrawerFooter>
              <button
                type="button"
                onClick={resetDrawer}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                关闭
              </button>
              {activeRow.moderation === '待复核' ? (
                <>
                  <button
                    type="button"
                    onClick={handleApproveReview}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    通过评价
                  </button>
                  <button
                    type="button"
                    onClick={handleStartRejectReview}
                    disabled={!rejectReason.trim()}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    驳回评价
                  </button>
                </>
              ) : null}
            </AdminDrawerFooter>
          </>
        ) : null}
      </AdminFormDrawer>

      <AdminFormDrawer open={drawerMode === 'bulk'} title="批量治理模拟" onClose={resetDrawer}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">待复核</p>
            <p className="mt-2 text-3xl font-bold text-amber-900">{pendingRows.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">已通过</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">{approvedCount}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-rose-700 uppercase">已驳回</p>
            <p className="mt-2 text-3xl font-bold text-rose-900">{rejectedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          当前批量治理仅模拟前端状态流，不接真实后端接口。可以一次性通过全部待复核评价，或对命中风险标记的评价执行批量驳回。
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">高风险命中</p>
          <div className="flex flex-wrap gap-2">
            {highRiskRows.length > 0 ? (
              highRiskRows.map((row) => (
                <span key={row.id} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                  {row.course} · {row.author}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">当前无高风险待复核评价</span>
            )}
          </div>
        </div>

        <AdminField.Textarea
          label="批量驳回原因"
          value={bulkRejectReason}
          placeholder="输入统一驳回原因，批量治理时会写入每条评价备注。"
          onChange={(event) => {
            setBulkRejectReason(event.target.value)
            if (bulkActionIntent === 'reject') setBulkActionIntent(null)
          }}
          rows={4}
        />

        {bulkActionIntent ? (
          <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-sm text-indigo-700">
              {bulkActionIntent === 'approve'
                ? `确认批量通过 ${pendingRows.length} 条待复核评价？`
                : `确认批量驳回 ${highRiskRows.length} 条高风险评价？`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelBulkAction}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={bulkActionIntent === 'approve' ? handleBulkApprove : handleBulkReject}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                  bulkActionIntent === 'approve' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {bulkActionIntent === 'approve' ? '确认批量通过' : '确认批量驳回'}
              </button>
            </div>
          </div>
        ) : null}

        <AdminDrawerFooter>
          <button
            type="button"
            onClick={resetDrawer}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={handleStartBulkApprove}
            disabled={pendingRows.length === 0}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            批量通过待复核
          </button>
          <button
            type="button"
            onClick={handleStartBulkReject}
            disabled={highRiskRows.length === 0 || !bulkRejectReason.trim()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            批量驳回高风险
          </button>
        </AdminDrawerFooter>
      </AdminFormDrawer>
    </>
  )
}
