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
          email: 'demo@irbtree.com',
          roles: [role],
        }),
      logout: () => setUser(null),
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
