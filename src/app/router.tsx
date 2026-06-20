import { createBrowserRouter, Outlet } from 'react-router'
import AdminLayout from '../admin/AdminLayout'
import DashboardPage from '../admin/pages/DashboardPage'
import ContentPlaceholderPage from '../admin/pages/content/ContentPlaceholderPage'
import ReviewsPlaceholderPage from '../admin/pages/reviews/ReviewsPlaceholderPage'
import StudentsPlaceholderPage from '../admin/pages/students/StudentsPlaceholderPage'
import SystemPlaceholderPage from '../admin/pages/system/SystemPlaceholderPage'
import CourseDetailAlias from './CourseDetailAlias'
import PathAlias from './PathAlias'
import { AuthProvider } from '../features/auth/AuthContext'
import { RequireAuth, RequireRole } from '../features/auth/guards'
import { ReviewProvider } from '../features/review/reviewProvider'
import UserLayout from '../layouts/UserLayout'
import AuthPage from '../pages/auth/AuthPage'
import CourseDetailPage from '../pages/course-detail/CourseDetailPage'
import CoursesPage from '../pages/courses/CoursesPage'
import HomePage from '../pages/home/HomePage'
import LearnIndexPage from '../pages/learn/LearnIndexPage'
import ProfilePage from '../pages/profile/ProfilePage'
import RecommendationPage from '../pages/recommendation/RecommendationPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: (
          <ReviewProvider>
            <UserLayout />
          </ReviewProvider>
        ),
        children: [
          { index: true, Component: HomePage },
          { path: 'auth', Component: AuthPage },
          { path: 'review', element: <PathAlias to="/courses" /> },
          { path: 'review/:code', Component: CourseDetailAlias },
          { path: 'me', element: <PathAlias to="/profile" /> },
          { path: 'recommend', element: <PathAlias to="/recommendation" /> },
          { path: 'courses', Component: CoursesPage },
          { path: 'course/:code', Component: CourseDetailPage },
          {
            element: <RequireAuth />,
            children: [
              {
                path: 'recommendation',
                Component: RecommendationPage,
              },
              { path: 'profile', Component: ProfilePage },
              { path: 'learn', Component: LearnIndexPage },
            ],
          },
        ],
      },
      {
        path: 'admin',
        element: <RequireRole anyOf={['admin', 'teacher']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, Component: DashboardPage },
              { path: 'reviews', Component: ReviewsPlaceholderPage },
              { path: 'students', Component: StudentsPlaceholderPage },
              { path: 'content', Component: ContentPlaceholderPage },
              { path: 'system', Component: SystemPlaceholderPage },
            ],
          },
        ],
      },
    ],
  },
])
