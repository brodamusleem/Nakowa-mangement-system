import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts"
import { useAnalyticsSummary, useAnalyticsMonthly, useOrders, useTransactions } from "@/api/hooks"

const chartColors = ["hsl(280 100% 50%)", "hsl(260 80% 60%)", "hsl(175 50% 42%)", "hsl(48 100% 55%)"]

export default function ManagerReports() {
  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary()
  const { data: monthly, isLoading: loadingMonthly } = useAnalyticsMonthly()
  const { data: orders = [], isLoading: loadingOrders } = useOrders()
  const { data: transactions = [], isLoading: loadingTransactions } = useTransactions()

  const isLoading = loadingSummary || loadingMonthly || loadingOrders || loadingTransactions

  const weeklyData = monthly?.salesByDay ?? []
  const totalRevenue = summary?.totalSales ?? transactions.reduce((sum, txn) => sum + txn.amount, 0)
  const orderCount = summary?.totalOrders ?? orders.length
  const growth = summary?.netProfit && summary.totalSales ? Math.round((summary.netProfit / summary.totalSales) * 100) : 0
  const averageDaily = weeklyData.length > 0 ? Math.round(weeklyData.reduce((sum, day) => sum + day.sales, 0) / weeklyData.length) : Math.round((totalRevenue || 0) / 7)

  const typeBreakdown = useMemo(
    () => {
      const counts = orders.reduce(
        (acc, order) => {
          acc[order.type] = (acc[order.type] || 0) + 1
          return acc
        },
        { "dine-in": 0, takeaway: 0 }
      )

      return [
        { name: "Dine In", value: counts["dine-in"] },
        { name: "Takeaway", value: counts.takeaway },
      ]
    },
    [orders]
  )

  const topItems = useMemo(() => {
    const itemsMap = new Map<string, { name: string; qty: number; sales: number }>()
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = itemsMap.get(item.name) ?? { name: item.name, qty: 0, sales: 0 }
        existing.qty += item.qty
        existing.sales += item.price * item.qty
        itemsMap.set(item.name, existing)
      })
    })

    return Array.from(itemsMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)
      .map((item) => ({
        name: item.name,
        sales: item.qty,
        revenue: item.sales,
        trend: `${Math.round((item.qty / Math.max(1, orders.length)) * 100)}%`,
      }))
  }, [orders])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground md:text-base">Live revenue, order, and POS analytics from the backend.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Revenue</p>
            <p className="text-lg font-bold md:text-2xl">₦{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Orders</p>
            <p className="text-lg font-bold md:text-2xl">{orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Profit Margin</p>
            <p className="text-lg font-bold md:text-2xl">{loadingSummary ? "..." : `${growth}%`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Avg Daily Revenue</p>
            <p className="text-lg font-bold md:text-2xl">₦{averageDaily.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke={chartColors[0]} strokeWidth={2} name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={typeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {typeBreakdown.map((entry, index) => (
                    <Cell key={`type-${entry.name}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} orders`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No item sales found yet.</p>
              ) : (
                topItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm md:text-base">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sales} sold for ₦{item.revenue.toLocaleString()}</p>
                    </div>
                    <span className="text-sm font-bold text-success">{item.trend}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cashier & POS Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">Paid transactions</p>
              <p className="font-semibold">{transactions.length}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Active cashiers</p>
              <p className="font-semibold">{Array.from(new Set(transactions.map((txn) => txn.cashierName))).length}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Last transaction</p>
              <p className="font-semibold">{transactions[0] ? new Date(transactions[0].createdAt).toLocaleDateString() : "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
