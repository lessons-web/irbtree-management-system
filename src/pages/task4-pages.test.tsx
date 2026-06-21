import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../features/auth/AuthContext'
import { ReviewProvider } from '../features/review/reviewProvider'
import { useReview } from '../features/review/useReview'
import CoursesPage from './courses/CoursesPage'
import HomePage from './home/HomePage'

function renderCoursesPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <ReviewProvider>
          <CoursesPage />
        </ReviewProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

function ReviewMutationProbe() {
  const { addReview } = useReview()

  return (
    <button
      type="button"
      onClick={() =>
        addReview('uc_9021', {
          user: 'tester',
          year: '2026',
          term: 'T2',
          tags: ['干货满满'],
          content: '新增一条足够长的首页联动评价，用于验证共享 review state。',
          ratings: { difficulty: 4, homework: 4, grading: 4, harvest: 4 },
        })
      }
    >
      mutate-home-course
    </button>
  )
}

describe('task4 pages', () => {
  it('renders the migrated home page from shared review state without extra blocks', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ReviewProvider>
            <HomePage />
            <ReviewMutationProbe />
          </ReviewProvider>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /拒绝挂科/i })).toBeInTheDocument()
    expect(screen.getByText('2024 选课季必备')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('搜索课程代码 (e.g. COMP9021) 或课程名...')).toBeInTheDocument()
    expect(screen.getByText('已收录课程')).toBeInTheDocument()
    expect(screen.getByText('真实评价')).toBeInTheDocument()
    expect(screen.getByText('注册用户')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '热门课程' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /查看全部/i })).toHaveAttribute('href', '/courses')
    expect(screen.queryByRole('link', { name: '个人中心' })).not.toBeInTheDocument()
    const comp9021Card = screen.getByRole('link', { name: /COMP9021/i })
    expect(comp9021Card).toBeInTheDocument()
    expect(within(comp9021Card).getByText('2 条评价')).toBeInTheDocument()
    expect(screen.queryByText(/任务2\/3 mock 数据/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '学习摘要' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '报名咨询' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'mutate-home-course' }))

    expect(within(comp9021Card).getByText('3 条评价')).toBeInTheDocument()
  })

  it('renders migrated courses page controls and resets to defaults', () => {
    renderCoursesPage('/courses?query=COMP9311&pageSize=10&school=sch_unsw')

    expect(screen.getByText('Database Systems')).toBeInTheDocument()
    expect(screen.queryByText('Principles of Programming')).not.toBeInTheDocument()
    expect(screen.getByLabelText('搜索课程')).toHaveValue('COMP9311')
    expect(screen.getByLabelText('学校')).toHaveValue('sch_unsw')
    expect(screen.getByLabelText('排序方式')).toHaveValue('rating_desc')
    expect(screen.getByText(/显示第/)).toBeInTheDocument()
    expect(screen.queryByText(/保留与旧版页面一致/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '重置筛选' }))

    expect(screen.getByLabelText('搜索课程')).toHaveValue('')
    expect(screen.getByLabelText('学校')).toHaveValue('all')
    expect(screen.getByText('Principles of Programming')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5 条/页')).toBeInTheDocument()
  })
})
