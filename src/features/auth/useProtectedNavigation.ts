import { useCallback } from 'react'
import { type NavigateOptions, useNavigate } from 'react-router'
import { useRequireAuthAction } from './useRequireAuthAction'

export function useProtectedNavigation() {
  const navigate = useNavigate()
  const requireAuth = useRequireAuthAction()

  return useCallback(
    (to: string, options?: NavigateOptions) =>
      requireAuth(() => {
        navigate(to, options)
      }),
    [navigate, requireAuth],
  )
}
