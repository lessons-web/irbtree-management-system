import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useOptionalUserOverlay } from '../../components/user/useUserOverlay'
import { useAuth } from './state'

export function useRequireAuthAction() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const overlay = useOptionalUserOverlay()

  return useCallback(
    (action: () => void) => {
      if (!user) {
        if (overlay) {
          overlay.openLogin({ afterLogin: action })
          return false
        }
        navigate('/auth', {
          replace: true,
          state: {
            from: {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            },
          },
        })
        return false
      }

      action()
      return true
    },
    [location.hash, location.pathname, location.search, navigate, overlay, user],
  )
}
