import { Router } from "express";
import { readDB, writeDB, generateId } from "../utils.ts";

const router = Router();

// GET /api/inventory
router.get("/", (_req, res) => res.json(readDB().inventory));

// GET /api/inventory/low-stock
router.get("/low-stock", (_req, res) => {
  const items = readDB().inventory;
  res.json(items.filter((i: any) => i.quantity <= i.minQuantity));
});

// POST /api/inventory
router.post("/", (req, res) => {
  const db = readDB();
  const item = { ...req.body, id: generateId("inv") };
  db.inventory.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// PATCH /api/inventory/:id
router.patch("/:id", (req, res) => {
  const db = readDB();
  const idx = db.inventory.findIndex((i: any) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Item not found" });
  db.inventory[idx] = { ...db.inventory[idx], ...req.body };
  writeDB(db);
  res.json(db.inventory[idx]);
});

// POST /api/inventory/:id/restock
router.post("/:id/restock", (req, res) => {
  const db = readDB();
  const idx = db.inventory.findIndex((i: any) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Item not found" });
  db.inventory[idx].quantity += Number(req.body.amount);
  writeDB(db);
  res.json(db.inventory[idx]);
});

// DELETE /api/inventory/:id
router.delete("/:id", (req, res) => {
  const db = readDB();
  db.inventory = db.inventory.filter((i: any) => i.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

export default router;
