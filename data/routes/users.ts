import { Router } from "express";
import { readDB, writeDB, generateId } from "../utils.ts";

const router = Router();

router.get("/", (_req, res) => {
  const users = readDB().users.map(({ pin: _, ...u }: any) => u);
  res.json(users);
});

router.get("/:id", (req, res) => {
  const user = readDB().users.find((u: any) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { pin: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/", (req, res) => {
  const db = readDB();
  const user = { ...req.body, id: generateId("u"), active: true };
  db.users.push(user);
  writeDB(db);
  const { pin: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.patch("/:id", (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex((u: any) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "User not found" });
  db.users[idx] = { ...db.users[idx], ...req.body };
  writeDB(db);
  const { pin: _, ...safeUser } = db.users[idx];
  res.json(safeUser);
});

router.delete("/:id", (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex((u: any) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "User not found" });
  db.users[idx].active = false; // soft delete
  writeDB(db);
  res.status(204).send();
});

export default router;
