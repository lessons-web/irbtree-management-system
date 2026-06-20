import { Navigate, useLocation } from 'react-router'

type PathAliasProps = {
  to: string
}

export default function PathAlias({ to }: PathAliasProps) {
  const location = useLocation()
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />
}
