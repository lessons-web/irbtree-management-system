import type { ReactNode } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { UserOverlayProvider } from '../components/user/UserOverlayContext'
import { UserOverlayContext, type UserOverlayContextValue } from '../components/user/userOverlayShared'
import { courseCatalog } from '../data/courses'
import { savedCoursePlans } from '../data/profile'
import { AuthContext, type AuthState } from '../features/auth/state'
import { ReviewProvider } from '../features/review/reviewProvider'
import { resetSavedCoursePlans } from '../lib/coursePlans'
import CourseDetailPage from './course-detail/CourseDetailPage'
import LearnIndexPage from './learn/LearnIndexPage'
import ProfilePage from './profile/ProfilePage'
import RecommendationPage from './recommendation/RecommendationPage'

const authValue: AuthState = {
  user: {
    id: 'u_mock',
    email: 'student@uni.edu.au',
    roles: ['student'],
  },
  loginAs: () => undefined,
  logout: () => undefined,
}

function renderWithProviders(ui: ReactNode, initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthContext.Provider value={authValue}>
        <ReviewProvider>
          <UserOverlayProvider>{ui}</UserOverlayProvider>
        </ReviewProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

function renderWithCustomOverlay(ui: ReactNode, overlayValue: UserOverlayContextValue, initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthContext.Provider value={authValue}>
        <ReviewProvider>
          <UserOverlayContext.Provider value={overlayValue}>{ui}</UserOverlayContext.Provider>
        </ReviewProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('task5 user pages', () => {
  beforeEach(() => {
    resetSavedCoursePlans()
  })

  it('renders the migrated course detail page with task2 learning data and review overlay', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/course/:code" element={<CourseDetailPage />} />
      </Routes>,
      '/course/COMP9021',
    )

    expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
    expect(screen.getByText('课程简介')).toBeInTheDocument()
    expect(screen.getByText('综合评分')).toBeInTheDocument()
    expect(screen.getByText('同学评价')).toBeInTheDocument()
    expect(screen.getByText('关联学习课')).toBeInTheDocument()
    expect(screen.getByText('红黑树 COMP9021 学习课')).toBeInTheDocument()
    expect(screen.getByText('已报名学习')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: '写评价' })[0])

    expect(await screen.findByRole('dialog', { name: '写评价' })).toBeInTheDocument()
  })

  it('removes prototype copy from course detail and profile surfaces', async () => {
    const detailView = renderWithProviders(
      <Routes>
        <Route path="/course/:code" element={<CourseDetailPage />} />
      </Routes>,
      '/course/COMP9021',
    )

    expect(await screen.findByRole('heading', { name: /COMP9021 Principles of Programming/i })).toBeInTheDocument()
    expect(screen.queryByText(/基于任务 2 的课程映射数据/i)).not.toBeInTheDocument()

    detailView.unmount()

    renderWithProviders(<ProfilePage />, '/profile')
    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
    expect(screen.queryByText(/mock 计划数据/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/后续会跟课程详情页评论区保持联动/i)).not.toBeInTheDocument()
  })

  it('renders the migrated profile page with tabs, saved plans and completed overlay entry', async () => {
    renderWithProviders(<ProfilePage />)

    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
    expect(screen.getByText('UNSW 认证学生')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '我点赞的课程' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '我收藏的课程' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '我已修的课程' })).toBeInTheDocument()
    expect(screen.getByText('2026 T1 求职冲刺计划')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '我已修的课程' }))
    fireEvent.click(screen.getByRole('button', { name: '添加已修课程' }))

    expect(await screen.findByRole('dialog', { name: '我已修的课程' })).toBeInTheDocument()
  })

  it('renders the migrated recommendation page and excludes completed courses from generated results', async () => {
    renderWithProviders(<RecommendationPage />)

    expect(await screen.findByRole('heading', { name: '选课推荐' })).toBeInTheDocument()
    expect(screen.getByText('已修课程概览')).toBeInTheDocument()
    expect(screen.getByText(savedCoursePlans[0].title)).toBeInTheDocument()
    expect(screen.getByLabelText('目标学年')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '下一步' }))

    expect(screen.getByRole('tab', { name: '规则式选课' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'AI 大模型选课' })).toBeInTheDocument()
    expect(screen.getByText('COMP1511')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /高分好评/ }))
    fireEvent.click(screen.getByRole('button', { name: '生成推荐清单' }))

    const resultSection = await screen.findByLabelText('推荐课程清单')
    expect(within(resultSection).getByText('COMP9021')).toBeInTheDocument()
    expect(within(resultSection).queryByText('COMP1511')).not.toBeInTheDocument()
  })

  it('supports the docs-like three-step confirmation flow and saves a generated plan into shared plan data', async () => {
    const router = createMemoryRouter(
      [
        { path: '/recommendation', element: <RecommendationPage /> },
        { path: '/profile', element: <ProfilePage /> },
      ],
      {
        initialEntries: ['/recommendation'],
      },
    )

    render(
      <AuthContext.Provider value={authValue}>
        <ReviewProvider>
          <UserOverlayProvider>
            <RouterProvider router={router} />
          </UserOverlayProvider>
        </ReviewProvider>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole('heading', { name: '选课推荐' })).toBeInTheDocument()
    expect(screen.getByText('基础设置')).toBeInTheDocument()
    expect(screen.getByText('维度选择')).toBeInTheDocument()
    expect(screen.getByText('分组配置')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '选择排课学期' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    expect(await screen.findByRole('heading', { name: '生成推荐课程' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /高分好评/ }))
    fireEvent.click(screen.getByRole('button', { name: '生成推荐清单' }))

    const resultSection = await screen.findByLabelText('推荐课程清单')
    expect(within(resultSection).getByText('COMP9021')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '确认选课，进入下一步' }))

    expect(await screen.findByRole('heading', { name: '选课确认与保存' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '保存并生成计划' }))

    expect(await screen.findAllByText('2026 T1 推荐计划')).toHaveLength(2)
    expect(screen.getAllByText(/已保存/).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: '去个人中心维护已修课程' }))

    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
    expect(screen.getByText('2026 T1 推荐计划')).toBeInTheDocument()
  })

  it('navigates from recommendation to the completed tab in profile instead of reopening the overlay', async () => {
    const router = createMemoryRouter(
      [
        { path: '/recommendation', element: <RecommendationPage /> },
        { path: '/profile', element: <ProfilePage /> },
      ],
      {
        initialEntries: ['/recommendation'],
      },
    )

    render(
      <AuthContext.Provider value={authValue}>
        <ReviewProvider>
          <UserOverlayProvider>
            <RouterProvider router={router} />
          </UserOverlayProvider>
        </ReviewProvider>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole('heading', { name: '选课推荐' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '去个人中心维护已修课程' }))

    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '已修课程管理' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '我已修的课程' })).not.toBeInTheDocument()
  })

  it('renders empty recommendation state when all courses are already completed', async () => {
    const completedCourses = courseCatalog.map((course) => ({
      universityCourseId: course.id,
      code: course.code,
      year: '2026',
      term: 'T1' as const,
    }))

    renderWithCustomOverlay(
      <RecommendationPage />,
      {
        completedCourses,
        openLogin: () => undefined,
        openReview: () => true,
        openCompleted: () => true,
        closeCompleted: () => undefined,
        setCompletedCourses: () => undefined,
      },
    )

    expect(await screen.findByRole('heading', { name: '选课推荐' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    fireEvent.click(screen.getByRole('button', { name: /高分好评/ }))
    fireEvent.click(screen.getByRole('button', { name: '生成推荐清单' }))

    expect(await screen.findByText('暂无可推荐课程')).toBeInTheDocument()
    expect(screen.queryByLabelText('推荐课程清单')).not.toBeInTheDocument()
    expect(screen.queryByText(/默认 AI mock 策略/i)).not.toBeInTheDocument()
  })

  it('points the learn page course review entry to the current courses route instead of the old review shell', () => {
    renderWithProviders(<LearnIndexPage />, '/learn')

    expect(screen.getByRole('link', { name: '查看评课详情' })).toHaveAttribute('href', '/courses')
  })
})
