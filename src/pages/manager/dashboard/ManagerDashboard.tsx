import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, ShoppingCart, Clock, ArrowRight, DollarSign, CalendarCheck } from "lucide-react";
import { useAnalyticsSummary, useAnalyticsMonthly, useEvents, useTransactions } from "@/api/hooks";

const fallbackSalesData = [
  { date: "Mon", sales: 120000 },
  { date: "Tue", sales: 135000 },
  { date: "Wed", sales: 145000 },
  { date: "Thu", sales: 160000 },
  { date: "Fri", sales: 195000 },
  { date: "Sat", sales: 240000 },
  { date: "Sun", sales: 185000 },
];

const transactionPalette = ["hsl(213 100% 50%)", "hsl(142 76% 36%)", "hsl(38 92% 50%)", "hsl(330 84% 55%)"];

export default function ManagerDashboard() {
  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
  const { data: monthly, isLoading: loadingMonthly } = useAnalyticsMonthly();
  const { data: transactions = [], isLoading: loadingTransactions } = useTransactions();
  const { data: events = [], isLoading: loadingEvents } = useEvents();

  const isLoading = loadingSummary || loadingMonthly || loadingTransactions || loadingEvents;
  const currentYear = new Date().getFullYear();

  const yearTransactions = useMemo(
    () => transactions.filter((txn) => new Date(txn.createdAt).getFullYear() === currentYear),
    [transactions, currentYear]
  );

  const paymentMethodBreakdown = useMemo(() => {
    const totals = yearTransactions.reduce(
      (acc, txn) => {
        const key = (txn.method as keyof typeof acc) ?? "other";
        acc[key] = (acc[key] || 0) + txn.amount;
        return acc;
      },
      { cash: 0, transfer: 0, card: 0, other: 0 }
    );

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [yearTransactions]);

  const eventPaymentSummary = useMemo(() => {
    const liveEvents = events.filter((event) => event.status !== "cancelled");
    const depositPaid = liveEvents.reduce((sum, event) => sum + event.depositPaid, 0);
    const totalValue = liveEvents.reduce((sum, event) => sum + event.totalAmount, 0);

    return {
      totalEvents: liveEvents.length,
      confirmedEvents: liveEvents.filter((event) => event.status === "confirmed").length,
      depositPaid,
      outstandingBalance: totalValue - depositPaid,
      totalValue,
    };
  }, [events]);

  const salesTimeline = monthly?.salesByDay?.length ? monthly.salesByDay : fallbackSalesData;
  const annualRevenue = yearTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const monthlyRevenue = monthly?.totalSales ?? 0;
  const monthlyProfit = monthly?.netProfit ?? 0;
  const todayRevenue = summary?.totalSales ?? 0;
  const totalOrders = summary?.totalOrders ?? 0;
  const activeCustomers = summary?.totalCustomers ?? 0;
  const avgOrderTime = 18;

  const managerRoutes = [
    { label: "Dashboard", href: "/manager", description: "Overview and analytics", icon: TrendingUp },
    { label: "Orders", href: "/manager/orders", description: "Track order flow", icon: ShoppingCart },
    { label: "Reports", href: "/manager/reports", description: "Revenue and performance", icon: Users },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground md:text-base">Operational overview and quick access to manager workflows</p>
      </div>

      {/* Manager routes */}
      <div className="grid gap-3 md:grid-cols-3">
        {managerRoutes.map((route) => {
          const Icon = route.icon;
          return (
            <Card key={route.href} className="group">
              <CardContent className="flex h-full flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{route.label}</p>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{route.description}</p>
                </div>
                <Link
                  to={route.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
                >
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Today's Revenue</p>
                <p className="text-lg font-bold md:text-2xl">
                  {isLoading ? "Loading..." : `₦${Math.round(todayRevenue).toLocaleString()}`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Total Orders</p>
                <p className="text-lg font-bold md:text-2xl">{isLoading ? "..." : totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Active Customers</p>
                <p className="text-lg font-bold md:text-2xl">{activeCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Avg Order Time</p>
                <p className="text-lg font-bold md:text-2xl">{avgOrderTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Sales Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="hsl(213 100% 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">Total events</p>
              <p className="font-semibold">{eventPaymentSummary.totalEvents}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Confirmed events</p>
              <p className="font-semibold">{eventPaymentSummary.confirmedEvents}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Deposits received</p>
              <p className="font-semibold">₦{eventPaymentSummary.depositPaid.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Total event value</p>
              <p className="font-semibold">₦{eventPaymentSummary.totalValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Transaction Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={paymentMethodBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {paymentMethodBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={transactionPalette[index % transactionPalette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Important Manager Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">Pending orders</p>
              <p className="font-semibold">{summary?.pendingOrders ?? "--"}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Confirmed events</p>
              <p className="font-semibold">{summary?.confirmedEvents ?? "--"}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Low stock alerts</p>
              <p className="font-semibold">{summary?.lowStockCount ?? "--"}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Paid transactions</p>
              <p className="font-semibold">{summary?.totalTransactions ?? transactions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
