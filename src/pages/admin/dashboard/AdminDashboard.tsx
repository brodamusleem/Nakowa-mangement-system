import { TrendingUp, ShoppingBag, Users, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemHealth } from "@/components/SystemHealth";
import { useAnalyticsSummary, useAnalyticsMonthly, useLowStockItems } from "@/api/hooks";
import { AdminStatsSkeleton, AdminChartSkeleton } from "@/lib/adminShimmer/AdminShimmer";
import { formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
  const { data: monthly, isLoading: loadingMonthly } = useAnalyticsMonthly();
  const { data: lowStock }                            = useLowStockItems();

  const stats = [
    {
      label: "Today's Sales",
      value: formatNaira(summary?.totalSales ?? 0),
      sub:   "+15% from yesterday",
      icon:  TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Total Orders",
      value: String(summary?.totalOrders ?? 0),
      sub:   `${summary?.pendingOrders ?? 0} pending`,
      icon:  ShoppingBag,
      color: "text-blue-600",
    },
    {
      label: "Customers Today",
      value: String(summary?.totalCustomers ?? 0),
      sub:   "+8% this month",
      icon:  Users,
      color: "text-purple-600",
    },
    {
      label: "Confirmed Events",
      value: String(summary?.confirmedEvents ?? 0),
      sub:   "This month",
      icon:  CalendarCheck,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* System Health Monitor */}
      <SystemHealth />

      {/* Stat cards */}
      {loadingSummary ? (
        <AdminStatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sales chart + low stock */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          {loadingMonthly ? (
            <AdminChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales Overview — This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthly?.salesByDay ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [formatNaira(v), "Sales"]} />
                    <Line
                      type="monotone" dataKey="sales"
                      stroke="hsl(var(--primary))" strokeWidth={2} dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Low stock alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!lowStock?.length ? (
              <p className="text-sm text-muted-foreground">All stock levels are good ✓</p>
            ) : (
              lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} left
                    </p>
                  </div>
                  <Badge variant="destructive">Low</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
