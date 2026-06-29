import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer, X } from "lucide-react"
import type { Order } from "@/types/orderTypes"
import type { Transaction } from "@/types/analyticsTypes"

interface ReceiptProps {
  order: Order
  transaction: Transaction
  onClose: () => void
}

export function Receipt({ order, transaction, onClose }: ReceiptProps) {
  const printReceipt = () => {
    const printWindow = window.open("", "", "height=500,width=500")
    if (!printWindow) return

    const receiptHTML = generateReceiptHTML(order, transaction)
    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  const downloadReceipt = () => {
    const element = document.createElement("a")
    const receiptHTML = generateReceiptHTML(order, transaction)
    const file = new Blob([receiptHTML], { type: "text/html" })
    element.href = URL.createObjectURL(file)
    element.download = `receipt-${order.orderNumber}-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle>Receipt</CardTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            title="Close receipt"
            aria-label="Close receipt"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Receipt Preview */}
          <div className="receipt-preview bg-white border rounded-lg p-4 text-sm font-mono space-y-2 text-center">
            <div className="text-lg font-bold">NAKOWA</div>
            <div className="text-xs text-muted-foreground">Restaurant & Cafe</div>
            <div className="border-b border-dashed py-2" />

            <div className="text-left space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Order #:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="capitalize">{order.type}</span>
              </div>
              {order.tableId && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span>{order.tableName || order.tableId}</span>
                </div>
              )}
            </div>

            <div className="border-b border-dashed py-2" />

            {/* Items */}
            <div className="space-y-1 text-xs">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <div className="text-left">
                    <span>{item.qty}x {item.name}</span>
                    {item.note && <div className="text-muted-foreground text-xs ml-2">{item.note}</div>}
                  </div>
                  <span className="font-medium">₦{(item.qty * item.price).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed py-2" />

            {/* Totals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7.5%):</span>
                <span>₦{order.vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>₦{order.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-b border-dashed py-2" />

            {/* Payment Info */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize">{transaction.method}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>₦{transaction.amount.toLocaleString()}</span>
              </div>
              {transaction.change > 0 && (
                <div className="flex justify-between font-bold text-success">
                  <span>Change:</span>
                  <span>₦{transaction.change.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="text-xs">{transaction.reference}</span>
              </div>
            </div>

            <div className="border-b border-dashed py-2" />
            <div className="text-xs text-muted-foreground">
              <p>Thank you for your purchase!</p>
              <p>Please visit us again</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={printReceipt}
              className="flex-1 gap-2"
              variant="outline"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={downloadReceipt}
              className="flex-1 gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function generateReceiptHTML(order: Order, transaction: Transaction): string {
  const itemsHTML = order.items
    ?.map(
      (item) => `
    <tr>
      <td>${item.qty}x ${item.name}</td>
      <td style="text-align: right">₦${(item.qty * item.price).toLocaleString()}</td>
    </tr>
  `
    )
    .join("") || ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt ${order.orderNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace
          max-width: 300px
          margin: 0 auto
          padding: 20px
          background: white
        }
        .receipt {
          text-align: center
          border: 1px solid #000
          padding: 15px
        }
        .header {
          font-size: 16px
          font-weight: bold
          margin-bottom: 5px
        }
        .subheader {
          font-size: 12px
          color: #666
          margin-bottom: 10px
        }
        .divider {
          border-top: 1px dashed #000
          margin: 10px 0
        }
        .items {
          text-align: left
          margin: 10px 0
          font-size: 12px
        }
        .item-row {
          display: flex
          justify-content: space-between
        }
        .totals {
          text-align: left
          margin: 10px 0
          font-size: 12px
        }
        .total-row {
          display: flex
          justify-content: space-between
          font-weight: bold
        }
        .footer {
          text-align: center
          font-size: 11px
          color: #666
          margin-top: 10px
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">NAKOWA</div>
        <div class="subheader">Restaurant & Cafe</div>
        <div class="divider"></div>

        <div style="text-align: left; font-size: 12px; margin: 10px 0;">
          <div>Order #: <strong>${order.orderNumber}</strong></div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>Time: ${new Date().toLocaleTimeString()}</div>
          <div>Type: ${order.type}</div>
          ${order.tableId ? `<div>Table: ${order.tableName || order.tableId}</div>` : ""}
        </div>

        <div class="divider"></div>

        <div class="items">
          ${itemsHTML}
        </div>

        <div class="divider"></div>

        <div class="totals">
          <div class="item-row">
            <span>Subtotal:</span>
            <span>₦${order.subtotal.toLocaleString()}</span>
          </div>
          <div class="item-row">
            <span>VAT (7.5%):</span>
            <span>₦${order.vat.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>TOTAL:</span>
            <span>₦${order.total.toLocaleString()}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div style="text-align: left; font-size: 12px;">
          <div>Payment: ${transaction.method}</div>
          <div>Amount: ₦${transaction.amount.toLocaleString()}</div>
          ${transaction.change > 0 ? `<div>Change: ₦${transaction.change.toLocaleString()}</div>` : ""}
          <div>Ref: ${transaction.reference}</div>
        </div>

        <div class="divider"></div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>Please visit us again</p>
        </div>
      </div>
    </body>
    </html>
  `
}
