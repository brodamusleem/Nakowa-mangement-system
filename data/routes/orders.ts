import { Router } from "express";
import { readDB, writeDB, generateId, nowISO } from "../utils.ts";

const router = Router();

// GET /api/orders
router.get("/", (req, res) => {
  const db = readDB();
  let orders = db.orders;
  const { kitchenStatus, paymentStatus, tableId, status } = req.query;
  if (kitchenStatus) orders = orders.filter((o: any) => o.kitchenStatus === kitchenStatus);
  if (paymentStatus)  orders = orders.filter((o: any) => o.paymentStatus === paymentStatus);
  if (tableId)        orders = orders.filter((o: any) => o.tableId === tableId);
  if (status)         orders = orders.filter((o: any) => o.status === status);
  res.json(orders);
});

// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const db = readDB();
  const order = db.orders.find((o: any) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

// POST /api/orders
router.post("/", (req, res) => {
  const db = readDB();
  const items = req.body.items || [];
  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  const vat = Math.round(subtotal * 0.075);
  const id = generateId("ord");
  const orderNumber = `ORD-${String(db.orders.length + 1).padStart(3, "0")}`;
  const order = {
    ...req.body, id, orderNumber,
    status: "pending", kitchenStatus: "pending", paymentStatus: "unpaid",
    subtotal, vat, total: subtotal + vat,
    createdAt: nowISO(), updatedAt: nowISO(),
  };
  db.orders.push(order);
  writeDB(db);
  res.status(201).json(order);
});

// PATCH /api/orders/:id
router.patch("/:id", (req, res) => {
  const db = readDB();
  const idx = db.orders.findIndex((o: any) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Order not found" });
  db.orders[idx] = { ...db.orders[idx], ...req.body, updatedAt: nowISO() };
  writeDB(db);
  res.json(db.orders[idx]);
});

// DELETE /api/orders/:id
router.delete("/:id", (req, res) => {
  const db = readDB();
  db.orders = db.orders.filter((o: any) => o.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

export default router;
