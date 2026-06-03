import { createContext, useContext } from 'react'

export type Role = 'student' | 'teacher' | 'admin'

export type User = {
  id: string
  email: string
  roles: Role[]
}

export type AuthState = {
  user: User | null
  loginAs: (role: Role) => void
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider is missing')
  return ctx
}
