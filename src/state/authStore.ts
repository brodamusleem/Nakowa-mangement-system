import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/userTypes"
import { supabase } from "@/lib/supabase"

interface AuthStore {
  user:  User | null
  token: string | null
  isAuthenticated: boolean
  devRole: string | null; // For dev role switching
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  logout: () => void
  setDevRole: (role: string | null) => void; // Dev role switcher
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      devRole:         null,

      setAuth: (user, token) => {
        localStorage.setItem("nakowa_token", token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem("nakowa_token")
        set({ user: null, token: null, isAuthenticated: false })
      },

      logout: () => {
        localStorage.removeItem("nakowa_token")
        void supabase.auth.signOut()
        set({ user: null, token: null, isAuthenticated: false })
      },

      setDevRole: (role) => {
        set({ devRole: role })
      },
    }),
    {
      name:    "nakowa_auth",
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated, devRole: s.devRole }),
    }
  )
)
