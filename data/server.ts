import express from "express"
import cors from "cors"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws"

import authRoutes        from "./routes/auth.ts"
import orderRoutes       from "./routes/orders.ts"
import menuRoutes        from "./routes/menu.ts"
import inventoryRoutes   from "./routes/inventory.ts"
import eventRoutes       from "./routes/events.ts"
import transactionRoutes from "./routes/transactions.ts"
import analyticsRoutes   from "./routes/analytics.ts"
import userRoutes        from "./routes/users.ts"

const app    = express()
const server = createServer(app)
const PORT   = Number(process.env.PORT || 3001)

// ── Middleware ─────────────────────────────────────────────────────────────────
const origin = [
  "http://localhost:5173",
  "https://nakowa-mangement-system.vercel.app",
]
app.use(cors({ origin, credentials: true }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes)
app.use("/api/orders",       orderRoutes)
app.use("/api/menu",         menuRoutes);        // /api/menu/categories, /api/menu/menu-items, /api/menu/tables
app.use("/api/inventory",    inventoryRoutes)
app.use("/api/events",       eventRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/analytics",    analyticsRoutes)
app.use("/api/users",        userRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }))

// ── WebSocket Server ──────────────────────────────────────────────────────────
// Kitchen screen and dashboard subscribe here for real-time pushes.
// Frontend connects to: ws://localhost:3001
const wss = new WebSocketServer({ server })

const clients = new Set<WebSocket>()

wss.on("connection", (ws) => {
  clients.add(ws)
  console.log(`[WS] Client connected. Total: ${clients.size}`)

  ws.on("close", () => {
    clients.delete(ws)
    console.log(`[WS] Client disconnected. Total: ${clients.size}`)
  })

  ws.on("error", () => clients.delete(ws))

  // Send welcome ping
  ws.send(JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() }))
})

/**
 * Broadcast an event to ALL connected WebSocket clients.
 * Called from route handlers after mutations.
 *
 * Event types:
 *   ORDER_CREATED    — new order from waiter  → kitchen sees it instantly
 *   ORDER_UPDATED    — kitchen status changed → cashier / waiter notified
 *   ORDER_PAID       — payment done           → dashboard updates
 *   TABLE_UPDATED    — table status changed
 *   INVENTORY_LOW    — stock below minimum
 *   EVENT_CREATED    — new hall booking
 */
export function broadcast(type: string, payload: any) {
  const msg = JSON.stringify({ type, payload, timestamp: new Date().toISOString() })
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg)
    }
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Nakowa API running at http://localhost:${PORT}`)
  console.log(`📡 WebSocket running at ws://localhost:${PORT}`)
  console.log(`\nEndpoints:`)
  console.log(`  POST   /api/auth/login`)
  console.log(`  GET    /api/orders?kitchenStatus=pending`)
  console.log(`  GET    /api/menu/categories`)
  console.log(`  GET    /api/menu/menu-items`)
  console.log(`  GET    /api/menu/tables`)
  console.log(`  GET    /api/inventory/low-stock`)
  console.log(`  GET    /api/analytics/summary`)
  console.log(`  GET    /api/events`)
  console.log(`  GET    /api/transactions\n`)
})

export default app

