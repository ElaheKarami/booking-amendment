"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type NetworkConnectivity = "online" | "offline" | "reconnected";

function readNavigatorOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(readNavigatorOnline);
  const [justReconnected, setJustReconnected] = useState(false);
  const wasOfflineRef = useRef(!readNavigatorOnline());

  useEffect(() => {
    const syncFromNavigator = () => {
      const online = readNavigatorOnline();

      if (!online) {
        wasOfflineRef.current = true;
        setIsOnline(false);
        setJustReconnected(false);
        return;
      }

      setIsOnline(true);
      if (wasOfflineRef.current) {
        setJustReconnected(true);
      }
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setIsOnline(false);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        setJustReconnected(true);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", syncFromNavigator);
    document.addEventListener("visibilitychange", syncFromNavigator);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", syncFromNavigator);
      document.removeEventListener("visibilitychange", syncFromNavigator);
    };
  }, []);

  const acknowledgeReconnect = useCallback(() => {
    wasOfflineRef.current = false;
    setJustReconnected(false);
  }, []);

  const connectivity: NetworkConnectivity = !isOnline
    ? "offline"
    : justReconnected
      ? "reconnected"
      : "online";

  return {
    isOnline,
    justReconnected,
    connectivity,
    acknowledgeReconnect,
  };
}
