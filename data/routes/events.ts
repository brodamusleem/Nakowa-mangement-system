import { Router } from "express";
import { readDB, writeDB, generateId, nowISO } from "../utils.ts";

const router = Router();

router.get("/", (req, res) => {
  const db = readDB();
  let events = db.events;
  if (req.query.status) events = events.filter((e: any) => e.status === req.query.status);
  res.json(events);
});

router.get("/:id", (req, res) => {
  const ev = readDB().events.find((e: any) => e.id === req.params.id);
  if (!ev) return res.status(404).json({ message: "Event not found" });
  res.json(ev);
});

router.post("/", (req, res) => {
  const db = readDB();
  const ev = {
    ...req.body,
    id: generateId("ev"),
    balance: req.body.totalAmount - (req.body.depositPaid || 0),
    createdAt: nowISO(),
  };
  db.events.push(ev);
  writeDB(db);
  res.status(201).json(ev);
});

router.patch("/:id", (req, res) => {
  const db = readDB();
  const idx = db.events.findIndex((e: any) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Event not found" });
  db.events[idx] = { ...db.events[idx], ...req.body };
  writeDB(db);
  res.json(db.events[idx]);
});

// POST /api/events/:id/deposit
router.post("/:id/deposit", (req, res) => {
  const db = readDB();
  const idx = db.events.findIndex((e: any) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Event not found" });
  const depositPaid = db.events[idx].depositPaid + Number(req.body.amount);
  db.events[idx] = {
    ...db.events[idx],
    depositPaid,
    balance: db.events[idx].totalAmount - depositPaid,
  };
  writeDB(db);
  res.json(db.events[idx]);
});

router.delete("/:id", (req, res) => {
  const db = readDB();
  db.events = db.events.filter((e: any) => e.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

export default router;
