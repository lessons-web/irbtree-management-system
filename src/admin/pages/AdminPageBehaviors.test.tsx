import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Outlet, RouterProvider, createMemoryRouter, type RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'
import { router } from '../../app/router'
import { AuthContext, type AuthState } from '../../features/auth/state'

const adminAuthState: AuthState = {
  user: {
    id: 'admin-user',
    email: 'admin@irbtree.com',
    name: 'Admin User',
    roles: ['admin'],
    canAccessAdmin: true,
    avatarText: 'AU',
  },
  loginAs: () => {},
  logout: () => {},
}

function renderAdminAt(initialEntry: string) {
  const wrapRootWithAdminAuth = (routes: RouteObject[]): RouteObject[] =>
    routes.map((route, index) => {
      const clonedRoute: RouteObject = {
        ...route,
        children: route.children ? wrapRootWithAdminAuth(route.children) : undefined,
      }

      if (index !== 0 || route.path !== '/') {
        return clonedRoute
      }

      return {
        ...clonedRoute,
        element: (
          <AuthContext.Provider value={adminAuthState}>
            <Outlet />
          </AuthContext.Provider>
        ),
      }
    })

  const memoryRouter = createMemoryRouter(wrapRootWithAdminAuth(router.routes), { initialEntries: [initialEntry] })

  render(<RouterProvider router={memoryRouter} />)

  return {
    navigateTo: async (to: string) => {
      await act(async () => {
        await memoryRouter.navigate(to)
      })
    },
  }
}

