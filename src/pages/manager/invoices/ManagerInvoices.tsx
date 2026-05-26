import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, Eye, DollarSign, Calendar, User } from "lucide-react";
import { useOrders, useTransactions } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, string> = {
  paid: "bg-success/10 text-success",
  refunded: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
};

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: string;
  date: string;
  clientName?: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
}

export default function ManagerInvoices() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: transactions = [], isLoading: transLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Generate invoices from completed orders and transactions
  const invoices: Invoice[] = useMemo(() => {
    return orders
      .filter((order) => order.status === "completed" && order.paymentStatus === "paid")
      .map((order) => ({
        id: order.id,
        invoiceNumber: `INV-${order.orderNumber}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        status: "completed",
        date: order.updatedAt,
        clientName: order.tableName || order.type,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.vat,
        total: order.total,
      }));
  }, [orders]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return invoices;

    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.orderNumber.toLowerCase().includes(term) ||
        inv.clientName?.toLowerCase().includes(term)
    );
  }, [invoices, searchTerm]);

  const stats = useMemo(() => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const completedCount = invoices.filter((inv) => inv.status === "completed").length;

    return {
      totalInvoices: invoices.length,
      completedInvoices: completedCount,
      totalAmount,
      avgInvoiceValue: completedCount > 0 ? totalAmount / completedCount : 0,
    };
  }, [invoices]);

  const downloadInvoice = (invoice: Invoice) => {
    const invoiceHTML = generateInvoiceHTML(invoice);
    const element = document.createElement("a");
    const file = new Blob([invoiceHTML], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.invoiceNumber}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) return;

    const invoiceHTML = generateInvoiceHTML(invoice);
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  if (ordersLoading || transLoading) {
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
    );
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
          ← Back to Invoices
        </Button>

        {/* Invoice Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedInvoice.invoiceNumber}</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => printInvoice(selectedInvoice)}
                >
                  <Eye className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => downloadInvoice(selectedInvoice)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white rounded-lg font-mono text-sm space-y-4">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <p className="text-xl font-bold">NAKOWA</p>
              <p className="text-xs text-muted-foreground">Restaurant & Cafe</p>
            </div>

            {/* Invoice Info */}
            <div className="flex justify-between text-xs">
              <div>
                <p className="font-semibold">Invoice #: {selectedInvoice.invoiceNumber}</p>
                <p>Order #: {selectedInvoice.orderNumber}</p>
              </div>
              <div className="text-right">
                <p>Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                <p>Time: {new Date(selectedInvoice.date).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-b py-3">
              <div className="flex justify-between text-xs font-semibold mb-2 pb-2 border-b">
                <span>Item</span>
                <span>Qty × Price</span>
                <span>Total</span>
              </div>
              {selectedInvoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1">
                  <span>{item.name}</span>
                  <span>{item.qty} × ₦{item.price.toLocaleString()}</span>
                  <span className="font-semibold">₦{(item.qty * item.price).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₦{selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (7.5%):</span>
                <span>₦{selectedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-2">
                <span>TOTAL:</span>
                <span>₦{selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground border-t pt-3">
              <p>Thank you for your business!</p>
              <p>Please retain this invoice for your records</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Invoices</h1>
        <p className="text-sm text-muted-foreground md:text-base">Manage and track all customer invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Invoices</p>
            <p className="text-xl font-bold md:text-2xl">{stats.totalInvoices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Amount</p>
            <p className="text-lg font-bold md:text-xl">₦{(stats.totalAmount / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Average Value</p>
            <p className="text-lg font-bold md:text-xl">₦{(stats.avgInvoiceValue / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Completed</p>
            <p className="text-lg font-bold text-success md:text-xl">{stats.completedInvoices}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by invoice, order number, or client..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Invoices List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No invoices found</p>
          </Card>
        ) : (
          filtered.map((invoice) => (
            <Card
              key={invoice.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition"
              onClick={() => setSelectedInvoice(invoice)}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">{invoice.invoiceNumber}</span>
                    <Badge className={statusConfig[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground md:flex md:gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {invoice.clientName}
                    </div>
                    <div className="text-xs">
                      {invoice.items.length} items
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-start md:items-end">
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <DollarSign className="h-4 w-4" />
                    ₦{invoice.total.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        printInvoice(invoice);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      Print
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadInvoice(invoice);
                      }}
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function generateInvoiceHTML(invoice: Invoice): string {
  const itemsHTML = invoice.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center">${item.qty}</td>
      <td style="text-align: right">₦${item.price.toLocaleString()}</td>
      <td style="text-align: right">₦${(item.qty * item.price).toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        .invoice {
          border: 1px solid #ddd;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          font-size: 12px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        .items-table th {
          background: #f5f5f5;
          padding: 10px;
          text-align: left;
          border-bottom: 2px solid #ddd;
        }
        .items-table td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .totals {
          margin: 30px 0;
          text-align: right;
          font-size: 12px;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          margin: 5px 0;
        }
        .total-amount {
          font-weight: bold;
          font-size: 16px;
          padding-top: 10px;
          border-top: 2px solid #ddd;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 11px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>NAKOWA</h1>
          <p>Restaurant & Cafe</p>
        </div>

        <div class="invoice-info">
          <div>
            <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
            <strong>Order #:</strong> ${invoice.orderNumber}<br>
          </div>
          <div style="text-align: right">
            <strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}<br>
            <strong>Time:</strong> ${new Date(invoice.date).toLocaleTimeString()}<br>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center">Qty</th>
              <th style="text-align: right">Price</th>
              <th style="text-align: right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₦${invoice.subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Tax (7.5%):</span>
            <span>₦${invoice.tax.toLocaleString()}</span>
          </div>
          <div class="total-row total-amount">
            <span>TOTAL:</span>
            <span>₦${invoice.total.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Please retain this invoice for your records</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
