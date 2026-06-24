"use client";

import { useEffect } from "react";

export function useTabVisibility(onBlur: () => void) {
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) onBlur();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [onBlur]);
}
