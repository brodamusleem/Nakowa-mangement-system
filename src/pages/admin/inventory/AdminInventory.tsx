import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertTriangle, TrendingDown } from "lucide-react";
import { useInventory } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  "in-stock": { color: "bg-success/10 text-success border-success/20", label: "In Stock", icon: "✓" },
  "low-stock": { color: "bg-warning/10 text-warning border-warning/20", label: "Low Stock", icon: "!" },
  "out-of-stock": { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Out", icon: "✕" },
};

function getInventoryStatus(quantity: number, reorderLevel: number): "in-stock" | "low-stock" | "out-of-stock" {
  if (quantity === 0) return "out-of-stock";
  if (quantity <= reorderLevel) return "low-stock";
  return "in-stock";
}

export default function AdminInventory() {
  const { data: inventory = [], isLoading } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventory.filter((i) => getInventoryStatus(i.quantity, i.reorderLevel) !== "in-stock").length;
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.cost, 0);

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
    );
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
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-sm md:text-base">{item.quantity}</div>
                    <div className="text-xs text-muted-foreground">{item.unit}</div>
                  </div>
                  <Badge className={statusConfig[getInventoryStatus(item.quantity, item.reorderLevel)].color}>
                    {statusConfig[getInventoryStatus(item.quantity, item.reorderLevel)].label}
                  </Badge>
                  <Button size="sm" variant="outline" className="text-xs">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}