import { useCallback } from 'react'
import { type NavigateOptions, useNavigate } from 'react-router'

export function useProtectedNavigation() {
  const navigate = useNavigate()

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      navigate(to, options)
      return true
    },
    [navigate],
  )
}
