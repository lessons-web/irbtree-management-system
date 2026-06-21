import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import AdminLayout from '../admin/AdminLayout'
import CoursesAdminPage from '../admin/pages/courses/CoursesAdminPage'
import LogsAdminPage from '../admin/pages/logs/LogsAdminPage'
import MessagesAdminPage from '../admin/pages/messages/MessagesAdminPage'
import ReviewsAdminPage from '../admin/pages/reviews/ReviewsAdminPage'
import SemestersAdminPage from '../admin/pages/semesters/SemestersAdminPage'
import TagsAdminPage from '../admin/pages/tags/TagsAdminPage'
import TeachersAdminPage from '../admin/pages/teachers/TeachersAdminPage'
import UniversitiesAdminPage from '../admin/pages/universities/UniversitiesAdminPage'
import UsersAdminPage from '../admin/pages/users/UsersAdminPage'
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
              { index: true, element: <Navigate to="/admin/courses" replace /> },
              { path: 'courses', Component: CoursesAdminPage },
              { path: 'reviews', Component: ReviewsAdminPage },
              { path: 'universities', Component: UniversitiesAdminPage },
              { path: 'teachers', Component: TeachersAdminPage },
              { path: 'semesters', Component: SemestersAdminPage },
              { path: 'tags', Component: TagsAdminPage },
              { path: 'users', Component: UsersAdminPage },
              { path: 'messages', Component: MessagesAdminPage },
              { path: 'logs', Component: LogsAdminPage },
            ],
          },
        ],
      },
    ],
  },
])
