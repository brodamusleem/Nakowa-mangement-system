export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
export type KitchenStatus = "pending" | "preparing" | "ready";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type OrderType = "dine-in" | "takeaway";

export interface OrderItem {
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableId: string | null;
  tableName: string | null;
  waiterId: string;
  waiterName: string;
  status: OrderStatus;
  kitchenStatus: KitchenStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  type: OrderType;
  tableId: string | null;
  tableName: string | null;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
}
