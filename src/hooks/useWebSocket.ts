import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/api/queryKeys"
import { supabase } from "@/lib/supabase"

export function useWebSocket() {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("nakowa-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          qc.invalidateQueries({ queryKey: queryKeys.orders })
          qc.invalidateQueries({ queryKey: queryKeys.ordersUnpaid })
          qc.invalidateQueries({ queryKey: queryKeys.analyticsSummary })
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tables" },
        () => qc.invalidateQueries({ queryKey: queryKeys.tables })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        () => {
          qc.invalidateQueries({ queryKey: queryKeys.inventory })
          qc.invalidateQueries({ queryKey: queryKeys.lowStock })
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => qc.invalidateQueries({ queryKey: queryKeys.events })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          qc.invalidateQueries({ queryKey: queryKeys.transactions })
          qc.invalidateQueries({ queryKey: queryKeys.analyticsSummary })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])
}
