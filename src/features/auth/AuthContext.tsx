import { useMemo, type ReactNode } from 'react'
import { AuthContext, type AuthState, type User } from './state'

const demoUser: User = {
  id: 'u_mock',
  email: 'alex.student@irbtree.com',
  roles: ['student'],
  name: 'Alex Student',
  badgeLabel: '学生认证',
  avatarText: 'A',
  canAccessAdmin: true,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthState>(() => {
    return {
      user: demoUser,
      loginAs: () => {},
      logout: () => {},
    }
  }, [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
