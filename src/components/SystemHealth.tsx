import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, Database, Zap } from "lucide-react";

interface SystemHealth {
  isOnline: boolean;
  latency: number;
  dbStatus: "connected" | "disconnected";
  apiStatus: "operational" | "degraded" | "down";
  lastSync: Date;
  uptime: number;
}

export function SystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    isOnline: navigator.onLine,
    latency: 0,
    dbStatus: "connected",
    apiStatus: "operational",
    lastSync: new Date(),
    uptime: 99.9,
  });

  useEffect(() => {
    const handleOnline = () => setHealth((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setHealth((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Simulate latency check every 30 seconds
    const latencyInterval = setInterval(async () => {
      const start = performance.now();
      try {
        const response = await fetch("/api/health", { method: "HEAD" });
        const latency = Math.round(performance.now() - start);
        setHealth((prev) => ({
          ...prev,
          latency,
          apiStatus: response.ok ? "operational" : "degraded",
          lastSync: new Date(),
        }));
      } catch {
        setHealth((prev) => ({
          ...prev,
          latency: 0,
          apiStatus: "down",
        }));
      }
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(latencyInterval);
    };
  }, []);

  return (
    <div className="grid gap-2 md:grid-cols-4">
      {/* Online Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-3 w-3" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                health.isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-semibold">
              {health.isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Uptime: {health.uptime}%
          </p>
        </CardContent>
      </Card>

      {/* Network Latency */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Wifi className="h-3 w-3" />
            Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{health.latency}ms</div>
          <Badge
            variant="outline"
            className={`text-xs mt-1 ${
              health.latency < 100
                ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                : health.latency < 300
                ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {health.latency < 100
              ? "Excellent"
              : health.latency < 300
              ? "Good"
              : "Poor"}
          </Badge>
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Database className="h-3 w-3" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                health.dbStatus === "connected" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-semibold capitalize">
              {health.dbStatus}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Primary Pool</p>
        </CardContent>
      </Card>

      {/* API Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-3 w-3" />
            API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant={
              health.apiStatus === "operational"
                ? "default"
                : health.apiStatus === "degraded"
                ? "secondary"
                : "destructive"
            }
            className={`text-xs capitalize ${
              health.apiStatus === "operational"
                ? "bg-green-600"
                : health.apiStatus === "degraded"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
          >
            {health.apiStatus}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Last: {health.lastSync.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
