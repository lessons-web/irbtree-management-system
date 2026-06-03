import { createBrowserRouter } from 'react-router'
import HomePage from '../pages/home/HomePage'
import LearnIndexPage from '../pages/learn/LearnIndexPage'
import MeIndexPage from '../pages/me/MeIndexPage'
import RecommendIndexPage from '../pages/recommend/RecommendIndexPage'
import ReviewIndexPage from '../pages/review/ReviewIndexPage'
import PublicLayout from './PublicLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'review', Component: ReviewIndexPage },
      { path: 'recommend', Component: RecommendIndexPage },
      { path: 'learn', Component: LearnIndexPage },
      { path: 'me', Component: MeIndexPage },
    ],
  },
])

