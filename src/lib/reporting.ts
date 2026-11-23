import type { Order } from "@/types/orderTypes"

export type RevenueBucket = {
  date: string
  sales: number
  orders: number
}

export function getPaidOrders(orders: Order[]) {
  return orders.filter((order) => order.paymentStatus === "paid" && order.status !== "cancelled")
}

export function getActiveOrders(orders: Order[]) {
  return orders.filter((order) => order.status !== "cancelled")
}

export function getPaidRevenue(orders: Order[]) {
  return getPaidOrders(orders).reduce((sum, order) => sum + Number(order.total || 0), 0)
}

function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function dateForOrder(order: Order) {
  const date = new Date(order.createdAt)
  return Number.isNaN(date.getTime()) ? null : date
}

export function buildDailyRevenue(orders: Order[], days = 7, today = new Date()): RevenueBucket[] {
  const end = new Date(today)
  end.setHours(0, 0, 0, 0)
  const first = new Date(end)
  first.setDate(first.getDate() - days + 1)
  const buckets = new Map<string, RevenueBucket>()

  for (let index = 0; index < days; index += 1) {
    const date = new Date(first)
    date.setDate(first.getDate() + index)
    const key = localDateKey(date)
    buckets.set(key, {
      date: new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric" }).format(date),
      sales: 0,
      orders: 0,
    })
  }

  orders.forEach((order) => {
    const date = dateForOrder(order)
    if (!date) return
    const bucket = buckets.get(localDateKey(date))
    if (!bucket || order.status === "cancelled") return
    bucket.orders += 1
    if (order.paymentStatus === "paid") bucket.sales += Number(order.total || 0)
  })

  return Array.from(buckets.values())
}

export function buildWeeklyRevenue(orders: Order[], weeks = 6, today = new Date()): RevenueBucket[] {
  const currentWeek = new Date(today)
  currentWeek.setHours(0, 0, 0, 0)
  currentWeek.setDate(currentWeek.getDate() - ((currentWeek.getDay() + 6) % 7))
  currentWeek.setDate(currentWeek.getDate() - (weeks - 1) * 7)
  const buckets = new Map<string, RevenueBucket>()

  for (let index = 0; index < weeks; index += 1) {
    const start = new Date(currentWeek)
    start.setDate(currentWeek.getDate() + index * 7)
    const key = localDateKey(start)
    buckets.set(key, {
      date: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(start),
      sales: 0,
      orders: 0,
    })
  }

  orders.forEach((order) => {
    const date = dateForOrder(order)
    if (!date || order.status === "cancelled") return
    const weekStart = new Date(date)
    weekStart.setHours(0, 0, 0, 0)
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    const bucket = buckets.get(localDateKey(weekStart))
    if (!bucket) return
    bucket.orders += 1
    if (order.paymentStatus === "paid") bucket.sales += Number(order.total || 0)
  })

  return Array.from(buckets.values())
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompactNaira(value: number) {
  return `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`
}
