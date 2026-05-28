import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Clock } from "lucide-react"
import { useOrders } from "@/api/hooks"
import type { OrderStatus } from "@/types/orderTypes"

const statusConfig: Record<OrderStatus, { color: string; label: string }> = {
  pending: { color: "bg-warning/10 text-warning", label: "Pending" },
  preparing: { color: "bg-info/10 text-info", label: "Preparing" },
  ready: { color: "bg-success/10 text-success", label: "Ready" },
  completed: { color: "bg-success/10 text-success", label: "Completed" },
  cancelled: { color: "bg-destructive/10 text-destructive", label: "Cancelled" },
}

export default function ManagerOrders() {
  const { data: orders = [], isLoading } = useOrders()
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return orders

    return orders.filter((order) =>
      order.orderNumber.toLowerCase().includes(term) ||
      (order.tableName?.toLowerCase().includes(term) ?? false) ||
      order.items.some((item) => item.name.toLowerCase().includes(term)) ||
      order.type.toLowerCase().includes(term)
    )
  }, [orders, searchTerm])

  const statusOrder: Record<OrderStatus, number> = {
    pending: 0,
    preparing: 1,
    ready: 2,
    completed: 3,
    cancelled: 4,
  }

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]),
    [filtered]
  )

  const statusCounts = useMemo(
    () =>
      orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {} as Record<OrderStatus, number>),
    [orders]
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">All Orders</h1>
          <p className="text-sm text-muted-foreground md:text-base">Track and manage all orders from the live backend.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status} className="p-3">
            <p className="text-xs text-muted-foreground mb-1 capitalize">{config.label}</p>
            <p className="text-lg font-bold">{statusCounts[status as OrderStatus] ?? 0}</p>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order number, table, type, or item..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <Card className="p-6">
            <CardContent>Loading orders...</CardContent>
          </Card>
        ) : sorted.length === 0 ? (
          <Card className="p-6">
            <CardContent>No orders found.</CardContent>
          </Card>
        ) : (
          sorted.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm md:text-base">{order.orderNumber}</span>
                      <Badge variant="outline" className="text-xs">
                        {order.type.replace("-", " ")}
                      </Badge>
                      {order.tableName && (
                        <Badge variant="secondary" className="text-xs">
                          {order.tableName}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground md:text-sm mt-1">
                      {order.items.map((item) => `${item.qty}× ${item.name}`).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 md:text-sm">
                      Total: ₦{order.total.toLocaleString()} · Paid: {order.paymentStatus}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-start sm:items-end">
                    <div className="flex items-center gap-2">
                      {order.updatedAt && (
                        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(order.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      )}
                      <Badge className={statusConfig[order.status]?.color ?? "bg-muted text-muted-foreground"}>
                        {statusConfig[order.status]?.label ?? order.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      View details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
