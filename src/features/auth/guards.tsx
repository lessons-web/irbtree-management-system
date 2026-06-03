import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth, type Role } from './state'

export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    )
  }

  return <Outlet />
}

export function RequireRole({ anyOf }: { anyOf: Role[] }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    )
  }

  const ok = user.roles.some((r) => anyOf.includes(r))
  if (!ok) return <Navigate to="/" replace />

  return <Outlet />
}
