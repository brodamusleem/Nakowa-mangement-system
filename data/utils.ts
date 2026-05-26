import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");

export function readDB(): any {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

export function writeDB(data: any): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
