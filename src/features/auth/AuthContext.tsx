import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthState, type User } from './state'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const value = useMemo<AuthState>(() => {
    return {
      user,
      loginAs: (role) =>
        setUser({
          id: 'u_mock',
          email: 'alex.student@irbtree.com',
          roles: [role],
          name: 'Alex Student',
          badgeLabel: '学生认证',
          avatarText: 'A',
          canAccessAdmin: true,
        }),
      logout: () => setUser(null),
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
