import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import AdminLayout from '../AdminLayout'
import LogsAdminPage from './logs/LogsAdminPage'
import SemestersAdminPage from './semesters/SemestersAdminPage'
import TagsAdminPage from './tags/TagsAdminPage'
import TeachersAdminPage from './teachers/TeachersAdminPage'
import UniversitiesAdminPage from './universities/UniversitiesAdminPage'
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
  const memoryRouter = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <AuthContext.Provider value={adminAuthState}>
            <Outlet />
          </AuthContext.Provider>
        ),
        children: [
          {
            path: 'admin',
            children: [
              {
                element: <AdminLayout />,
                children: [
                  {
                    path: 'review-management',
                    children: [
                      { path: 'semesters', element: <SemestersAdminPage /> },
                      { path: 'teachers', element: <TeachersAdminPage /> },
                      { path: 'universities', element: <UniversitiesAdminPage /> },
                    ],
                  },
                  {
                    path: 'problem-bank',
                    children: [{ path: 'tags', element: <TagsAdminPage /> }],
                  },
                  {
                    path: 'system-management',
                    children: [{ path: 'logs', element: <LogsAdminPage /> }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  )

  render(<RouterProvider router={memoryRouter} />)

  return {
    navigateTo: async (to: string) => {
      await act(async () => {
        await memoryRouter.navigate(to)
      })
    },
  }
}

describe('Admin entity dialogs', () => {
  it('creates and disables a university through dialogs', async () => {
    const { navigateTo } = renderAdminAt('/admin/review-management/universities')

    fireEvent.click(await screen.findByRole('button', { name: '新增院校' }))
    fireEvent.change(screen.getByLabelText('院校名称'), { target: { value: 'Macquarie' } })
    fireEvent.change(screen.getByLabelText('所在城市'), { target: { value: 'Sydney' } })
    fireEvent.change(screen.getByLabelText('联系邮箱'), { target: { value: 'admin@mq.edu.au' } })
    fireEvent.click(screen.getByRole('button', { name: '保存院校' }))

    const table = await screen.findByRole('table')
    const createdRow = within(table).getByText('Macquarie').closest('tr') as HTMLElement
    expect(within(createdRow).getByText('admin@mq.edu.au')).toBeInTheDocument()
    expect(within(createdRow).getByText('已启用')).toBeInTheDocument()

    fireEvent.click(within(createdRow).getByRole('button', { name: '停用' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认停用' }))

    const updatedTable = await screen.findByRole('table')
    const disabledRow = within(updatedTable).getByText('Macquarie').closest('tr') as HTMLElement
    expect(within(disabledRow).getByText('已停用')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('停用院校《Macquarie》')).toBeInTheDocument()
  })

  it('creates and removes a teacher through dialogs', async () => {
    const { navigateTo } = renderAdminAt('/admin/review-management/teachers')

    fireEvent.click(await screen.findByRole('button', { name: '新增教师' }))
    fireEvent.change(screen.getByLabelText('姓名'), { target: { value: 'Dr. Ruby Stone' } })
    fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'ruby.stone@unsw.edu.au' } })
    fireEvent.change(screen.getByRole('combobox', { name: '所属院校' }), { target: { value: 'UNSW' } })
    fireEvent.change(screen.getByLabelText('职称'), { target: { value: 'Professor' } })
    fireEvent.change(screen.getByLabelText('授课课程'), { target: { value: 'COMP8001 / COMP8002' } })
    fireEvent.click(screen.getByRole('button', { name: '保存教师' }))

    const table = await screen.findByRole('table')
    const createdRow = within(table).getByText('Dr. Ruby Stone').closest('tr') as HTMLElement
    expect(within(createdRow).getByText('Professor')).toBeInTheDocument()

    fireEvent.click(within(createdRow).getByRole('button', { name: '移除' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认移除' }))

    const updatedTable = await screen.findByRole('table')
    expect(within(updatedTable).queryByText('Dr. Ruby Stone')).not.toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('移除教师《Dr. Ruby Stone》')).toBeInTheDocument()
  })

  it('creates and archives a semester through dialogs', async () => {
    const { navigateTo } = renderAdminAt('/admin/review-management/semesters')

    fireEvent.click(await screen.findByRole('button', { name: '新增学期' }))
    fireEvent.change(screen.getByLabelText('学期名称'), { target: { value: '2026 T3' } })
    fireEvent.change(screen.getByLabelText('年份'), { target: { value: '2026' } })
    fireEvent.change(screen.getByLabelText('时间范围'), { target: { value: '2026-09-14 ~ 2026-12-20' } })
    fireEvent.click(screen.getByRole('button', { name: '保存学期' }))

    const table = await screen.findByRole('table')
    const createdRow = within(table).getByText('2026 T3').closest('tr') as HTMLElement
    expect(within(createdRow).getByText('筹备中')).toBeInTheDocument()

    fireEvent.click(within(createdRow).getByRole('button', { name: '归档' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认归档' }))

    const updatedTable = await screen.findByRole('table')
    const archivedRow = within(updatedTable).getByText('2026 T3').closest('tr') as HTMLElement
    expect(within(archivedRow).getByText('已归档')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('归档学期《2026 T3》')).toBeInTheDocument()
  })

  it('creates, edits and offlines a tag through dialogs', async () => {
    const { navigateTo } = renderAdminAt('/admin/problem-bank/tags')

    fireEvent.click(await screen.findByRole('button', { name: '新增标签' }))
    fireEvent.change(screen.getByLabelText('标签名称'), { target: { value: '实战强' } })
    fireEvent.change(screen.getByLabelText('描述'), { target: { value: '强调实践和项目输出的标签。' } })
    fireEvent.click(screen.getByRole('button', { name: '保存标签' }))

    const table = await screen.findByRole('table')
    const createdRow = within(table).getByText('实战强').closest('tr') as HTMLElement
    expect(within(createdRow).getByText('启用中')).toBeInTheDocument()

    fireEvent.click(within(createdRow).getByRole('button', { name: '编辑' }))
    const tagDialog = await screen.findByRole('dialog', { name: '编辑标签' })
    fireEvent.change(within(tagDialog).getByLabelText('描述'), { target: { value: '强调项目实践和案例复盘的标签。' } })
    fireEvent.change(within(tagDialog).getByRole('combobox', { name: '状态' }), { target: { value: '待下线' } })
    fireEvent.click(screen.getByRole('button', { name: '保存标签' }))

    const editedTable = await screen.findByRole('table')
    const editedRow = within(editedTable).getByText('实战强').closest('tr') as HTMLElement
    expect(within(editedRow).getByText('待下线')).toBeInTheDocument()
    expect(within(editedRow).getByText('强调项目实践和案例复盘的标签。')).toBeInTheDocument()

    fireEvent.click(within(editedRow).getByRole('button', { name: '下线' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认下线' }))

    const updatedTable = await screen.findByRole('table')
    const offlineRow = within(updatedTable).getByText('实战强').closest('tr') as HTMLElement
    expect(within(offlineRow).getByText('已下线')).toBeInTheDocument()

    await navigateTo('/admin/system-management/logs')
    expect(await screen.findByText('下线标签《实战强》')).toBeInTheDocument()
  })
})
