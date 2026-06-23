import { createBrowserRouter, Outlet } from 'react-router'
import AdminLayout from '../admin/AdminLayout'
import { adminDefaultPath } from '../admin/config/navigation'
import CoursesAdminPage from '../admin/pages/courses/CoursesAdminPage'
import LogsAdminPage from '../admin/pages/logs/LogsAdminPage'
import MessagesAdminPage from '../admin/pages/messages/MessagesAdminPage'
import ReviewsAdminPage from '../admin/pages/reviews/ReviewsAdminPage'
import SemestersAdminPage from '../admin/pages/semesters/SemestersAdminPage'
import StudentDetailPage from '../admin/pages/students/StudentDetailPage'
import StudentsAdminPage from '../admin/pages/students/StudentsAdminPage'
import TagsAdminPage from '../admin/pages/tags/TagsAdminPage'
import TeachersAdminPage from '../admin/pages/teachers/TeachersAdminPage'
import UniversitiesAdminPage from '../admin/pages/universities/UniversitiesAdminPage'
import UsersAdminPage from '../admin/pages/users/UsersAdminPage'
import CourseDetailAlias from './CourseDetailAlias'
import PathAlias from './PathAlias'
import { AuthProvider } from '../features/auth/AuthContext'
import { ReviewProvider } from '../features/review/reviewProvider'
import UserLayout from '../layouts/UserLayout'
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
          { path: 'auth', element: <PathAlias to="/" /> },
          { path: 'review', element: <PathAlias to="/courses" /> },
          { path: 'review/:code', Component: CourseDetailAlias },
          { path: 'me', element: <PathAlias to="/profile" /> },
          { path: 'recommend', element: <PathAlias to="/recommendation" /> },
          { path: 'courses', Component: CoursesPage },
          { path: 'course/:code', Component: CourseDetailPage },
          {
            path: 'recommendation',
            Component: RecommendationPage,
          },
          { path: 'profile', Component: ProfilePage },
          { path: 'learn', Component: LearnIndexPage },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <PathAlias to={adminDefaultPath} /> },
              { path: 'course-center', Component: CoursesAdminPage },
              {
                path: 'review-management',
                children: [
                  { index: true, element: <PathAlias to="/admin/review-management/reviews" /> },
                  { path: 'reviews', Component: ReviewsAdminPage },
                  { path: 'universities', Component: UniversitiesAdminPage },
                  { path: 'teachers', Component: TeachersAdminPage },
                  { path: 'semesters', Component: SemestersAdminPage },
                ],
              },
              {
                path: 'student-management',
                children: [
                  { index: true, element: <PathAlias to="/admin/student-management/students" /> },
                  { path: 'students', Component: StudentsAdminPage },
                  { path: 'students/:studentId', Component: StudentDetailPage },
                ],
              },
              {
                path: 'problem-bank',
                children: [
                  { index: true, element: <PathAlias to="/admin/problem-bank/tags" /> },
                  { path: 'tags', Component: TagsAdminPage },
                ],
              },
              {
                path: 'system-management',
                children: [
                  { index: true, element: <PathAlias to="/admin/system-management/users" /> },
                  { path: 'users', Component: UsersAdminPage },
                  { path: 'messages', Component: MessagesAdminPage },
                  { path: 'logs', Component: LogsAdminPage },
                ],
              },
              { path: 'courses', element: <PathAlias to={adminDefaultPath} /> },
              { path: 'reviews', element: <PathAlias to="/admin/review-management/reviews" /> },
              { path: 'universities', element: <PathAlias to="/admin/review-management/universities" /> },
              { path: 'teachers', element: <PathAlias to="/admin/review-management/teachers" /> },
              { path: 'semesters', element: <PathAlias to="/admin/review-management/semesters" /> },
              { path: 'tags', element: <PathAlias to="/admin/problem-bank/tags" /> },
              { path: 'users', element: <PathAlias to="/admin/system-management/users" /> },
              { path: 'messages', element: <PathAlias to="/admin/system-management/messages" /> },
              { path: 'logs', element: <PathAlias to="/admin/system-management/logs" /> },
            ],
          },
        ],
      },
    ],
  },
])
