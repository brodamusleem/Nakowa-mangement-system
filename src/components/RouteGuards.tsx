import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/state/context/AuthContext";
import type { UserRole } from "@/types/userTypes";

// ── Role → default route map ──────────────────────────────────────────────────
const ROLE_HOME: Record<UserRole, string> = {
  admin:   "/admin",
  manager: "/manager",
  cashier: "/cashier",
  waiter:  "/cashier",   // waiters use the POS screen
  kitchen: "/kitchen",
};

/** Redirect "/" to the right dashboard based on user role */
export function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role]} replace />;
}

/** Protect a route — redirect to /login if not authenticated */
export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children ? <>{children}</> : <Outlet />;
}

/** Restrict route to specific roles */
export function RoleRoute({
  roles,
  children,
}: {
  roles: UserRole[];
  children?: React.ReactNode;
}) {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole(roles))  return <Navigate to="/unauthorized" replace />;
  return children ? <>{children}</> : <Outlet />;
}

/** Convenience wrappers */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute roles={["admin"]}>{children}</RoleRoute>;
}

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute roles={["admin", "manager"]}>{children}</RoleRoute>;
}

export function CashierRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute roles={["admin", "manager", "cashier", "waiter"]}>{children}</RoleRoute>;
}

export function KitchenRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute roles={["admin", "manager", "kitchen"]}>{children}</RoleRoute>;
}
