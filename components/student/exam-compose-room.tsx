"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor } from "@/components/student/code-editor";
import { Alert } from "@/components/ui/alert";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { useAutosave } from "@/hooks/use-autosave";
import { useFullscreen } from "@/hooks/security/use-fullscreen";
import { useTabVisibility } from "@/hooks/security/use-tab-visibility";
import { useClipboardGuard } from "@/hooks/security/use-clipboard-guard";
import { useKeyboardLock } from "@/hooks/security/use-keyboard-lock";

interface Exercise {
  id: string;
  title: string;
  statement: string | null;
  language: string | null;
}

export function ExamComposeRoom({ examId }: { examId: string }) {
  const router = useRouter();
  const [participationId, setParticipationId] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeId, setActiveId] = useState("");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [endAt, setEndAt] = useState<string | null>(null);
  const [examName, setExamName] = useState("");
  const [output, setOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [running, setRunning] = useState(false);
  const [warning, setWarning] = useState("");
  const [incidentCount, setIncidentCount] = useState(0);
  const [maxIncidents, setMaxIncidents] = useState(2);

  const submitExam = useCallback(
    async (reason: "manual" | "timer" | "excluded" = "manual") => {
      if (!participationId) return;
      await fetch("/api/exam-session/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participationId, reason }),
      });
      router.replace("/student/exam/submitted");
    },
    [participationId, router],
  );

  const { label: timerLabel } = useExamTimer(endAt, () => submitExam("timer"));

  const reportIncident = useCallback(
    async (type: string, payload?: string) => {
      if (!participationId) return;
      const res = await fetch("/api/exam-session/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participationId, type, payload }),
      });
      const json = await res.json();
      if (json.success?.excluded) {
        router.replace("/student/exam/submitted");
      } else {
        setIncidentCount((c) => c + 1);
        setWarning(
          `Incident enregistré (${incidentCount + 1}/${maxIncidents}). Ne quittez pas l'examen.`,
        );
      }
    },
    [participationId, incidentCount, maxIncidents, router],
  );

  useFullscreen(() => reportIncident("fullscreen_exit"));
  useTabVisibility(() => reportIncident("tab_switch"));
  useClipboardGuard((text) => reportIncident("clipboard_paste", text));
  useKeyboardLock();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/exam-session/join?examId=${examId}`);
      const json = await res.json();
      if (!json.success) return;

      const { exam, participation, phase, endAt: end, incidentCount: ic, maxIncidents: mx } =
        json.data;

      if (phase === "submitted") {
        router.replace("/student/exam/submitted");
        return;
      }
      if (phase === "waiting") {
        router.replace(`/student/exam/waiting?examId=${examId}`);
        return;
      }

      setExamName(exam.name);
      setExercises(exam.exercises);
      setEndAt(end);
      setIncidentCount(ic ?? 0);
      setMaxIncidents(mx ?? 2);

      if (participation) {
        setParticipationId(participation.id);
        const initial: Record<string, string> = {};
        for (const ex of exam.exercises) {
          const saved = participation.autosaves?.find(
            (a: { exerciseId: string }) => a.exerciseId === ex.id,
          );
          initial[ex.id] =
            saved?.content ??
            localStorage.getItem(`cylentic:${participation.id}:${ex.id}`) ??
            "# Écrivez votre code ici\n";
        }
        setCodes(initial);
        setActiveId(exam.exercises[0]?.id ?? "");
      }
    }
    load();
  }, [examId, router]);

  const activeCode = codes[activeId] ?? "";
  useAutosave(participationId, activeId, activeCode);

  const activeExercise = exercises.find((e) => e.id === activeId);

  async function handleRun() {
    setRunning(true);
    setOutput("");
    setRunError("");
    try {
      const res = await fetch("/api/exam-session/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activeCode, exerciseId: activeId }),
      });
      const json = await res.json();
      if (!json.success) {
        setRunError(json.error);
        return;
      }
      if (json.data.stderr) setRunError(json.data.stderr);
      setOutput(json.data.stdout || "(aucune sortie)");
    } catch {
      setRunError("Exécution impossible.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-card-border px-4 py-3">
        <div>
          <h1 className="font-semibold">{examName}</h1>
          <p className="text-xs text-muted">Ne quittez pas cette fenêtre</p>
        </div>
        <div className="font-mono text-2xl font-bold text-accent">{timerLabel}</div>
      </header>

      {warning ? (
        <Alert variant="warning" className="mx-4 mt-3">
          {warning}
        </Alert>
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-card-border p-4">
          <nav className="space-y-1">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setActiveId(ex.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeId === ex.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-white/5"
                }`}
              >
                {ex.title}
              </button>
            ))}
          </nav>
          <div className="mt-6 prose prose-invert max-w-none text-sm">
            <h2 className="text-base font-semibold text-foreground">
              {activeExercise?.title}
            </h2>
            <div className="mt-2 whitespace-pre-wrap text-muted">
              {activeExercise?.statement}
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col p-4">
          <CodeEditor
            value={activeCode}
            onChange={(v) =>
              setCodes((prev) => ({ ...prev, [activeId]: v }))
            }
            language={activeExercise?.language ?? "python"}
            onRun={handleRun}
            onSubmit={() => submitExam("manual")}
            running={running}
            output={output}
            error={runError}
          />
        </main>
      </div>
    </div>
  );
}
