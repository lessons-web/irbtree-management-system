import { useContext } from 'react'
import { UserOverlayContext } from './userOverlayShared'

export function useUserOverlay() {
  const context = useContext(UserOverlayContext)
  if (!context) {
    throw new Error('UserOverlayProvider is missing')
  }
  return context
}

export function useOptionalUserOverlay() {
  return useContext(UserOverlayContext)
}
