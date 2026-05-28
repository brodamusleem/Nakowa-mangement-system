import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/PageHeader"
import { CreditCard, Check } from "lucide-react"
import { useUnpaidOrders, useCompletePayment } from "@/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Receipt } from "@/lib/Receipt"
import { useAuthStore } from "@/state/authStore"
import type { Order } from "@/types/orderTypes"
import type { Transaction } from "@/types/analyticsTypes"

export default function CheckoutPage() {
  const { data: orders = [], isLoading } = useUnpaidOrders()
  const completePayment = useCompletePayment()
  const { user } = useAuthStore()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash")
  const [amountReceived, setAmountReceived] = useState("")
  const [receipt, setReceipt] = useState<{ order: Order; transaction: Transaction } | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    )
  }

  const change = selectedOrder
    ? Math.max(0, (parseInt(amountReceived) || 0) - (selectedOrder.total || 0))
    : 0

  const handleCompletePayment = async () => {
    if (!selectedOrder || !user) return
    try {
      const txn = await completePayment.mutateAsync({
        order: selectedOrder,
        paymentMethod,
        amountGiven: parseInt(amountReceived) || selectedOrder.total,
        cashierId: user.id,
        cashierName: user.name,
      })
      setReceipt({ order: selectedOrder, transaction: txn })
      setSelectedOrder(null)
      setAmountReceived("")
    } catch (error) {
      console.error("Payment failed:", error)
    }
  }

  if (receipt) {
    return (
      <Receipt
        order={receipt.order}
        transaction={receipt.transaction}
        onClose={() => {
          setReceipt(null)
          window.location.reload(); // Refresh to show updated unpaid orders
        }}
      />
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Checkout"
        icon={<CreditCard className="h-6 w-6" />}
        showBackButton={true}
        backTo="/cashier"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Orders List */}
        <div className="md:col-span-1 lg:col-span-1">
          <h2 className="font-semibold mb-3 text-sm md:text-base">Pending Orders ({orders.length})</h2>
          <div className="space-y-2">
            {orders.length === 0 ? (
              <Card className="p-3 text-center text-muted-foreground text-sm">
                No pending orders
              </Card>
            ) : (
              orders.map((order) => (
                <Card
                  key={order.id}
                  className={`p-3 cursor-pointer transition ${
                    selectedOrder?.id === order.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      {order.tableId && <p className="text-xs text-muted-foreground">Table {order.tableName || order.tableId}</p>}
                    </div>
                    <Badge>₦{order.total?.toLocaleString()}</Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Order Details and Checkout */}
        <div className="md:col-span-1 lg:col-span-2 space-y-4">
          {selectedOrder ? (
            <>
              {/* Order Info */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="text-2xl font-bold">{selectedOrder.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-lg font-semibold capitalize">{selectedOrder.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span className="font-medium">₦{(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₦{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (7.5%)</span>
                      <span>₦{selectedOrder.vat?.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">₦{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(["cash", "card", "mobile"] as const).map((method) => (
                    <div key={method} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={method}
                        name="payment"
                        value={method}
                        title={`Select ${method} payment`}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="cursor-pointer"
                      />
                      <Label htmlFor={method} className="cursor-pointer capitalize">
                        {method === "cash" ? "💵 Cash" : method === "card" ? "💳 Card" : "📱 Mobile Money"}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cash Amount */}
              {paymentMethod === "cash" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="amount" className="text-sm">Amount Received</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        className="mt-1 text-lg"
                        autoFocus
                      />
                    </div>
                    {amountReceived && (
                      <div className="space-y-1 text-sm bg-accent/5 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <span>Amount Due:</span>
                          <span className="font-medium">₦{selectedOrder.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount Received:</span>
                          <span className="font-medium">₦{parseInt(amountReceived) || 0}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 text-success">
                          <span>Change:</span>
                          <span>₦{change.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Checkout Button */}
              <Button
                className="w-full gap-2 text-base h-12"
                size="lg"
                disabled={(paymentMethod === "cash" && !amountReceived) || completePayment.isPending}
                onClick={handleCompletePayment}
              >
                <Check className="h-5 w-5" />
                {completePayment.isPending ? "Processing..." : "Complete Payment"}
              </Button>
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Select an order to proceed with checkout</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}