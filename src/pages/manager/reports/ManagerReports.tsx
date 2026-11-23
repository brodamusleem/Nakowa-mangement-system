import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useOrders, useTransactions } from "@/api/hooks"
import { buildDailyRevenue, formatCompactNaira, formatNaira, getActiveOrders, getPaidOrders, getPaidRevenue } from "@/lib/reporting"

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]
const tooltipStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--card-foreground)",
}

export default function ManagerReports() {
  const { data: orders = [], isLoading: loadingOrders } = useOrders()
  const { data: transactions = [], isLoading: loadingTransactions } = useTransactions()
  const isLoading = loadingOrders || loadingTransactions

  const dailyData = buildDailyRevenue(orders, 7)
  const paidOrders = useMemo(() => getPaidOrders(orders), [orders])
  const activeOrders = useMemo(() => getActiveOrders(orders), [orders])
  const totalRevenue = getPaidRevenue(orders)
  const averagePaidOrder = paidOrders.length ? totalRevenue / paidOrders.length : 0
  const averageDaily = Math.round(dailyData.reduce((sum, day) => sum + day.sales, 0) / 7)

  const typeBreakdown = useMemo(() => {
    const counts = activeOrders.reduce(
      (acc, order) => {
        acc[order.type] += 1
        return acc
      },
      { "dine-in": 0, takeaway: 0 }
    )
    return [
      { name: "Dine In", value: counts["dine-in"] },
      { name: "Takeaway", value: counts.takeaway },
    ]
  }, [activeOrders])

  const topItems = useMemo(() => {
    const items = new Map<string, { name: string; qty: number; revenue: number }>()
    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = items.get(item.name) ?? { name: item.name, qty: 0, revenue: 0 }
        current.qty += item.qty
        current.revenue += item.price * item.qty
        items.set(item.name, current)
      })
    })
    return Array.from(items.values()).sort((a, b) => b.qty - a.qty).slice(0, 6)
  }, [paidOrders])

  const successfulTransactions = transactions.filter((transaction) =>
    transaction.status === "paid" || transaction.status === "completed"
  )
  const lastTransaction = [...successfulTransactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]
  const activeCashierCount = new Set(successfulTransactions.map((transaction) => transaction.cashierId).filter(Boolean)).size

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Revenue comes from paid orders; cancelled and unpaid orders are excluded from sales.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground md:text-sm">Revenue Received</p><p className="text-lg font-bold md:text-2xl">{isLoading ? "…" : formatNaira(totalRevenue)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground md:text-sm">Orders (excluding cancelled)</p><p className="text-lg font-bold md:text-2xl">{isLoading ? "…" : activeOrders.length.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground md:text-sm">Average Paid Order</p><p className="text-lg font-bold md:text-2xl">{isLoading ? "…" : formatNaira(averagePaidOrder)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground md:text-sm">Average Daily Revenue · 7 Days</p><p className="text-lg font-bold md:text-2xl">{isLoading ? "…" : formatNaira(averageDaily)}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Paid Revenue · Last 7 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis tickFormatter={formatCompactNaira} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatNaira(value)} />
                <Legend wrapperStyle={{ color: "var(--muted-foreground)" }} />
                <Line type="monotone" dataKey="sales" stroke={chartColors[0]} strokeWidth={3} name="Paid revenue" dot={{ r: 3, fill: chartColors[0] }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Order Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No orders to show yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={typeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {typeBreakdown.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} orders`, "Orders"]} />
                  <Legend wrapperStyle={{ color: "var(--muted-foreground)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Selling Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No paid item sales found yet.</p>
              ) : topItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-1/10 text-sm font-semibold text-chart-1">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium md:text-base">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.qty} sold · {formatNaira(item.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Cashier & POS Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between"><p className="text-sm">Successful transactions</p><p className="font-semibold">{isLoading ? "…" : successfulTransactions.length.toLocaleString()}</p></div>
            <div className="flex items-center justify-between"><p className="text-sm">Cashiers with paid sales</p><p className="font-semibold">{isLoading ? "…" : activeCashierCount.toLocaleString()}</p></div>
            <div className="flex items-center justify-between gap-2"><p className="text-sm">Last successful transaction</p><p className="text-right font-semibold">{lastTransaction ? new Date(lastTransaction.createdAt).toLocaleDateString() : "—"}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
