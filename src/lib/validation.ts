import { z } from "zod"

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  pin:   z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN max 6 digits"),
})
export type LoginFormValues = z.infer<typeof loginSchema>

// ── Menu Item ─────────────────────────────────────────────────────────────────
export const menuItemSchema = z.object({
  name:       z.string().min(2, "Name is required"),
  categoryId: z.string().min(1, "Select a category"),
  price:      z.coerce.number().min(1, "Price must be greater than 0"),
  unit:       z.string().min(1, "Unit is required"),
  prepTime:   z.coerce.number().min(1, "Prep time required"),
  available:  z.boolean().default(true),
})
export type MenuItemFormValues = z.infer<typeof menuItemSchema>

// ── Order ─────────────────────────────────────────────────────────────────────
export const orderItemSchema = z.object({
  menuItemId: z.string(),
  name:       z.string(),
  qty:        z.number().min(1),
  price:      z.number().min(0),
  note:       z.string().default(""),
})

export const createOrderSchema = z.object({
  type:      z.enum(["dine-in", "takeaway"]),
  tableId:   z.string().nullable(),
  tableName: z.string().nullable(),
  items:     z.array(orderItemSchema).min(1, "Add at least one item"),
})
export type CreateOrderFormValues = z.infer<typeof createOrderSchema>

// ── Payment ───────────────────────────────────────────────────────────────────
export const paymentSchema = z.object({
  paymentMethod: z.enum(["cash", "transfer", "card"]),
  amountGiven:   z.coerce.number().optional(),
}).refine(
  (data) => data.paymentMethod !== "cash" || (data.amountGiven !== undefined && data.amountGiven > 0),
  { message: "Enter amount given for cash payment", path: ["amountGiven"] }
)
export type PaymentFormValues = z.infer<typeof paymentSchema>

// ── Event ─────────────────────────────────────────────────────────────────────
export const eventSchema = z.object({
  title:       z.string().min(3, "Title required"),
  hall:        z.string().min(1, "Select a hall"),
  date:        z.string().min(1, "Date required"),
  startTime:   z.string().min(1, "Start time required"),
  endTime:     z.string().min(1, "End time required"),
  clientName:  z.string().min(2, "Client name required"),
  clientPhone: z.string().min(10, "Valid phone number required"),
  guestCount:  z.coerce.number().min(1, "Guest count required"),
  totalAmount: z.coerce.number().min(1, "Total amount required"),
  depositPaid: z.coerce.number().min(0),
  notes:       z.string().default(""),
  status:      z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
})
export type EventFormValues = z.infer<typeof eventSchema>

// ── Inventory Item ────────────────────────────────────────────────────────────
export const inventorySchema = z.object({
  name:        z.string().min(2, "Name required"),
  unit:        z.string().min(1, "Unit required"),
  quantity:    z.coerce.number().min(0),
  minQuantity: z.coerce.number().min(1, "Minimum stock level required"),
  costPerUnit: z.coerce.number().min(0),
})
export type InventoryFormValues = z.infer<typeof inventorySchema>

// ── User / Staff ──────────────────────────────────────────────────────────────
export const userSchema = z.object({
  name:  z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  role:  z.enum(["admin", "manager", "cashier", "waiter", "kitchen"]),
  pin:   z.string().min(4, "PIN must be 4–6 digits").max(6),
})
export type UserFormValues = z.infer<typeof userSchema>
