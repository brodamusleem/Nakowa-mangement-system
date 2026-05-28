import { Router } from "express"
import { readDB, writeDB } from "../utils.ts"

const router = Router()

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, pin } = req.body
  const db = readDB()
  const user = db.users.find(
    (u: any) => u.email === email && u.pin === pin && u.active
  )
  if (!user) return res.status(401).json({ message: "Invalid credentials" })
  const { pin: _, ...safeUser } = user
  res.json({ user: safeUser, token: `mock-token-${user.id}` })
})

// GET /api/auth/me  (mock — just returns user by token header)
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "")
  const userId = token?.replace("mock-token-", "")
  const db = readDB()
  const user = db.users.find((u: any) => u.id === userId)
  if (!user) return res.status(401).json({ message: "Unauthorized" })
  const { pin: _, ...safeUser } = user
  res.json(safeUser)
})

export default router

