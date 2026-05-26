import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const monthlyData = [
  { month: "Jan", sales: 400000, orders: 45 },
  { month: "Feb", sales: 480000, orders: 52 },
  { month: "Mar", sales: 520000, orders: 58 },
  { month: "Apr", sales: 610000, orders: 65 },
  { month: "May", sales: 680000, orders: 72 },
];

const categoryData = [
  { name: "Food", value: 60 },
  { name: "Beverages", value: 25 },
  { name: "Catering", value: 15 },
];

export default function AdminReports() {
  const totalRevenue = 2690000;
  const avgOrder = 18500;
  const totalOrders = 292;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground md:text-base">View business performance and trends</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Revenue</p>
            <p className="text-lg font-bold md:text-2xl">₦{(totalRevenue / 1000000).toFixed(2)}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Orders</p>
            <p className="text-lg font-bold md:text-2xl">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Avg Order Value</p>
            <p className="text-lg font-bold md:text-2xl">₦{(avgOrder / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="hsl(280 100% 50%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(260 80% 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}