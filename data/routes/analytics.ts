import { Router } from "express"
import { readDB } from "../utils.ts"

const router = Router()

// GET /api/analytics/today
router.get("/today", (_req, res) => {
  const db = readDB()
  res.json(db.analytics.today)
})

// GET /api/analytics/monthly
router.get("/monthly", (_req, res) => {
  const db = readDB()
  res.json(db.analytics.monthly)
})

// GET /api/analytics/summary  — computed from live orders + transactions
router.get("/summary", (_req, res) => {
  const db = readDB()
  const paidTransactions = db.transactions.filter((t: any) => t.status === "paid")
  const totalRevenue = paidTransactions.reduce((s: number, t: any) => s + t.amount, 0)
  const pendingOrders = db.orders.filter((o: any) => o.paymentStatus === "unpaid").length
  const lowStockCount = db.inventory.filter((i: any) => i.quantity <= i.minQuantity).length
  const todayEvents = db.events.filter((e: any) => e.status === "confirmed").length

  res.json({
    totalRevenue,
    pendingOrders,
    lowStockCount,
    confirmedEvents: todayEvents,
    totalTransactions: paidTransactions.length,
    ...db.analytics.today,
  })
})

export default router

