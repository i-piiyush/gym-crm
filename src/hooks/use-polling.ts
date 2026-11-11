"use client";

import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs = 10000,
  enabled = true
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Immediately run on mount
    savedCallback.current();

    const tick = () => {
      if (document.visibilityState === "visible") {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, intervalMs);

    // Run when user focuses tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        savedCallback.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs, enabled]);
}

