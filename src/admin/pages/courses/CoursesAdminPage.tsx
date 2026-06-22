import { useMemo, useState } from 'react'
import { buildCourseSearchText, statusOptions, universityOptions } from '../../data'
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
import type { AdminColumn, CourseAdminRow, CourseDraft } from '../../types/admin'

const pageSize = 10
const baseCourseDraft: CourseDraft = {
  code: '',
  name: '',
  university: '',
  credits: 6,
  teacher: '',
  tutor: '',
  summary: '',
}

function normalizeCourseUniversity(value: string) {
  return value === 'Melb' ? 'Melbourne' : value
}

function toCourseUniversityOptionValue(value: string) {
  return value === 'Melbourne' ? 'Melb' : value
}

export default function CoursesAdminPage() {
  const { user } = useAuth()
  const presentation = getUserPresentation(user)
  const { appendOperation, courses: rows, createCourse, updateCourse, teachers } = useAdminRuntime()
  const [query, setQuery] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState<CourseDraft>(baseCourseDraft)
  const [activeRow, setActiveRow] = useState<CourseAdminRow | null>(null)
  const [confirmingRow, setConfirmingRow] = useState<CourseAdminRow | null>(null)

  const { filteredRows, pagedRows, safePage, setPage } = useAdminPageFilters({
    rows,
    pageSize,
    predicate: (row) =>
      matchesText(row.searchText, query) &&
      matchesSelect(normalizeCourseUniversity(selectedUniversity), row.university) &&
      matchesSelect(selectedStatus, row.status),
    resetDeps: [query, selectedStatus, selectedUniversity],
  })

  const columns: AdminColumn<CourseAdminRow>[] = [
    { key: 'code', header: '课程代码', render: (row) => row.code },
    { key: 'name', header: '课程名称', render: (row) => <RowTitle title={row.name} /> },
    { key: 'university', header: '所属院校', render: (row) => row.university },
    { key: 'credits', header: '学分', render: (row) => `${row.credits}` },
    { key: 'teacher', header: '授课教师', render: (row) => row.teacher },
    { key: 'tutor', header: '助教', render: (row) => row.tutor },
    { key: 'summary', header: '课程描述', render: (row) => <p className="max-w-xs leading-6 text-slate-500">{row.summary}</p> },
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
          deleteLabel="下线"
          deleteDisabled={row.status === '已停用'}
        />
      ),
    },
  ]

  const teacherOptions = useMemo(
    () =>
      teachers.map((teacher) => ({
        value: teacher.name,
        label: `${teacher.name} (${teacher.title})`,
      })),
    [teachers],
  )

  const tutorOptions = useMemo(() => {
    const tutors = new Set<string>()

    teachers.forEach((teacher) => tutors.add(teacher.name))
    rows.forEach((row) => {
      row.tutor
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .forEach((value) => tutors.add(value))
    })

    return [...tutors].map((value) => ({ value, label: value }))
  }, [rows, teachers])

  const selectedTutors = useMemo(
    () =>
      draft.tutor
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    [draft.tutor],
  )

  function createDefaultDraft(university = baseCourseDraft.university) {
    return {
      ...baseCourseDraft,
      university,
      teacher: '',
      tutor: '',
    }
  }

  function resetDrawer() {
    setDraft(createDefaultDraft())
    setActiveRow(null)
    setDrawerOpen(false)
  }

  function openCreateDrawer() {
    setDraft(createDefaultDraft())
    setActiveRow(null)
    setDrawerOpen(true)
  }

  function openEditDrawer(row: CourseAdminRow) {
    setDraft({
      code: row.code,
      name: row.name,
      university: row.university,
      credits: row.credits,
      teacher: row.teacher,
      tutor: row.tutor,
      summary: row.summary,
    })
    setActiveRow(row)
    setDrawerOpen(true)
  }

  function handleSaveCourse() {
    const nextDraft: CourseDraft = {
      ...draft,
      code: draft.code.trim().toUpperCase(),
      name: draft.name.trim(),
      university: draft.university.trim(),
      credits: Number.isFinite(draft.credits) ? Math.max(0, draft.credits) : 0,
      teacher: draft.teacher.trim(),
      tutor: draft.tutor.trim(),
      summary: draft.summary.trim(),
    }

    if (!nextDraft.code || !nextDraft.name || !nextDraft.university) return

    if (activeRow) {
      updateCourse(activeRow.id, (current) => ({
        ...current,
        ...nextDraft,
        searchText: buildCourseSearchText(nextDraft),
      }))
      appendOperation({
        module: '课程管理',
        title: '课程信息已更新',
        description: `已更新课程：${nextDraft.code} ${nextDraft.name}`,
        action: `编辑课程《${nextDraft.code} ${nextDraft.name}》`,
        actor: presentation.name,
      })
    } else {
      createCourse({
        id: `course-${nextDraft.code.toLowerCase()}-${Date.now()}`,
        ...nextDraft,
        status: '已上线',
        statusTone: 'success',
        searchText: buildCourseSearchText(nextDraft),
      })
      appendOperation({
        module: '课程管理',
        title: '课程已创建',
        description: `已创建课程：${nextDraft.code} ${nextDraft.name}`,
        action: `新增课程《${nextDraft.code} ${nextDraft.name}》`,
        actor: presentation.name,
      })
    }

    setPage(1)
    resetDrawer()
  }

  function handleUniversityChange(university: string) {
    setDraft((current) => ({
      ...current,
      university: normalizeCourseUniversity(university),
    }))
  }

  function handleConfirmOffline() {
    if (!confirmingRow) return
    const targetRow = rows.find((row) => row.id === confirmingRow.id)

    if (!targetRow || targetRow.status === '已停用') {
      setConfirmingRow(null)
      return
    }

    updateCourse(confirmingRow.id, (current) => ({
      ...current,
      status: '已停用',
      statusTone: 'danger',
    }))
    appendOperation({
      module: '课程管理',
      title: '课程已下线',
      description: `已下线课程：${confirmingRow.code} ${confirmingRow.name}`,
      action: `下线课程《${confirmingRow.code} ${confirmingRow.name}》`,
      actor: presentation.name,
    })
    setConfirmingRow(null)
  }

  return (
    <>
      <AdminPageFrame
        title="课程列表"
        description="统一维护课程主数据，并作为评课、学员、题库的共享引用源。"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="搜索课程代码或名称..."
        filters={
          <>
            <AdminFilterSelect
              label="院校"
              value={toCourseUniversityOptionValue(selectedUniversity)}
              options={universityOptions}
              onChange={(value) => setSelectedUniversity(normalizeCourseUniversity(value))}
            />
            <AdminFilterSelect label="状态" value={selectedStatus} options={statusOptions} onChange={setSelectedStatus} />
          </>
        }
        primaryActionLabel="新增课程"
        onPrimaryAction={openCreateDrawer}
      >
        <AdminTableCard>
          <AdminPageTable columns={columns} rows={pagedRows} getRowKey={(row) => row.id} />
          <AdminFooterPagination currentPage={safePage} pageSize={pageSize} totalItems={filteredRows.length} onPageChange={setPage} />
        </AdminTableCard>
      </AdminPageFrame>

      <AdminFormDrawer open={drawerOpen} title={activeRow ? '编辑课程' : '新增课程'} onClose={resetDrawer}>
        <AdminField.Input
          label="课程代码"
          value={draft.code}
          placeholder="例如：COMP9021"
          onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
        />
        <AdminField.Input
          label="课程名称"
          value={draft.name}
          placeholder="例如：Principles of Programming"
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <AdminField.Select
          label="所属院校"
          value={toCourseUniversityOptionValue(draft.university)}
          options={[
            { value: '', label: '请选择' },
            ...universityOptions.filter((option) => option.value !== 'all'),
          ]}
          onChange={(event) => handleUniversityChange(event.target.value)}
        />
        <AdminField.Input
          label="学分"
          type="number"
          min={0}
          value={draft.credits}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              credits: Number(event.target.value || 0),
            }))
          }
        />
        <AdminField.Select
          label="授课教师"
          value={draft.teacher}
          options={[
            { value: '', label: '未指定' },
            ...teacherOptions,
          ]}
          onChange={(event) => setDraft((current) => ({ ...current, teacher: event.target.value }))}
        />
        <AdminField.CheckboxGroup
          label="助教"
          values={selectedTutors}
          options={tutorOptions}
          onChange={(values) =>
            setDraft((current) => ({
              ...current,
              tutor: values.join(', '),
            }))
          }
        />
        <AdminField.Textarea
          label="课程描述"
          value={draft.summary}
          placeholder="输入课程简介、教学重点和适合人群。"
          onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
          rows={4}
        />
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
            onClick={handleSaveCourse}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
            disabled={!draft.code.trim() || !draft.name.trim() || !draft.university}
          >
            保存课程
          </button>
        </AdminDrawerFooter>
      </AdminFormDrawer>

      <AdminConfirmModal
        open={Boolean(confirmingRow)}
        title="确认下线课程"
        description={confirmingRow ? `确认将 ${confirmingRow.code} - ${confirmingRow.name} 标记为下线状态吗？` : ''}
        confirmLabel="确认下线"
        onConfirm={handleConfirmOffline}
        onClose={() => setConfirmingRow(null)}
      />
    </>
  )
}
