import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "./client"
import { queryKeys } from "./queryKeys"
import type { Order, CreateOrderPayload, OrderItem } from "@/types/orderTypes"
import type { Category, MenuItem, Table } from "@/types/menuTypes"
import type { User, LoginPayload, LoginResponse } from "@/types/userTypes"
import type {
  AnalyticsSummary, TodayAnalytics, MonthlyAnalytics,
  InventoryItem, HallEvent, Transaction,
} from "@/types/analyticsTypes"
import { useAuthStore } from "@/state/authStore"

// ── AUTH ──────────────────────────────────────────────────────────────────────
export function useLogin() {
  const { setAuth } = useAuthStore()
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (data) => apiClient.post("/auth/login", data).then((r) => r.data),
    onSuccess: ({ user, token }) => {
      localStorage.setItem("nakowa_token", token)
      setAuth(user, token)
    },
  })
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories,
    queryFn: () => apiClient.get("/menu/categories").then((r) => r.data),
  })
}

// ── MENU ITEMS ────────────────────────────────────────────────────────────────
export function useMenuItems(categoryId?: string) {
  return useQuery<MenuItem[]>({
    queryKey: categoryId ? queryKeys.menuByCategory(categoryId) : queryKeys.menuItems,
    queryFn: () =>
      apiClient
        .get("/menu/menu-items", { params: categoryId ? { categoryId } : undefined })
        .then((r) => r.data),
  })
}

export function useToggleMenuItem() {
  const qc = useQueryClient()
  return useMutation<MenuItem, Error, { id: string; available: boolean }>({
    mutationFn: ({ id, available }) =>
      apiClient.patch(`/menu/menu-items/${id}`, { available }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.menuItems }),
  })
}

export function useCreateMenuItem() {
  const qc = useQueryClient()
  return useMutation<MenuItem, Error, Omit<MenuItem, "id">>({
    mutationFn: (data) => apiClient.post("/menu/menu-items", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.menuItems }),
  })
}

