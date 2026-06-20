import { createContext, useContext } from 'react'

export type Role = 'student' | 'teacher' | 'admin'

export type User = {
  id: string
  email: string
  roles: Role[]
  name?: string
  badgeLabel?: string
  avatarText?: string
  canAccessAdmin?: boolean
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

export function getUserPresentation(user: User | null) {
  return {
    name: user?.name ?? 'Alex Student',
    badgeLabel: user?.badgeLabel ?? '学生认证',
    avatarText: user?.avatarText ?? 'A',
    canAccessAdmin: user ? (user.canAccessAdmin ?? true) : false,
  }
}
