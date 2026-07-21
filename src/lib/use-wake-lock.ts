import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "wake-lock-enabled";

function loadEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveEnabled(enabled: boolean) {
  try {
    if (enabled) {
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

export function useWakeLock() {
  const [enabled, setEnabled] = useState(loadEnabled);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  const acquire = useCallback(async () => {
    if (!supported || sentinelRef.current) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request("screen");
      sentinelRef.current.addEventListener("release", () => {
        sentinelRef.current = null;
      });
    } catch {
      setEnabled(false); // e.g. low battery — browser refuses
    }
  }, [supported]);

  useEffect(() => {
    if (!enabled) {
      sentinelRef.current?.release();
      sentinelRef.current = null;
      return;
    }
    acquire();
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [enabled, acquire]);

  // Persist on every change
  useEffect(() => {
    saveEnabled(enabled);
  }, [enabled]);

  return { supported, enabled, toggle: () => setEnabled((v) => !v) };
}
