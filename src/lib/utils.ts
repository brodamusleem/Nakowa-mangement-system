import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui cn helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format Naira currency: 2500 → ₦2,500 */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** Format date string to readable: "2024-05-24T10:15:00Z" → "May 24, 2024 10:15 AM" */
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  });
}

/** Short date: "May 24" */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

/** Get initials from a full name: "Amaka Obi" → "AO" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

/** VAT calculation: 7.5% */
export function calcVAT(subtotal: number): number {
  return Math.round(subtotal * 0.075);
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/** Check if stock is low */
export function isLowStock(quantity: number, minQuantity: number): boolean {
  return quantity <= minQuantity;
}

/** Order status colour map for badges */
export const orderStatusColor: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ready:     "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const tableStatusColor: Record<string, string> = {
  available: "bg-green-100 text-green-800 border-green-200",
  occupied:  "bg-red-100 text-red-800 border-red-200",
  reserved:  "bg-yellow-100 text-yellow-800 border-yellow-200",
};
