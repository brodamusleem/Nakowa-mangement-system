import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/state/context/AuthContext"
import { useCategories, useCreateOrder, useMenuItems, useTables } from "@/api/hooks"
import type { MenuItem } from "@/types/menuTypes"
import type { OrderType } from "@/types/orderTypes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/PageHeader"
import { ShoppingCart, Plus, Minus, Trash2, Search } from "lucide-react"

interface CartItem extends MenuItem {
  quantity: number
}

const orderTypes: OrderType[] = ["dine-in", "takeaway"]

export default function POSPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: categories = [] } = useCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const { data: menuItems = [], isLoading: loadingMenu } = useMenuItems(selectedCategoryId || undefined)
  const { data: tables = [] } = useTables()
  const createOrder = useCreateOrder()

  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [orderType, setOrderType] = useState<OrderType>("dine-in")
  const [tableId, setTableId] = useState<string | null>(null)

  const filteredMenu = useMemo(
    () =>
      menuItems
        .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((item) => ({
          ...item,
          category: categories.find((category) => category.id === item.categoryId)?.name ?? "Other",
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [menuItems, searchTerm, categories]
  )

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id))
    } else {
      setCart((prev) => prev.map((c) => (c.id === id ? { ...c, quantity } : c)))
    }
  }

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

  const handleCheckout = () => {
    if (cart.length === 0) return
    if (orderType === "dine-in" && !tableId) {
      alert("Please select a table for dine-in orders.")
      return
    }

    createOrder.mutate(
      {
        type: orderType,
        tableId: orderType === "dine-in" ? tableId : null,
        tableName:
          orderType === "dine-in"
            ? tables.find((table) => table.id === tableId)?.name ?? null
            : null,
        waiterId: user?.id ?? "unknown",
        waiterName: user?.name ?? "Guest",
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
          note: "",
        })),
      },
      {
        onSuccess: () => {
          setCart([])
          navigate("/cashier/checkout")
        },
        onError: () => {
          alert("Unable to place order. Please try again.")
        },
      }
    )
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <PageHeader
        title="POS Order Entry"
        icon={<ShoppingCart className="h-6 w-6" />}
        showBackButton={true}
        backTo="/cashier"
        rightContent={
          <div className="flex flex-wrap gap-2">
            {orderTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={orderType === type ? "default" : "outline"}
                onClick={() => setOrderType(type)}
              >
                {type === "dine-in" ? "Dine-in" : "Takeaway"}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => setSelectedCategoryId(null)}
              className="whitespace-nowrap"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategoryId(category.id)}
                className="whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
            {loadingMenu ? (
              <div className="col-span-full rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Loading menu...
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="col-span-full rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                No items found.
              </div>
            ) : (
              filteredMenu.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition hover:shadow-md ${item.available ? "" : "opacity-50"}`}
                  onClick={() => item.available && addToCart(item)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.category}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-snug md:text-base">{item.name}</p>
                    <p className="mt-3 text-lg font-bold text-primary">₦{item.price.toLocaleString()}</p>
                    {!item.available && (
                      <Badge variant="destructive" className="mt-3 text-xs">
                        Out of stock
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Order type</p>
                  <p className="font-medium">{orderType === "dine-in" ? "Dine-in" : "Takeaway"}</p>
                </div>
                {orderType === "dine-in" && (
                  <div>
                    <p className="text-xs text-muted-foreground">Table</p>
                    <Select value={tableId ?? ""} onValueChange={(value) => setTableId(value || null)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.name} ({table.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Add items to begin your order.</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-muted-foreground">₦{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => updateQuantity(item.id, 0)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₦{total.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>VAT (7.5%)</span>
                      <span>₦{Math.round(total * 0.075).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>₦{(total + Math.round(total * 0.075)).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={cart.length === 0 || (orderType === "dine-in" && !tableId)}
                    onClick={handleCheckout}
                  >
                    Submit Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
