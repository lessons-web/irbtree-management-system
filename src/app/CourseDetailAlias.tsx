import { Navigate, useLocation, useParams } from 'react-router'

export default function CourseDetailAlias() {
  const { code = '' } = useParams()
  const location = useLocation()
  return <Navigate to={`/course/${code}${location.search}${location.hash}`} replace />
}
