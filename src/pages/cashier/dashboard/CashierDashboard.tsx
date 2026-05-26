import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { ShoppingCart, CreditCard, History, TrendingUp } from "lucide-react";
import {
  useUnpaidOrders,
  useTransactions,
  useAnalyticsSummary,
} from "@/api/hooks";
import { useAuthStore } from "@/state/authStore";

export default function CashierDashboard() {
  const { user } = useAuthStore();
  const { data: unpaidOrders = [] } = useUnpaidOrders();
  const { data: transactions = [] } = useTransactions();
  const { data: analytics } = useAnalyticsSummary();

  const todayTransactions = transactions.filter((t) => {
    const txnDate = new Date(t.createdAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    return txnDate === today;
  });

  const todayRevenue = todayTransactions
    .filter((t) => t.status === "paid" || t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const successfulTransactions = todayTransactions.filter(
    (t) => t.status === "paid" || t.status === "completed"
  ).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Cashier Dashboard"
        icon={<ShoppingCart className="h-6 w-6" />}
        showBackButton={false}
        rightContent={
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </p>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Pending Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unpaidOrders.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total: ₦{unpaidOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Today Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₦{(todayRevenue / 1000).toFixed(1)}k</p>
            <p className="text-xs text-success mt-1">{successfulTransactions} transactions</p>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total: ₦{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* All Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalOrders || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Sales: ₦{(analytics?.totalSales || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link to="/cashier/pos">
            <Button className="w-full gap-2 h-12" size="lg">
              <ShoppingCart className="h-5 w-5" />
              Create New Order
            </Button>
          </Link>
          <Link to="/cashier/checkout">
            <Button
              variant={unpaidOrders.length > 0 ? "default" : "outline"}
              className="w-full gap-2 h-12"
              size="lg"
            >
              <CreditCard className="h-5 w-5" />
              Process Payment ({unpaidOrders.length})
            </Button>
          </Link>
          <Link to="/cashier/transactions">
            <Button variant="outline" className="w-full gap-2 h-12" size="lg">
              <History className="h-5 w-5" />
              View Transactions
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Pending Orders */}
      {unpaidOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Pending Orders</h2>
          <div className="grid gap-3">
            {unpaidOrders.slice(0, 5).map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Order #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.type === "dine-in"
                        ? `Table ${order.tableName || order.tableId}`
                        : "Takeaway"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₦{order.total?.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {order.items?.length || 0} items
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Today's Transactions Summary */}
      {todayTransactions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Today's Transactions</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Completed</p>
                  <p className="text-2xl font-bold">{successfulTransactions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₦{(todayRevenue / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-bold">
                    ₦{(todayRevenue / Math.max(successfulTransactions, 1) / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Methods</p>
                  <p className="text-sm space-y-1">
                    {["cash", "card", "mobile"].map((method) => {
                      const count = todayTransactions.filter((t) => t.method === method).length;
                      return count > 0 ? (
                        <span key={method} className="block capitalize">
                          {method}: {count}
                        </span>
                      ) : null;
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
