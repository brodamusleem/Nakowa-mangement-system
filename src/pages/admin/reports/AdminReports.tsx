import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOrders } from "@/api/hooks"
import { buildWeeklyRevenue, formatCompactNaira, formatNaira, getActiveOrders, getPaidOrders, getPaidRevenue } from "@/lib/reporting"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const tooltipStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--card-foreground)",
}

export default function AdminReports() {
  const { data: orders = [], isLoading } = useOrders()
  const weeklyData = buildWeeklyRevenue(orders, 6)
  const paidOrders = getPaidOrders(orders)
  const totalRevenue = getPaidRevenue(orders)
  const totalOrders = getActiveOrders(orders).length
  const averageOrder = paidOrders.length ? totalRevenue / paidOrders.length : 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Revenue is calculated from paid orders. Cancelled and unpaid orders are excluded from revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Revenue Received</p>
            <p className="text-lg font-bold md:text-2xl">{isLoading ? "…" : formatNaira(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Orders (excluding cancelled)</p>
            <p className="text-lg font-bold md:text-2xl">{isLoading ? "…" : totalOrders.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Average Paid Order</p>
            <p className="text-lg font-bold md:text-2xl">{isLoading ? "…" : formatNaira(averageOrder)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Revenue by Week · Last 6 Weeks</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis tickFormatter={formatCompactNaira} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatNaira(value)} />
                <Line type="monotone" dataKey="sales" name="Paid revenue" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 3, fill: "var(--chart-1)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Orders by Week · Last 6 Weeks</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} orders`, "Orders"]} />
                <Bar dataKey="orders" name="Orders" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
