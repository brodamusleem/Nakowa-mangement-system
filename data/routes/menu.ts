import { Router } from "express"
import { readDB, writeDB, generateId } from "../utils.ts"

const router = Router()

// ── CATEGORIES ────────────────────────────────────────────────────────────────
router.get("/categories", (_req, res) => {
  const db = readDB()
  res.json(db.categories.sort((a: any, b: any) => a.sortOrder - b.sortOrder))
})

router.post("/categories", (req, res) => {
  const db = readDB()
  const cat = { ...req.body, id: generateId("c") }
  db.categories.push(cat)
  writeDB(db)
  res.status(201).json(cat)
})

router.patch("/categories/:id", (req, res) => {
  const db = readDB()
  const idx = db.categories.findIndex((c: any) => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ message: "Category not found" })
  db.categories[idx] = { ...db.categories[idx], ...req.body }
  writeDB(db)
  res.json(db.categories[idx])
})

router.delete("/categories/:id", (req, res) => {
  const db = readDB()
  db.categories = db.categories.filter((c: any) => c.id !== req.params.id)
  writeDB(db)
  res.status(204).send()
})

// ── MENU ITEMS ─────────────────────────────────────────────────────────────────
router.get("/menu-items", (req, res) => {
  const db = readDB()
  let items = db.menuItems
  if (req.query.categoryId) items = items.filter((m: any) => m.categoryId === req.query.categoryId)
  if (req.query.available)  items = items.filter((m: any) => m.available === (req.query.available === "true"))
  res.json(items)
})

router.post("/menu-items", (req, res) => {
  const db = readDB()
  const item = { ...req.body, id: generateId("m"), available: true }
  db.menuItems.push(item)
  writeDB(db)
  res.status(201).json(item)
})

router.patch("/menu-items/:id", (req, res) => {
  const db = readDB()
  const idx = db.menuItems.findIndex((m: any) => m.id === req.params.id)
  if (idx === -1) return res.status(404).json({ message: "Menu item not found" })
  db.menuItems[idx] = { ...db.menuItems[idx], ...req.body }
  writeDB(db)
  res.json(db.menuItems[idx])
})

router.delete("/menu-items/:id", (req, res) => {
  const db = readDB()
  db.menuItems = db.menuItems.filter((m: any) => m.id !== req.params.id)
  writeDB(db)
  res.status(204).send()
})

// ── TABLES ─────────────────────────────────────────────────────────────────────
router.get("/tables", (_req, res) => {
  res.json(readDB().tables)
})

router.post("/tables", (req, res) => {
  const db = readDB()
  const table = { ...req.body, id: generateId("t"), status: "available" }
  db.tables.push(table)
  writeDB(db)
  res.status(201).json(table)
})

router.patch("/tables/:id", (req, res) => {
  const db = readDB()
  const idx = db.tables.findIndex((t: any) => t.id === req.params.id)
  if (idx === -1) return res.status(404).json({ message: "Table not found" })
  db.tables[idx] = { ...db.tables[idx], ...req.body }
  writeDB(db)
  res.json(db.tables[idx])
})

export default router

