import { createBrowserRouter, Outlet } from 'react-router'
import AdminLayout from '../admin/AdminLayout'
import DashboardPage from '../admin/pages/DashboardPage'
import ContentPlaceholderPage from '../admin/pages/content/ContentPlaceholderPage'
import ReviewsPlaceholderPage from '../admin/pages/reviews/ReviewsPlaceholderPage'
import StudentsPlaceholderPage from '../admin/pages/students/StudentsPlaceholderPage'
import SystemPlaceholderPage from '../admin/pages/system/SystemPlaceholderPage'
import { AuthProvider } from '../features/auth/AuthContext'
import { RequireAuth, RequireRole } from '../features/auth/guards'
import { ReviewProvider } from '../features/review/ReviewContext'
import AuthPage from '../pages/auth/AuthPage'
import HomePage from '../pages/home/HomePage'
import LearnIndexPage from '../pages/learn/LearnIndexPage'
import MeIndexPage from '../pages/me/MeIndexPage'
import RecommendIndexPage from '../pages/recommend/RecommendIndexPage'
import ReviewDetailPage from '../pages/review/ReviewDetailPage'
import ReviewIndexPage from '../pages/review/ReviewIndexPage'
import PublicLayout from './PublicLayout'

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
        element: <PublicLayout />,
        children: [
          { index: true, Component: HomePage },
          { path: 'auth', Component: AuthPage },
          {
            element: <RequireAuth />,
            children: [
              {
                path: 'review',
                element: (
                  <ReviewProvider>
                    <Outlet />
                  </ReviewProvider>
                ),
                children: [
                  { index: true, Component: ReviewIndexPage },
                  { path: ':code', Component: ReviewDetailPage },
                ],
              },
              { path: 'recommend', Component: RecommendIndexPage },
              { path: 'learn', Component: LearnIndexPage },
              { path: 'me', Component: MeIndexPage },
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
