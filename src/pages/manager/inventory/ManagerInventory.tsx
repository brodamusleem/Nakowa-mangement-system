import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, TrendingDown, RefreshCw } from "lucide-react"
import {
  useInventory,
  useRestockItem,
  useUpdateInventoryItem,
} from "@/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"

const statusConfig = {
  "in-stock": { color: "bg-success/10 text-success border-success/20", label: "In Stock", icon: "✓" },
  "low-stock": { color: "bg-warning/10 text-warning border-warning/20", label: "Low Stock", icon: "!" },
  "out-of-stock": { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Out", icon: "✕" },
}

function getInventoryStatus(quantity: number, minQuantity: number): "in-stock" | "low-stock" | "out-of-stock" {
  if (quantity === 0) return "out-of-stock"
  if (quantity <= minQuantity) return "low-stock"
  return "in-stock"
}

export default function ManagerInventory() {
  const { data: inventory = [], isLoading } = useInventory()
  const restockItem = useRestockItem()
  const updateInventoryItem = useUpdateInventoryItem()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [restockingId, setRestockingId] = useState<string | null>(null)
  const [restockAmount, setRestockAmount] = useState("")

  const filtered = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = inventory.filter(
    (i) => getInventoryStatus(i.quantity, i.minQuantity) !== "in-stock"
  ).length

  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0)
  const criticalItems = inventory.filter((i) => i.quantity === 0).length

  const handleRestock = (itemId: string) => {
    const amount = parseInt(restockAmount)
    if (amount > 0) {
      restockItem.mutate({ id: itemId, amount })
      setRestockingId(null)
      setRestockAmount("")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Inventory Management</h1>
          <p className="text-sm text-muted-foreground md:text-base">Monitor and restock items</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Items</p>
            <p className="text-xl font-bold md:text-2xl">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Low Stock</p>
            <p className="text-xl font-bold text-warning md:text-2xl">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Out of Stock</p>
            <p className="text-xl font-bold text-destructive md:text-2xl">{criticalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Value</p>
            <p className="text-lg font-bold md:text-xl">₦{(totalValue / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalItems > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-medium">{criticalItems} item(s) are out of stock</span>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No items found</p>
          </Card>
        ) : (
          filtered.map((item) => {
            const status = getInventoryStatus(item.quantity, item.minQuantity)
            const stockPercentage = (item.quantity / (item.minQuantity * 2)) * 100

            return (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge className={statusConfig[status].color}>{statusConfig[status].label}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Unit: {item.unit}</span>
                        <span>Cost per Unit: ₦{item.costPerUnit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Stock: {item.quantity} {item.unit}</span>
                        <span>Min. Level: {item.minQuantity} {item.unit}</span>
                      </div>
                    </div>

                    {/* Stock Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      {/* eslint-disable-next-line */}
                      <div
                        className={`h-full transition-all ${
                          status === "in-stock"
                            ? "bg-success"
                            : status === "low-stock"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                        title={`Stock level: ${Math.min(stockPercentage, 100).toFixed(0)}%`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 items-start md:items-center">
                    {restockingId === item.id ? (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={restockAmount}
                          onChange={(e) => setRestockAmount(e.target.value)}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRestock(item.id)}
                          disabled={restockItem.isPending}
                        >
                          {restockItem.isPending ? "..." : "Add"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRestockingId(null)
                            setRestockAmount("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setRestockingId(item.id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Restock
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
