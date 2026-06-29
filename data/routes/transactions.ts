import { Router } from "express"
import { readDB, writeDB, generateId, nowISO } from "../utils.ts"

const router = Router()

router.get("/", (_req, res) => res.json(readDB().transactions))

router.post("/", (req, res) => {
  const db = readDB()
  const txn = {
    ...req.body,
    id: generateId("txn"),
    receiptNumber: `RCP-${String(db.transactions.length + 1).padStart(4, "0")}`,
    status: "paid",
    createdAt: nowISO(),
  }
  db.transactions.push(txn)
  writeDB(db)
  res.status(201).json(txn)
})

export default router

