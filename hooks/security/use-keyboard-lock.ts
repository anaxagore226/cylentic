"use client";

import { useEffect } from "react";

const BLOCKED = new Set([
  "F12",
  "F5",
]);

export function useKeyboardLock() {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (BLOCKED.has(e.key)) {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && ["t", "w", "n", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === "F12") e.preventDefault();
    }

    function handleContext(e: MouseEvent) {
      e.preventDefault();
    }

    window.addEventListener("keydown", handleKey, true);
    window.addEventListener("contextmenu", handleContext);
    return () => {
      window.removeEventListener("keydown", handleKey, true);
      window.removeEventListener("contextmenu", handleContext);
    };
  }, []);
}
