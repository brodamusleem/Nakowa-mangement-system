import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { AuthProvider } from "@/state/context/AuthContext";
import { ThemeProvider } from "@/state/provider/ThemeProvider";
import { RootErrorBoundary } from "@/components/error-message/RootErrorBoundary";
import {
  RootRedirect, AdminRoute, ManagerRoute,
  CashierRoute, KitchenRoute,
} from "@/components/RouteGuards";

// ── Static imports (small, always needed) ────────────────────────────────────
import LoginPage             from "@/pages/admin/dashboard/LoginPage";
import AdminDashboardLayout  from "@/pages/admin/dashboard/AdminDashboardLayout";

// ── Query client ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          30_000,
      retry:              2,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Root → redirect to correct dashboard by role
  { index: true, path: "/", element: <RootRedirect /> },

  // Login
  { path: "/login", element: <LoginPage />, errorElement: <RootErrorBoundary /> },

  // Unauthorized
  {
    path: "/unauthorized",
    element: (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">You don't have access to this page.</p>
      </div>
    ),
  },

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboardLayout />
      </AdminRoute>
    ),
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/admin/dashboard/AdminDashboard"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "bookings",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/admin/bookings/AdminBookings"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "inventory",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/admin/inventory/AdminInventory"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "events",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/admin/events/AdminEvents"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "users",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/admin/users/AdminUsers"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "reports",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/admin/reports/AdminReports"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "settings",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/admin/system/SystemPreferences"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
    ],
  },

  // ── MANAGER ───────────────────────────────────────────────────────────────
  {
    path: "/manager",
    element: (
      <ManagerRoute>
        <AdminDashboardLayout /> {/* Reuse layout — customise nav via role */}
      </ManagerRoute>
    ),
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/manager/dashboard/ManagerDashboard"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "orders",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/manager/orders/ManagerOrders"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "reports",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/manager/reports/ManagerReports"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "bookings",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/manager/bookings/ManagerBookings"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "inventory",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/manager/inventory/ManagerInventory"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "invoices",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/manager/invoices/ManagerInvoices"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
    ],
  },

  // ── CASHIER / WAITER POS ─────────────────────────────────────────────────
  {
    path: "/cashier",
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/cashier/dashboard/CashierDashboard"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "pos",
        element: (
          <CashierRoute>
            <div />
          </CashierRoute>
        ),
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/cashier/pos/POSPage"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "checkout",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/cashier/checkout/CheckoutPage"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
      {
        path: "transactions",
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/cashier/transactions/TransactionsPage"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
    ],
  },

  // ── KITCHEN ───────────────────────────────────────────────────────────────
  {
    path: "/kitchen",
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <KitchenRoute>
            <div />
          </KitchenRoute>
        ),
        lazy: async () => {
          const { default: Component } = await import(
            "@/pages/kitchen/display/KitchenDisplay"
          );
          return { Component };
        },
        errorElement: <RootErrorBoundary />,
      },
    ],
  },

  // 404
  {
    path: "*",
    element: <RootErrorBoundary />,
  },
]);

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
