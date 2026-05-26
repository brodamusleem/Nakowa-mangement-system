import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveKitchenOrders, useUpdateKitchenStatus } from "@/api/hooks";
import { KitchenTicketSkeleton } from "@/lib/kitchenShimmer/KitchenShimmer";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import type { Order } from "@/types/orderTypes";
import { ChefHat, Clock } from "lucide-react";

function OrderTicket({ order, action }: { order: Order; action?: React.ReactNode }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{order.orderNumber}</CardTitle>
          <span className="text-sm font-medium">
            {order.tableName ?? "Takeaway"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(order.createdAt)}
        </div>
        <p className="text-xs text-muted-foreground">Waiter: {order.waiterName}</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="text-sm">
            <span className="font-semibold">{item.qty}×</span> {item.name}
            {item.note && (
              <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                ({item.note})
              </span>
            )}
          </div>
        ))}
        {action && <div className="pt-3">{action}</div>}
      </CardContent>
    </Card>
  );
}

export default function KitchenDisplay() {
  useWebSocket(); // Real-time updates
  const { pending, preparing, ready, isLoading } = useActiveKitchenOrders();
  const updateStatus = useUpdateKitchenStatus();

  if (isLoading) return <KitchenTicketSkeleton />;

  const total = pending.length + preparing.length + ready.length;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <PageHeader
        title="Kitchen Display"
        icon={<ChefHat className="h-6 w-6" />}
        showBackButton={true}
        backTo="/"
        rightContent={
          <Badge variant="outline" className="mr-2">
            {total} active orders
          </Badge>
        }
      />

      {/* Board */}
      <div className="grid flex-1 grid-cols-3 gap-0 overflow-hidden divide-x">
        {/* PENDING */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 px-4 py-3 border-b">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-semibold text-red-700 dark:text-red-300">
              New Orders ({pending.length})
            </h2>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {pending.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No new orders</p>
            ) : (
              pending.map((order) => (
                <OrderTicket
                  key={order.id}
                  order={order}
                  action={
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({ id: order.id, kitchenStatus: "preparing" })
                      }
                      disabled={updateStatus.isPending}
                    >
                      Start Cooking
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </section>

        {/* PREPARING */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 px-4 py-3 border-b">
            <span className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
            <h2 className="font-semibold text-yellow-700 dark:text-yellow-300">
              Preparing ({preparing.length})
            </h2>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {preparing.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing cooking yet</p>
            ) : (
              preparing.map((order) => (
                <OrderTicket
                  key={order.id}
                  order={order}
                  action={
                    <Button
                      className="w-full"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatus.mutate({ id: order.id, kitchenStatus: "ready" })
                      }
                      disabled={updateStatus.isPending}
                    >
                      Mark Ready ✓
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </section>

        {/* READY */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-4 py-3 border-b">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <h2 className="font-semibold text-green-700 dark:text-green-300">
              Ready ({ready.length})
            </h2>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {ready.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders ready yet</p>
            ) : (
              ready.map((order) => (
                <OrderTicket key={order.id} order={order} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
