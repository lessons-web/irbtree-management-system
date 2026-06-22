import type { PropsWithChildren } from 'react'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AdminRuntimeProvider, useAdminRuntime } from '../context/AdminRuntimeContext'
import { useAdminEntityCollection } from './useAdminEntityCollection'

type HarnessRow = {
  id: string
  title: string
  version: number
}

function EntityCollectionHarness() {
  const { activeRow, rows, replaceRows, setActiveRow, updateEntity } = useAdminEntityCollection<HarnessRow>([
    { id: 'message-1', title: '初始消息', version: 1 },
  ])

  return (
    <div>
      <div data-testid="row-version">{String(rows[0]?.version ?? 0)}</div>
      <div data-testid="active-version">{String(activeRow?.version ?? 0)}</div>
      <button
        type="button"
        onClick={() => setActiveRow({ id: 'message-1', title: '过期快照', version: 10 })}
      >
        设置旧快照
      </button>
      <button
        type="button"
        onClick={() =>
          updateEntity('message-1', (current) => ({
            ...current,
            version: current.version + 1,
          }))
        }
      >
        更新实体
      </button>
      <button type="button" onClick={() => replaceRows([{ id: 'message-2', title: '替换消息', version: 3 }])}>
        替换集合
      </button>
    </div>
  )
}

describe('useAdminEntityCollection', () => {
  it('keeps activeRow aligned with the collection row when updateEntity runs', () => {
    render(<EntityCollectionHarness />)

    fireEvent.click(screen.getByRole('button', { name: '设置旧快照' }))
    expect(screen.getByTestId('active-version')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: '更新实体' }))

    expect(screen.getByTestId('row-version')).toHaveTextContent('2')
    expect(screen.getByTestId('active-version')).toHaveTextContent('2')
  })

  it('clears activeRow when replaceRows removes the active entity', () => {
    render(<EntityCollectionHarness />)

    fireEvent.click(screen.getByRole('button', { name: '设置旧快照' }))
    expect(screen.getByTestId('active-version')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: '替换集合' }))

    expect(screen.getByTestId('row-version')).toHaveTextContent('3')
    expect(screen.getByTestId('active-version')).toHaveTextContent('0')
  })

  it('stores shared courses and student/problem-bank entities in admin runtime', () => {
    const wrapper = ({ children }: PropsWithChildren) => <AdminRuntimeProvider>{children}</AdminRuntimeProvider>

    const { result } = renderHook(() => useAdminRuntime(), { wrapper })

    expect(result.current.courses.length).toBeGreaterThan(0)
    expect(result.current.students.length).toBeGreaterThan(0)
    expect(result.current.enrollments.length).toBeGreaterThan(0)
    expect(result.current.payments.length).toBeGreaterThan(0)
    expect(result.current.studentNotes.length).toBeGreaterThan(0)
    expect(result.current.classGroups.length).toBeGreaterThan(0)
    expect(result.current.problems.length).toBeGreaterThan(0)
    expect(result.current.problemTags.length).toBeGreaterThan(0)
    expect(result.current.examPapers.length).toBeGreaterThan(0)
    expect(result.current.examProblems.length).toBeGreaterThan(0)
    expect(result.current.problemAssets.length).toBeGreaterThan(0)
  })

  it('derives enrolledCourseCount from enrollments in admin runtime', () => {
    const wrapper = ({ children }: PropsWithChildren) => <AdminRuntimeProvider>{children}</AdminRuntimeProvider>

    const { result } = renderHook(() => useAdminRuntime(), { wrapper })

    expect(result.current.students.find((student) => student.id === 'student-alex')?.enrolledCourseCount).toBe(2)
    expect(result.current.students.find((student) => student.id === 'student-mia')?.enrolledCourseCount).toBe(1)

    act(() => {
      result.current.createEnrollment({
        id: 'enrollment-mia-comp9024',
        studentId: 'student-mia',
        courseId: 'course-comp9024',
        validFrom: '2026-06-01',
        validUntil: '2026-12-01',
        status: 'active',
        source: '补录开通',
      })
    })

    expect(result.current.students.find((student) => student.id === 'student-mia')?.enrolledCourseCount).toBe(2)
  })

  it('keeps examProblems linked to existing exam papers and problems', () => {
    const wrapper = ({ children }: PropsWithChildren) => <AdminRuntimeProvider>{children}</AdminRuntimeProvider>

    const { result } = renderHook(() => useAdminRuntime(), { wrapper })

    result.current.examProblems.forEach((examProblem) => {
      const examPaper = result.current.examPapers.find((paper) => paper.id === examProblem.examId)
      const problem = result.current.problems.find((item) => item.id === examProblem.problemId)

      expect(examPaper).toBeDefined()
      expect(problem).toBeDefined()
      expect(examPaper?.courseId).toBe(problem?.courseId)
    })
  })

  it('updates shared course collection through admin runtime actions', () => {
    const wrapper = ({ children }: PropsWithChildren) => <AdminRuntimeProvider>{children}</AdminRuntimeProvider>

    const { result } = renderHook(() => useAdminRuntime(), { wrapper })
    const originalCount = result.current.courses.length

    act(() => {
      result.current.createCourse({
        id: 'course-test-runtime',
        code: 'TEST1001',
        name: 'Runtime Course',
        university: 'UNSW',
        credits: 6,
        teacher: 'Dr. James Smith',
        tutor: 'Alice Chen',
        summary: '用于验证后台课程运行时共享主数据。',
        status: '已上线',
        statusTone: 'success',
        searchText: 'TEST1001 Runtime Course UNSW Dr. James Smith Alice Chen 用于验证后台课程运行时共享主数据。',
      })
    })

    expect(result.current.courses).toHaveLength(originalCount + 1)
    expect(result.current.courses[0]?.code).toBe('TEST1001')
  })
})
