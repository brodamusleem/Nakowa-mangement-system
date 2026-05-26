import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Search, Download, History } from "lucide-react";
import { useTransactions } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const methodLabels = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile Money",
};

export default function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = transactions.filter(
    (t) =>
      t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const failedAmount = transactions
    .filter((t) => t.status === "failed")
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Transactions"
        icon={<History className="h-6 w-6" />}
        showBackButton={true}
        backTo="/cashier"
        rightContent={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Transactions</p>
            <p className="text-xl font-bold md:text-2xl">{transactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Amount</p>
            <p className="text-lg font-bold md:text-xl">₦{(totalAmount / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Failed</p>
            <p className="text-lg font-bold text-destructive md:text-xl">₦{(failedAmount / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by reference or ID..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <div className="space-y-2">
          {filtered.map((tx) => (
            <Card key={tx.id} className="p-3 md:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm md:text-base">Ref: {tx.reference}</div>
                  <div className="text-xs text-muted-foreground md:text-sm">
                    {tx.date} at {tx.time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold text-sm md:text-base">₦{tx.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{methodLabels[tx.method]}</div>
                  </div>
                  <Badge className={statusConfig[tx.status]}>{tx.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}