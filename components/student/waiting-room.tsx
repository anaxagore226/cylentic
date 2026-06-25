"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export function WaitingRoom({ examId }: { examId: string }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState("--:--:--");
  const [examName, setExamName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/exam-session/join?examId=${examId}`);
        const json = await res.json();
        if (!json.success) {
          setError(json.error);
          return;
        }

        const { exam, phase, startAt } = json.data;
        setExamName(exam.name);

        if (phase === "submitted") {
          const excluded = json.data.excluded;
          router.replace(
            excluded
              ? "/student/exam/submitted?reason=excluded"
              : "/student/exam/submitted",
          );
          return;
        }

        if (phase === "compose" || phase === "ended") {
          router.replace(`/student/exam/compose?examId=${examId}`);
          return;
        }

        const start = new Date(startAt).getTime();
        const rem = Math.max(0, start - Date.now());
        const h = Math.floor(rem / 3600000);
        const m = Math.floor((rem % 3600000) / 60000);
        const s = Math.floor((rem % 60000) / 1000);
        setCountdown(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        );
      } catch {
        setError("Connexion perdue. Reconnexion…");
      }
    }

    poll();
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, [examId, router]);

  return (
    <Card className="mx-auto max-w-md text-center">
      <p className="text-sm text-muted">Salle d&apos;attente</p>
      <h1 className="mt-2 text-lg font-semibold">{examName || "Examen"}</h1>
      <p className="mt-6 text-sm text-muted">Début dans</p>
      <p className="mt-2 font-mono text-5xl font-bold tracking-wider text-accent">
        {countdown}
      </p>
      <p className="mt-6 text-sm text-muted">
        L&apos;énoncé sera visible au démarrage. Restez sur cette page.
      </p>
      {error ? <Alert variant="warning" className="mt-4">{error}</Alert> : null}
    </Card>
  );
}
