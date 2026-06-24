"use client";

import { useCallback, useEffect, useRef } from "react";
import { AUTOSAVE_INTERVAL_MS } from "@/lib/constants/exam";

export function useAutosave(
  participationId: string,
  exerciseId: string,
  content: string,
) {
  const contentRef = useRef(content);
  contentRef.current = content;

  const save = useCallback(async () => {
    if (!participationId || !exerciseId) return;
    try {
      await fetch("/api/exam-session/autosave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participationId,
          exerciseId,
          content: contentRef.current,
        }),
      });
    } catch {
      /* offline — localStorage backup */
      localStorage.setItem(
        `cylentic:${participationId}:${exerciseId}`,
        contentRef.current,
      );
    }
  }, [participationId, exerciseId]);

  useEffect(() => {
    const id = setInterval(save, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [save]);

  return { save };
}
