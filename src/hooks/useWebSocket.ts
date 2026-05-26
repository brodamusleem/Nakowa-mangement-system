import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { toast } from "sonner";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

type WSMessage = {
  type: string;
  payload: any;
  timestamp: string;
};

/**
 * useWebSocket — connects to the server WebSocket and invalidates React Query
 * caches automatically when the server broadcasts events.
 *
 * Mount this once in your root layout. It handles:
 *   ORDER_CREATED  → kitchen sees new ticket instantly
 *   ORDER_UPDATED  → status changes propagate everywhere
 *   ORDER_PAID     → dashboard + cashier update
 *   TABLE_UPDATED  → table grid refreshes
 *   INVENTORY_LOW  → shows toast + refreshes inventory
 */
export function useWebSocket() {
  const qc = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMessage = useCallback(
    (msg: WSMessage) => {
      switch (msg.type) {
        case "ORDER_CREATED":
          qc.invalidateQueries({ queryKey: queryKeys.orders });
          qc.invalidateQueries({ queryKey: queryKeys.ordersKitchen("pending") });
          toast.info(`New order: ${msg.payload?.orderNumber}`);
          break;

        case "ORDER_UPDATED":
          qc.invalidateQueries({ queryKey: queryKeys.orders });
          qc.invalidateQueries({ queryKey: queryKeys.ordersUnpaid });
          ["pending", "preparing", "ready"].forEach((s) =>
            qc.invalidateQueries({ queryKey: queryKeys.ordersKitchen(s) })
          );
          break;

        case "ORDER_PAID":
          qc.invalidateQueries({ queryKey: queryKeys.orders });
          qc.invalidateQueries({ queryKey: queryKeys.transactions });
          qc.invalidateQueries({ queryKey: queryKeys.analyticsSummary });
          break;

        case "TABLE_UPDATED":
          qc.invalidateQueries({ queryKey: queryKeys.tables });
          break;

        case "INVENTORY_LOW":
          qc.invalidateQueries({ queryKey: queryKeys.inventory });
          qc.invalidateQueries({ queryKey: queryKeys.lowStock });
          toast.warning(`Low stock: ${msg.payload?.name}`);
          break;

        case "EVENT_CREATED":
          qc.invalidateQueries({ queryKey: queryKeys.events });
          break;

        default:
          break;
      }
    },
    [qc]
  );

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      console.log("[WS] Connected");
    };

    socket.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        handleMessage(msg);
      } catch {
        // ignore malformed messages
      }
    };

    socket.onclose = () => {
      console.log("[WS] Disconnected — reconnecting in 3s");
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [handleMessage]);

  useEffect(() => {
    connect();
    return () => {
      reconnectTimer.current && clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);
}
