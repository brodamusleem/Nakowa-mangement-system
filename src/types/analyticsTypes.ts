// ── Analytics ────────────────────────────────────────────────────────────────
export interface TodayAnalytics {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  totalBookings: number
  netProfit: number
  totalExpenses: number
}

export interface SalesByDay {
  date: string
  sales: number
}

export interface MonthlyAnalytics {
  totalSales: number
  totalExpenses: number
  netProfit: number
  salesByDay: SalesByDay[]
}

export interface AnalyticsSummary extends TodayAnalytics {
  totalRevenue: number
  pendingOrders: number
  lowStockCount: number
  confirmedEvents: number
  totalTransactions: number
}

// ── Inventory ─────────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  quantity: number
  minQuantity: number
  reorderLevel: number
  costPerUnit: number
  cost: number
}

// ── Events ────────────────────────────────────────────────────────────────────
export type EventStatus = "pending" | "confirmed" | "cancelled" | "completed"

export interface HallEvent {
  id: string
  title: string
  hall: string
  date: string
  startTime: string
  endTime: string
  clientName: string
  clientPhone: string
  guestCount: number
  status: EventStatus
  depositPaid: number
  totalAmount: number
  balance: number
  notes: string
  createdAt: string
}

// ── Transactions ──────────────────────────────────────────────────────────────
export type PaymentMethod = "cash" | "card" | "mobile" | "transfer"

export interface Transaction {
  id: string
  orderNumber: string
  reference: string
  cashierId: string
  cashierName: string
  amount: number
  method: PaymentMethod
  amountGiven: number
  change: number
  status: "paid" | "refunded" | "completed" | "failed" | "pending"
  receiptNumber: string
  date: string
  time: string
  createdAt: string
}
