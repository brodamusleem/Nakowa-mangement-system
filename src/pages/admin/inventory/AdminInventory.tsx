import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, AlertTriangle, TrendingDown, Edit2 } from "lucide-react"
import { useInventory, useLowStockItems, useRestockItem } from "@/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const statusConfig = {
  "in-stock": { color: "bg-success/10 text-success border-success/20", label: "In Stock", icon: "✓" },
  "low-stock": { color: "bg-warning/10 text-warning border-warning/20", label: "Low Stock", icon: "!" },
  "out-of-stock": { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Out", icon: "✕" },
}

function getInventoryStatus(quantity: number, reorderLevel: number): "in-stock" | "low-stock" | "out-of-stock" {
  if (quantity === 0) return "out-of-stock"
  if (quantity <= reorderLevel) return "low-stock"
  return "in-stock"
}

export default function AdminInventory() {
  const { data: inventory = [], isLoading } = useInventory()
  const { data: lowStock = [] } = useLowStockItems()
  const restockItem = useRestockItem()
  const [searchTerm, setSearchTerm] = useState("")
  const [restockModal, setRestockModal] = useState<{ itemId: string; itemName: string } | null>(null)
  const [restockAmount, setRestockAmount] = useState("")

  const filtered = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = inventory.filter((i) => getInventoryStatus(i.quantity, i.reorderLevel) !== "in-stock").length
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.cost, 0)

  const handleRestock = async () => {
    if (!restockModal || !restockAmount) {
      toast.error("Please enter restock amount")
      return
    }

    try {
      await restockItem.mutateAsync({
        id: restockModal.itemId,
        amount: Number(restockAmount),
      })
      toast.success(`${restockModal.itemName} restocked successfully`)
      setRestockModal(null)
      setRestockAmount("")
    } catch (error) {
      toast.error("Failed to restock item")
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
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Inventory Management</h1>
          <p className="text-sm text-muted-foreground md:text-base">Track and manage stock levels</p>
        </div>
        <Button className="w-full gap-2 md:w-auto">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
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
            <p className="text-xs text-muted-foreground md:text-sm">Total Value</p>
            <p className="text-lg font-bold md:text-xl">₦{(totalValue / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Out of Stock</p>
            <p className="text-xl font-bold text-destructive md:text-2xl">
              {inventory.filter((i) => getInventoryStatus(i.quantity, i.reorderLevel) === "out-of-stock").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts Section */}
      {lowStock && lowStock.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-warning">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-warning/20 bg-white p-3 dark:bg-slate-950">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} left (Reorder: {item.reorderLevel})
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setRestockModal({ itemId: item.id, itemName: item.name })}
                  >
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items or category..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <div className="space-y-2">
          {filtered.map((item) => (
            <Card key={item.id} className="p-3 md:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm md:text-base">{item.name}</div>
                  <div className="text-xs text-muted-foreground md:text-sm">{item.category}</div>
                </div>
                <div className="flex items-center justify-between gap-2 md:gap-4 flex-wrap">
                  <div className="text-right">
                    <div className="font-semibold text-sm md:text-base">{item.quantity}</div>
                    <div className="text-xs text-muted-foreground">{item.unit}</div>
                  </div>
                  <Badge className={statusConfig[getInventoryStatus(item.quantity, item.reorderLevel)].color}>
                    {statusConfig[getInventoryStatus(item.quantity, item.reorderLevel)].label}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    {getInventoryStatus(item.quantity, item.reorderLevel) !== "in-stock" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setRestockModal({ itemId: item.id, itemName: item.name })}
                      >
                        <TrendingDown className="h-3 w-3" />
                        Restock
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Restock Modal */}
      <Dialog open={!!restockModal} onOpenChange={(open) => !open && setRestockModal(null)}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add stock for {restockModal?.itemName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Quantity to Add</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestock} disabled={restockItem.isPending}>
              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}