import { createContext, useContext } from "react"
import { useAuthStore } from "@/state/authStore"
import type { User, UserRole } from "@/types/userTypes"

interface AuthContextValue {
  user:            User | null
  isAuthenticated: boolean
  hasRole:         (roles: UserRole[]) => boolean
  logout:          () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore()

  const hasRole = (roles: UserRole[]) =>
    !!user && roles.includes(user.role)

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, hasRole, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
