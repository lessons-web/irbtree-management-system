import { useCallback } from 'react'

export function useRequireAuthAction() {
  return useCallback(
    (action: () => void) => {
      action()
      return true
    },
    [],
  )
}
