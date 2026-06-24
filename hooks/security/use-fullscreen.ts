"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen(onExit?: () => void) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof document !== "undefined" && document.fullscreenEnabled);
  }, []);

  const enter = useCallback(async () => {
    if (!document.documentElement.requestFullscreen) {
      setSupported(false);
      return false;
    }
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    function onChange() {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) onExit?.();
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [onExit]);

  return { isFullscreen, enter, supported };
}