describe('Admin page behaviors', () => {
  it('keeps review and system pages reachable under grouped admin routes', async () => {
    const { navigateTo } = renderAdminAt('/admin/review-management/reviews')

    expect(await screen.findByRole('heading', { name: '评价管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '系统管理' })).toBeInTheDocument()

    await navigateTo('/admin/system-management/users')
    expect(await screen.findByRole('heading', { name: '用户管理' })).toBeInTheDocument()
  })

  it('writes a runtime notification and runtime log after an admin operation', async () => {
    const { navigateTo } = renderAdminAt('/admin/system-management/messages')

    fireEvent.click(await screen.findByRole('button', { name: '新建消息' }))
    fireEvent.change(screen.getByLabelText('标题'), { target: { value: '测试消息' } })
    fireEvent.click(screen.getByRole('button', { name: '保存消息' }))

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已创建消息：测试消息')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('创建消息《测试消息》')).toBeInTheDocument()
  })

  it('keeps a created message after navigating to logs and back to messages', async () => {
    const { navigateTo } = renderAdminAt('/admin/system-management/messages')

    fireEvent.click(await screen.findByRole('button', { name: '新建消息' }))
    fireEvent.change(screen.getByLabelText('标题'), { target: { value: '往返保留消息' } })
    fireEvent.click(screen.getByRole('button', { name: '保存消息' }))

    expect(await screen.findByText('往返保留消息')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('创建消息《往返保留消息》')).toBeInTheDocument()

    await navigateTo('/admin/system-management/messages')
    expect(await screen.findByText('往返保留消息')).toBeInTheDocument()
  })

  it('creates a course and shows it in the courses table', async () => {
    renderAdminAt('/admin/course-center/courses')

    fireEvent.click(await screen.findByRole('button', { name: '新增课程' }))
    fireEvent.change(screen.getByRole('combobox', { name: '所属院校' }), { target: { value: 'UNSW' } })
    fireEvent.change(screen.getByLabelText('课程代码'), { target: { value: 'COMP9999' } })
    fireEvent.change(screen.getByLabelText('课程名称'), { target: { value: 'Testing Systems' } })
    fireEvent.click(screen.getByRole('button', { name: '保存课程' }))

    const courseTable = await screen.findByRole('table')
    const courseCode = await within(courseTable).findByText('COMP9999')
    const createdRow = courseCode.closest('tr')

    expect(createdRow).not.toBeNull()
    expect(within(createdRow as HTMLElement).getByText('Testing Systems')).toBeInTheDocument()
    expect(within(createdRow as HTMLElement).getByText('已上线')).toBeInTheDocument()
  })

  it('renders separate course code and course name columns', async () => {
    renderAdminAt('/admin/course-center/courses')

    const courseTable = await screen.findByRole('table')
    expect(within(courseTable).getByRole('columnheader', { name: '课程代码' })).toBeInTheDocument()
    expect(within(courseTable).getByRole('columnheader', { name: '课程名称' })).toBeInTheDocument()
  })

  it('shows the course page title only in the header without duplicate page copy in the content area', () => {
    renderAdminAt('/admin/course-center/courses')

    expect(screen.getAllByRole('heading', { name: '课程列表' })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: '课程列表' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: '课程列表' })).not.toBeInTheDocument()
    expect(screen.queryByText('统一维护课程主数据，并作为评课、学员、题库的共享引用源。')).not.toBeInTheDocument()
  })

  it('shows 18 courses with 11 total table rows on the first page and 9 total rows after switching to the second page', async () => {
    renderAdminAt('/admin/course-center/courses')

    const firstPageTable = await screen.findByRole('table')
    expect(within(firstPageTable).getAllByRole('row')).toHaveLength(11)
    expect(screen.getByRole('button', { name: '第 2 页' })).toBeInTheDocument()
    expect(screen.getByText('共 18 条数据')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '第 2 页' }))

    await waitFor(() => {
      expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(9)
    })
  })

  it('uses choice-based fields in the course drawer', async () => {
    renderAdminAt('/admin/course-center/courses')

    fireEvent.click(await screen.findByRole('button', { name: '新增课程' }))

    const universitySelect = screen.getByRole('combobox', { name: '所属院校' })
    const teacherSelect = screen.getByRole('combobox', { name: '授课教师' }) as HTMLSelectElement
    const tutorAlice = screen.getByRole('checkbox', { name: /Alice Chen/ }) as HTMLInputElement
    const tutorNina = screen.getByRole('checkbox', { name: /Nina Hu/ }) as HTMLInputElement

    expect(universitySelect).toBeInTheDocument()
    expect(teacherSelect.value).toBe('')
    expect(screen.getByRole('option', { name: /Dr\. Sarah Davis/ })).toBeInTheDocument()
    expect(tutorAlice.checked).toBe(false)
    expect(tutorNina).toBeInTheDocument()
    expect(Array.from((universitySelect as HTMLSelectElement).options).some((option) => option.value === 'UQ' && option.text === 'UQ')).toBe(true)
    expect(Array.from((universitySelect as HTMLSelectElement).options).some((option) => option.value === 'Melb' && option.text === 'Melbourne')).toBe(true)

    fireEvent.change(universitySelect, { target: { value: 'Melb' } })

    expect((screen.getByRole('combobox', { name: '授课教师' }) as HTMLSelectElement).value).toBe('')
    expect((screen.getByRole('checkbox', { name: /Alice Chen/ }) as HTMLInputElement).checked).toBe(false)
  })

  it('requires selecting a university before creating a course', async () => {
    renderAdminAt('/admin/course-center/courses')

    fireEvent.click(await screen.findByRole('button', { name: '新增课程' }))
    fireEvent.change(screen.getByLabelText('课程代码'), { target: { value: 'COMP7777' } })
    fireEvent.change(screen.getByLabelText('课程名称'), { target: { value: 'Validation Systems' } })
    fireEvent.click(screen.getByRole('button', { name: '保存课程' }))

    const courseTable = await screen.findByRole('table')
    expect(within(courseTable).queryByText('COMP7777')).not.toBeInTheDocument()
  })

  it('edits a course and writes a runtime notification and log', async () => {
    const { navigateTo } = renderAdminAt('/admin/course-center/courses')

    fireEvent.click((await screen.findAllByRole('button', { name: '编辑' }))[0])
    fireEvent.change(screen.getByLabelText('课程名称'), { target: { value: 'Principles of Programming Studio' } })
    fireEvent.click(screen.getByRole('button', { name: '保存课程' }))

    const courseTable = await screen.findByRole('table')
    expect(within(courseTable).getByText('Principles of Programming Studio')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已更新课程：COMP9021 Principles of Programming Studio')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('编辑课程《COMP9021 Principles of Programming Studio》')).toBeInTheDocument()
  })

  it('offlines a course and writes a runtime notification and log', async () => {
    const { navigateTo } = renderAdminAt('/admin/course-center/courses')

    const courseTable = await screen.findByRole('table')
    const courseCode = within(courseTable).getByText('COMP9021')
    const targetRow = courseCode.closest('tr') as HTMLElement

    expect(within(targetRow).getByText('已上线')).toBeInTheDocument()

    fireEvent.click((await screen.findAllByRole('button', { name: '下线' }))[0])
    fireEvent.click(await screen.findByRole('button', { name: '确认下线' }))

    const updatedCourseTable = await screen.findByRole('table')
    const updatedCourseCode = within(updatedCourseTable).getByText('COMP9021')
    const updatedRow = updatedCourseCode.closest('tr') as HTMLElement
    expect(within(updatedRow).getByText('已停用')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已下线课程：COMP9021 Principles of Programming')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('下线课程《COMP9021 Principles of Programming》')).toBeInTheDocument()
  })

  it('does not append duplicate notifications or logs when offlining an already disabled course', async () => {
    const { navigateTo } = renderAdminAt('/admin/course-center/courses')

    const courseTable = await screen.findByRole('table')
    const targetRow = within(courseTable).getByText('COMP9021').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '下线' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认下线' }))

    const disabledTable = await screen.findByRole('table')
    const disabledRow = within(disabledTable).getByText('COMP9021').closest('tr') as HTMLElement
    const offlineButton = within(disabledRow).getByRole('button', { name: '下线' })

    expect(within(disabledRow).getByText('已停用')).toBeInTheDocument()
    expect(offlineButton).toBeDisabled()

    fireEvent.click(offlineButton)
    expect(screen.queryByRole('button', { name: '确认下线' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findAllByText('已下线课程：COMP9021 Principles of Programming')).toHaveLength(1)

    await navigateTo('/admin/system-management/logs')
    expect(screen.getAllByText('下线课程《COMP9021 Principles of Programming》')).toHaveLength(1)
  })

  it('updates the moderation badge after approving a review', async () => {
    renderAdminAt('/admin/review-management/reviews')

    const reviewTable = await screen.findByRole('table')
    const authorCell = within(reviewTable).getByText('Alex Student')
    const targetRow = authorCell.closest('tr') as HTMLElement

    expect(within(targetRow).getByText('待复核')).toBeInTheDocument()

    fireEvent.click(within(targetRow).getByRole('button', { name: '查看' }))
    fireEvent.click(await screen.findByRole('button', { name: '通过评价' }))

    const updatedTable = await screen.findByRole('table')
    const updatedRow = within(updatedTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(updatedRow).getByText('已通过')).toBeInTheDocument()
  })

  it('shows the four review rating dimensions in the detail drawer', async () => {
    renderAdminAt('/admin/review-management/reviews')

    const reviewTable = await screen.findByRole('table')
    const targetRow = within(reviewTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '查看' }))

    expect(await screen.findByText('课程难度')).toBeInTheDocument()
    expect(screen.getByText('作业多少')).toBeInTheDocument()
    expect(screen.getByText('给分好坏')).toBeInTheDocument()
    expect(screen.getByText('收获大小')).toBeInTheDocument()
    expect(screen.getByText('4.6')).toBeInTheDocument()
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText('4.1')).toBeInTheDocument()
    expect(screen.getByText('5.0')).toBeInTheDocument()
  })

  it('rejects a review through a confirmation step and writes notification and log', async () => {
    const { navigateTo } = renderAdminAt('/admin/review-management/reviews')

    const reviewTable = await screen.findByRole('table')
    const targetRow = within(reviewTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '审核' }))
    fireEvent.change(await screen.findByLabelText('驳回原因'), { target: { value: '存在明显情绪化表达' } })
    fireEvent.click(screen.getByRole('button', { name: '驳回评价' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认驳回' }))

    const updatedTable = await screen.findByRole('table')
    const updatedRow = within(updatedTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(updatedRow).getByText('已驳回')).toBeInTheDocument()
    expect(within(updatedRow).getByRole('button', { name: '查看记录' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已驳回 Alex Student 在 COMP9021 下提交的评价')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('驳回评价《COMP9021 Alex Student》')).toBeInTheDocument()
  })

  it('bulk approves pending reviews through a confirmation step and writes notification and log', async () => {
    const { navigateTo } = renderAdminAt('/admin/review-management/reviews')

    fireEvent.click(await screen.findByRole('button', { name: '批量治理' }))
    fireEvent.click(screen.getByRole('button', { name: '批量通过待复核' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认批量通过' }))

    const reviewTable = await screen.findByRole('table')
    const updatedRow = within(reviewTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(updatedRow).getByText('已通过')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已批量通过 1 条待复核评价')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('批量通过 1 条评价')).toBeInTheDocument()
  })

  it('bulk rejects high risk reviews through a confirmation step and writes notification and log', async () => {
    const { navigateTo } = renderAdminAt('/admin/review-management/reviews')

    fireEvent.click(await screen.findByRole('button', { name: '批量治理' }))
    fireEvent.change(screen.getByLabelText('批量驳回原因'), { target: { value: '命中高风险词，需人工复核后再发布' } })
    fireEvent.click(screen.getByRole('button', { name: '批量驳回高风险' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认批量驳回' }))

    const reviewTable = await screen.findByRole('table')
    const updatedRow = within(reviewTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(updatedRow).getByText('已驳回')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已批量驳回 1 条高风险评价')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('批量驳回 1 条高风险评价')).toBeInTheDocument()
  })

  it('writes a runtime notification and log after updating a user role', async () => {
    const { navigateTo } = renderAdminAt('/admin/system-management/users')

    const userTable = await screen.findByRole('table')
    const targetRow = within(userTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '编辑' }))
    fireEvent.click(await screen.findByLabelText('管理员'))
    fireEvent.click(screen.getByRole('button', { name: '保存账号' }))

    const updatedTable = await screen.findByRole('table')
    const updatedRow = within(updatedTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(updatedRow).getByText('管理员')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已更新账号：Alex Student，角色调整为管理员')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('编辑账号《Alex Student》：角色调整为管理员')).toBeInTheDocument()
  })

  it('keeps updated user state after navigating away and back to users', async () => {
    const { navigateTo } = renderAdminAt('/admin/system-management/users')

    const userTable = await screen.findByRole('table')
    const targetRow = within(userTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '编辑' }))
    fireEvent.click(await screen.findByLabelText('管理员'))
    fireEvent.click(screen.getByRole('button', { name: '保存账号' }))

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('编辑账号《Alex Student》：角色调整为管理员')).toBeInTheDocument()

    await navigateTo('/admin/system-management/users')
    const returnedTable = await screen.findByRole('table')
    const returnedRow = within(returnedTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(returnedRow).getByText('管理员')).toBeInTheDocument()
  })

  it('prevents the current admin from changing their own role or disabling themselves', async () => {
    renderAdminAt('/admin/system-management/users')

    const userTable = await screen.findByRole('table')
    const selfRow = within(userTable).getByText('Admin User').closest('tr') as HTMLElement

    expect(within(selfRow).getByRole('button', { name: '停用' })).toBeDisabled()

    fireEvent.click(within(selfRow).getByRole('button', { name: '编辑' }))

    expect(await screen.findByText('当前管理员不能修改自己的角色或停用自己。')).toBeInTheDocument()
    expect(screen.getByLabelText('普通用户')).toBeDisabled()
    expect(screen.getByLabelText('运营')).toBeDisabled()
    expect(screen.getByLabelText('管理员')).toBeDisabled()
    expect(screen.getByRole('combobox', { name: '状态' })).toBeDisabled()
  })

  it('does not treat another account with the admin email as self when ids differ', async () => {
    renderAdminAt('/admin/system-management/users')

    const userTable = await screen.findByRole('table')
    const alexRow = within(userTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(alexRow).getByRole('button', { name: '编辑' }))
    fireEvent.change(await screen.findByLabelText('邮箱'), { target: { value: 'admin@irbtree.com' } })
    fireEvent.click(screen.getByRole('button', { name: '保存账号' }))

    const updatedTable = await screen.findByRole('table')
    const updatedAlexRow = within(updatedTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(updatedAlexRow).getByText('admin@irbtree.com')).toBeInTheDocument()
    expect(within(updatedAlexRow).getByRole('button', { name: '停用' })).not.toBeDisabled()

    fireEvent.click(within(updatedAlexRow).getByRole('button', { name: '编辑' }))
    expect(screen.queryByText('当前管理员不能修改自己的角色或停用自己。')).not.toBeInTheDocument()
    expect((await screen.findByLabelText('普通用户')) as HTMLInputElement).not.toBeDisabled()
    expect(screen.getByRole('combobox', { name: '状态' })).not.toBeDisabled()
  })

  it('writes edit notification and log copy based on the actual changed fields', async () => {
    const { navigateTo } = renderAdminAt('/admin/system-management/users')

    const userTable = await screen.findByRole('table')
    const targetRow = within(userTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '编辑' }))
    fireEvent.change(await screen.findByLabelText('昵称'), { target: { value: 'Alex Prime' } })
    fireEvent.click(screen.getByRole('button', { name: '保存账号' }))

    const updatedTable = await screen.findByRole('table')
    const updatedRow = within(updatedTable).getByText('Alex Prime').closest('tr') as HTMLElement
    expect(updatedRow).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已更新账号：Alex Prime，更新项：昵称')).toBeInTheDocument()
    expect(screen.queryByText(/角色调整/)).not.toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('编辑账号《Alex Student》：更新昵称')).toBeInTheDocument()
  })

  it('does not append duplicate notifications or logs when disabling an already disabled account', async () => {
    const { navigateTo } = renderAdminAt('/admin/system-management/users')

    const userTable = await screen.findByRole('table')
    const targetRow = within(userTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '停用' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认停用' }))

    const disabledTable = await screen.findByRole('table')
    const disabledRow = within(disabledTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(disabledRow).getByText('已停用')).toBeInTheDocument()
    expect(within(disabledRow).getByRole('button', { name: '停用' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findAllByText('已停用账号：Alex Student')).toHaveLength(1)

    await navigateTo('/admin/system-management/logs')
    expect(screen.getAllByText('停用账号《Alex Student》')).toHaveLength(1)
  })

  it('updates a user role and disables a user from the user drawer', async () => {
    const { navigateTo } = renderAdminAt('/admin/system-management/users')

    const userTable = await screen.findByRole('table')
    const targetRow = within(userTable).getByText('Alex Student').closest('tr') as HTMLElement

    fireEvent.click(within(targetRow).getByRole('button', { name: '编辑' }))
    fireEvent.click(await screen.findByLabelText('管理员'))
    fireEvent.click(screen.getByRole('button', { name: '保存账号' }))

    const updatedTable = await screen.findByRole('table')
    const updatedRow = within(updatedTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(updatedRow).getByText('管理员')).toBeInTheDocument()

    fireEvent.click(within(updatedRow).getByRole('button', { name: '停用' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认停用' }))

    const disabledTable = await screen.findByRole('table')
    const disabledRow = within(disabledTable).getByText('Alex Student').closest('tr') as HTMLElement
    expect(within(disabledRow).getByText('已停用')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(await screen.findByText('已停用账号：Alex Student')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('停用账号《Alex Student》')).toBeInTheDocument()
  })
})
