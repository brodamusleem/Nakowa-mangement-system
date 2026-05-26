import { create } from "zustand";
import type { OrderItem } from "@/types/orderTypes";
import type { Table } from "@/types/menuTypes";
import { calcVAT } from "@/lib/utils";

interface CartStore {
  items:         OrderItem[];
  selectedTable: Table | null;
  orderType:     "dine-in" | "takeaway";

  // Actions
  setOrderType:     (type: "dine-in" | "takeaway") => void;
  setSelectedTable: (table: Table | null) => void;
  addItem:          (item: Omit<OrderItem, "note"> & { note?: string }) => void;
  removeItem:       (menuItemId: string) => void;
  updateQty:        (menuItemId: string, qty: number) => void;
  updateNote:       (menuItemId: string, note: string) => void;
  clearCart:        () => void;

  // Computed
  subtotal: () => number;
  vat:      () => number;
  total:    () => number;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items:         [],
  selectedTable: null,
  orderType:     "dine-in",

  setOrderType: (orderType) => set({ orderType }),

  setSelectedTable: (selectedTable) => set({ selectedTable }),

  addItem: (item) =>
    set((state) => {
      const exists = state.items.find((i) => i.menuItemId === item.menuItemId);
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.menuItemId === item.menuItemId ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { note: "", ...item }] };
    }),

  removeItem: (menuItemId) =>
    set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),

  updateQty: (menuItemId, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.menuItemId !== menuItemId)
          : state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, qty } : i)),
    })),

  updateNote: (menuItemId, note) =>
    set((state) => ({
      items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, note } : i)),
    })),

  clearCart: () => set({ items: [], selectedTable: null, orderType: "dine-in" }),

  subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
  vat:      () => calcVAT(get().subtotal()),
  total:    () => get().subtotal() + get().vat(),
}));
