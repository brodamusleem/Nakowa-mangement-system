export type UserRole = "admin" | "manager" | "cashier" | "waiter" | "kitchen"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string | null
  active: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginPayload {
  email: string
  pin: string
}

export interface LoginResponse {
  user: User
  token: string
}
