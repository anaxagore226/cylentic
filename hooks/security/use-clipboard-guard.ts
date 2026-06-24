"use client";

import { useEffect } from "react";

export function useClipboardGuard(onBlockedPaste: (text: string) => void) {
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const text = e.clipboardData?.getData("text") ?? "";
      if (!text) return;
      e.preventDefault();
      onBlockedPaste(text);
    }
    document.addEventListener("paste", handlePaste, true);
    return () => document.removeEventListener("paste", handlePaste, true);
  }, [onBlockedPaste]);
}
