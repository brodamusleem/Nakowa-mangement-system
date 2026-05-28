export const queryKeys = {
  // Auth
  me: ["auth", "me"] as const,

  // Menu
  categories:    ["categories"] as const,
  menuItems:     ["menuItems"] as const,
  menuByCategory: (id: string) => ["menuItems", "cat", id] as const,

  // Tables
  tables: ["tables"] as const,
  table:  (id: string) => ["tables", id] as const,

  // Orders
  orders:         ["orders"] as const,
  ordersByStatus: (status: string) => ["orders", "status", status] as const,
  ordersUnpaid:   ["orders", "unpaid"] as const,
  ordersKitchen:  (ks: string) => ["orders", "kitchen", ks] as const,
  ordersKitchenRecent: () => ["orders", "kitchen", "recent"] as const,
  ordersByTable:  (id: string) => ["orders", "table", id] as const,

  // Transactions
  transactions: ["transactions"] as const,

  // Inventory
  inventory:    ["inventory"] as const,
  lowStock:     ["inventory", "low"] as const,

  // Events
  events:  ["events"] as const,
  event:   (id: string) => ["events", id] as const,

  // Users
  users: ["users"] as const,
  user:  (id: string) => ["users", id] as const,

  // Analytics
  analyticsToday:   ["analytics", "today"] as const,
  analyticsMonthly: ["analytics", "monthly"] as const,
  analyticsSummary: ["analytics", "summary"] as const,
} as const
