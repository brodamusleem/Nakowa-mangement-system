import { Outlet, NavLink } from "react-router-dom"
import {
  LayoutDashboard, ShoppingCart, Package, CalendarDays,
  Users, BarChart3, Settings, LogOut, ChefHat, FileText,
} from "lucide-react"
import { useAuth } from "@/state/context/AuthContext"
import { useOfflineSync } from "@/hooks/useOfflineSync"
import { useWebSocket } from "@/hooks/useWebSocket"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ADMIN_NAV = [
  { label: "Dashboard",   to: "",           icon: LayoutDashboard, end: true },
  { label: "Bookings",    to: "bookings",   icon: CalendarDays },
  { label: "Inventory",   to: "inventory",  icon: Package },
  { label: "Events",      to: "events",     icon: CalendarDays },
  { label: "Users",       to: "users",      icon: Users },
  { label: "Reports",     to: "reports",    icon: BarChart3 },
  { label: "Settings",    to: "settings",   icon: Settings },
]

const MANAGER_NAV = [
  { label: "Dashboard",   to: "",           icon: LayoutDashboard, end: true },
  { label: "Orders",      to: "orders",     icon: ShoppingCart },
  { label: "Bookings",    to: "bookings",   icon: CalendarDays },
  { label: "Inventory",   to: "inventory",  icon: Package },
  { label: "Invoices",    to: "invoices",   icon: FileText },
  { label: "Reports",     to: "reports",    icon: BarChart3 },
]

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth()
  const { isOnline, queueLength } = useOfflineSync()

  // Mount WebSocket listener once at layout level
  useWebSocket()

  const NAV = user?.role === "manager" ? MANAGER_NAV : ADMIN_NAV

  return (
    <div className="flex min-h-screen bg-background lg:h-screen lg:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Nakowa Events</p>
            <p className="text-xs text-muted-foreground">& Restaurant Ltd</p>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mx-3 mt-3 rounded-md bg-yellow-100 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            ⚠ Offline — {queueLength} queued
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="space-y-2 border-t px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {user ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Compact navigation for phones and tablets */}
      <div className="border-b bg-card lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none">Nakowa Events</p>
              <p className="mt-1 truncate text-xs capitalize text-muted-foreground">{user?.role} · {user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        {!isOnline && (
          <div className="mx-4 mb-2 rounded-md bg-yellow-100 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Offline — {queueLength} queued
          </div>
        )}
        <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto border-t px-3 py-2">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-x-hidden lg:overflow-y-auto">
        <Outlet />
      </main>
      </div>
    </div>
  )
}
