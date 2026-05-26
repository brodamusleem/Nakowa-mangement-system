import { useState, useEffect, useCallback } from "react";

const DB_NAME = "nakowa_offline";
const STORE   = "queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore(STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function queueOfflineRequest(
  endpoint: string,
  method: string,
  body?: unknown
) {
  const db    = await openDB();
  const tx    = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).add({ endpoint, method, body, queuedAt: new Date().toISOString() });
}

async function getQueue(): Promise<any[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

async function clearQueue() {
  const db = await openDB();
  db.transaction(STORE, "readwrite").objectStore(STORE).clear();
}

export function useOfflineSync() {
  const [isOnline, setIsOnline]       = useState(navigator.onLine);
  const [isSyncing, setIsSyncing]     = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  const syncQueue = useCallback(async () => {
    const queue = await getQueue();
    if (!queue.length) return;

    setIsSyncing(true);
    const base = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

    try {
      for (const item of queue) {
        await fetch(`${base}${item.endpoint}`, {
          method: item.method,
          headers: { "Content-Type": "application/json" },
          body: item.body ? JSON.stringify(item.body) : undefined,
        });
      }
      await clearQueue();
      setQueueLength(0);
    } catch {
      // Will retry next time online
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const goOffline = () => {
      setIsOnline(false);
      getQueue().then((q) => setQueueLength(q.length));
    };
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [syncQueue]);

  return { isOnline, isSyncing, queueLength };
}
