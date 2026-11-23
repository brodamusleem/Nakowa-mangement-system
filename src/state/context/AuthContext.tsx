import { createContext, useContext, useEffect } from "react"
import { useAuthStore } from "@/state/authStore"
import type { User, UserRole } from "@/types/userTypes"
import { supabase } from "@/lib/supabase"

interface AuthContextValue {
  user:            User | null
  isAuthenticated: boolean
  hasRole:         (roles: UserRole[]) => boolean
  logout:          () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    let mounted = true
    const loadProfile = async (session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>) => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id,legacy_id,name,email,role,avatar,active")
        .eq("id", session.user.id)
        .single()

      if (!mounted) return
      if (error || !profile || !profile.active) {
        clearAuth()
        return
      }

      setAuth(
        {
          id: profile.legacy_id || profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar: profile.avatar,
          active: profile.active,
        },
        session.access_token
      )
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session) void loadProfile(data.session)
      else clearAuth()
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session) {
        window.setTimeout(() => {
          if (mounted) void loadProfile(session)
        }, 0)
      } else {
        clearAuth()
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [clearAuth, setAuth])

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