export function useUpdateMenuItem() {
  const qc = useQueryClient()
  return useMutation<MenuItem, Error, { id: string } & Partial<MenuItem>>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`/menu/menu-items/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.menuItems }),
  })
}

// ── TABLES ────────────────────────────────────────────────────────────────────
export function useTables() {
  return useQuery<Table[]>({
    queryKey: queryKeys.tables,
    queryFn: () => apiClient.get("/menu/tables").then((r) => r.data),
  })
}

export function useUpdateTableStatus() {
  const qc = useQueryClient()
  return useMutation<Table, Error, { id: string; status: Table["status"] }>({
    mutationFn: ({ id, status }) =>
      apiClient.patch(`/menu/tables/${id}`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tables }),
  })
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: queryKeys.orders,
    queryFn: () => apiClient.get("/orders").then((r) => r.data),
  })
}

export function useUnpaidOrders() {
  return useQuery<Order[]>({
    queryKey: queryKeys.ordersUnpaid,
    queryFn: () =>
      apiClient.get("/orders", { params: { paymentStatus: "unpaid" } }).then((r) => r.data),
  })
}

export function useKitchenOrders(kitchenStatus: string) {
  return useQuery<Order[]>({
    queryKey: queryKeys.ordersKitchen(kitchenStatus),
    queryFn: () =>
      apiClient.get("/orders", { params: { kitchenStatus } }).then((r) => r.data),
    // WebSocket handles real-time; polling is a fallback only
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  })
}

export function useActiveKitchenOrders() {
  const pending   = useKitchenOrders("pending")
  const preparing = useKitchenOrders("preparing")
  const ready     = useKitchenOrders("ready")
  return {
    pending:   pending.data   ?? [],
    preparing: preparing.data ?? [],
    ready:     ready.data     ?? [],
    isLoading: pending.isLoading || preparing.isLoading,
  }
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation<Order, Error, CreateOrderPayload>({
    mutationFn: (data) => apiClient.post("/orders", data).then((r) => r.data),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      qc.invalidateQueries({ queryKey: queryKeys.ordersKitchen("pending") })
      if (order.tableId)
        qc.invalidateQueries({ queryKey: queryKeys.ordersByTable(order.tableId) })
    },
  })
}

export function useUpdateKitchenStatus() {
  const qc = useQueryClient()
  return useMutation<Order, Error, { id: string; kitchenStatus: string }>({
    mutationFn: ({ id, kitchenStatus }) =>
      apiClient.patch(`/orders/${id}`, { kitchenStatus }).then((r) => r.data),
    onSuccess: () => {
      ["pending", "preparing", "ready"].forEach((s) =>
        qc.invalidateQueries({ queryKey: queryKeys.ordersKitchen(s) })
      )
      qc.invalidateQueries({ queryKey: queryKeys.ordersUnpaid })
    },
  })
}

export function useAddOrderItems() {
  const qc = useQueryClient()
  return useMutation<Order, Error, { id: string; newItems: OrderItem[] }>({
    mutationFn: ({ id, newItems }) =>
      apiClient.get(`/orders/${id}`).then(async (r) => {
        const order: Order = r.data
        const merged = [...order.items, ...newItems]
        const subtotal = merged.reduce((s, i) => s + i.price * i.qty, 0)
        const vat = Math.round(subtotal * 0.075)
        return apiClient
          .patch(`/orders/${id}`, { items: merged, subtotal, vat, total: subtotal + vat })
          .then((r2) => r2.data)
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      qc.invalidateQueries({ queryKey: queryKeys.ordersUnpaid })
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation<Order, Error, string>({
    mutationFn: (id) =>
      apiClient.patch(`/orders/${id}`, { status: "cancelled" }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  })
}

// ── TRANSACTIONS / PAYMENT ────────────────────────────────────────────────────
export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: queryKeys.transactions,
    queryFn: () => apiClient.get("/transactions").then((r) => r.data),
  })
}

export interface CompletePaymentPayload {
  order: Order
  paymentMethod: string
  amountGiven: number
  cashierId: string
  cashierName: string
}

export function useCompletePayment() {
  const qc = useQueryClient()
  return useMutation<Transaction, Error, CompletePaymentPayload>({
    mutationFn: async ({ order, paymentMethod, amountGiven, cashierId, cashierName }) => {
      const change = paymentMethod === "cash" ? amountGiven - order.total : 0
      const txn: Transaction = await apiClient
        .post("/transactions", {
          orderNumber: order.orderNumber,
          cashierId, cashierName,
          amount: order.total,
          method: paymentMethod,
          amountGiven: paymentMethod === "cash" ? amountGiven : order.total,
          change,
        })
        .then((r) => r.data)
      await apiClient.patch(`/orders/${order.id}`, {
        status: "completed",
        paymentStatus: "paid",
        paymentMethod,
      })
      if (order.tableId) {
        await apiClient.patch(`/menu/tables/${order.tableId}`, { status: "available" })
      }
      return txn
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions })
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      qc.invalidateQueries({ queryKey: queryKeys.ordersUnpaid })
      qc.invalidateQueries({ queryKey: queryKeys.tables })
    },
  })
}

// ── INVENTORY ─────────────────────────────────────────────────────────────────
export function useInventory() {
  return useQuery<InventoryItem[]>({
    queryKey: queryKeys.inventory,
    queryFn: () => apiClient.get("/inventory").then((r) => r.data),
  })
}

export function useLowStockItems() {
  return useQuery<InventoryItem[]>({
    queryKey: queryKeys.lowStock,
    queryFn: () => apiClient.get("/inventory/low-stock").then((r) => r.data),
  })
}

export function useRestockItem() {
  const qc = useQueryClient()
  return useMutation<InventoryItem, Error, { id: string; amount: number }>({
    mutationFn: ({ id, amount }) =>
      apiClient.post(`/inventory/${id}/restock`, { amount }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory })
      qc.invalidateQueries({ queryKey: queryKeys.lowStock })
    },
  })
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient()
  return useMutation<InventoryItem, Error, { id: string } & Partial<InventoryItem>>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`/inventory/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory }),
  })
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
export function useEvents(status?: string) {
  return useQuery<HallEvent[]>({
    queryKey: queryKeys.events,
    queryFn: () =>
      apiClient.get("/events", { params: status ? { status } : undefined }).then((r) => r.data),
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation<HallEvent, Error, Omit<HallEvent, "id" | "balance" | "createdAt">>({
    mutationFn: (data) => apiClient.post("/events", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation<HallEvent, Error, { id: string } & Partial<HallEvent>>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`/events/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events }),
  })
}

export function useRecordEventDeposit() {
  const qc = useQueryClient()
  return useMutation<HallEvent, Error, { id: string; amount: number }>({
    mutationFn: ({ id, amount }) =>
      apiClient.post(`/events/${id}/deposit`, { amount }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`/events/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events }),
  })
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummary>({
    queryKey: queryKeys.analyticsSummary,
    queryFn: () => apiClient.get("/analytics/summary").then((r) => r.data),
    refetchInterval: 60_000,
  })
}

export function useAnalyticsToday() {
  return useQuery<TodayAnalytics>({
    queryKey: queryKeys.analyticsToday,
    queryFn: () => apiClient.get("/analytics/today").then((r) => r.data),
  })
}

export function useAnalyticsMonthly() {
  return useQuery<MonthlyAnalytics>({
    queryKey: queryKeys.analyticsMonthly,
    queryFn: () => apiClient.get("/analytics/monthly").then((r) => r.data),
  })
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export function useUsers() {
  return useQuery<User[]>({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.get("/users").then((r) => r.data),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation<User, Error, Omit<User, "id" | "active">>({
    mutationFn: (data) => apiClient.post("/users", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation<User, Error, { id: string } & Partial<User>>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`/users/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  })
}
