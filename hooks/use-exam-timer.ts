"use client";

import { useEffect, useState } from "react";

export function useExamTimer(endAtIso: string | null, onExpire: () => void) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!endAtIso) return;

    function tick() {
      const end = new Date(endAtIso!).getTime();
      const rem = Math.max(0, end - Date.now());
      setRemainingMs(rem);
      if (rem === 0) onExpire();
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAtIso, onExpire]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    remainingMs,
    label: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    expired: remainingMs === 0,
  };
}
