"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor } from "@/components/student/code-editor";
import { QcmExercisePanel } from "@/components/student/qcm-exercise-panel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { useAutosave } from "@/hooks/use-autosave";
import { useFullscreen } from "@/hooks/security/use-fullscreen";
import { useTabVisibility } from "@/hooks/security/use-tab-visibility";
import { useClipboardGuard } from "@/hooks/security/use-clipboard-guard";
import { useKeyboardLock } from "@/hooks/security/use-keyboard-lock";
import { FullscreenLockOverlay } from "@/components/student/fullscreen-lock-overlay";

const FULLSCREEN_MAX_EXITS = 2;

interface QcmQuestion {
  id: string;
  text: string;
  answerType: "single" | "multiple";
  points: number;
  choices: { id: string; text: string }[];
}

interface Exercise {
  id: string;
  type: "code" | "qcm";
  title: string;
  statement: string | null;
  language: string | null;
  qcmQuestions?: QcmQuestion[];
}

export function ExamComposeRoom({ examId }: { examId: string }) {
  const router = useRouter();
  const [participationId, setParticipationId] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeId, setActiveId] = useState("");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [qcmAnswers, setQcmAnswers] = useState<Record<string, string[]>>({});
  const [endAt, setEndAt] = useState<string | null>(null);
  const [examName, setExamName] = useState("");
  const [output, setOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [running, setRunning] = useState(false);
  const [warning, setWarning] = useState("");
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false);
  const [enteringFullscreen, setEnteringFullscreen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const submitExam = useCallback(
    async (reason: "manual" | "timer" | "excluded" = "manual") => {
      if (!participationId) return;

      const qcmPayload = exercises
        .filter((ex) => ex.type === "qcm")
        .map((ex) => ({
          exerciseId: ex.id,
          answers: (ex.qcmQuestions ?? []).map((q) => ({
            questionId: q.id,
            choiceIds: qcmAnswers[q.id] ?? [],
          })),
        }));

      await fetch("/api/exam-session/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participationId,
          reason,
          qcmAnswers: qcmPayload.length ? qcmPayload : undefined,
        }),
      });
      router.replace("/student/exam/submitted");
    },
    [participationId, router, exercises, qcmAnswers],
  );

  const { label: timerLabel } = useExamTimer(endAt, () => submitExam("timer"));

  const handleFullscreenExit = useCallback(async () => {
    if (!participationId) return;

    const res = await fetch("/api/exam-session/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participationId,
        type: "fullscreen_exit",
      }),
    });
    const json = await res.json();

    if (!json.success) {
      setWarning(json.error ?? "Impossible d'enregistrer l'incident.");
      return;
    }

    if (json.data?.excluded) {
      router.replace("/student/exam/submitted?reason=excluded");
      return;
    }

    const count = json.data?.fullscreenExitCount ?? 1;
    setFullscreenExitCount(count);
    setFullscreenBlocked(true);
    setWarning(
      `Sortie du plein écran enregistrée (${count}/${FULLSCREEN_MAX_EXITS}). Repassez en plein écran pour continuer.`,
    );
  }, [participationId, router]);

  const { isFullscreen, enter, supported } = useFullscreen(handleFullscreenExit);

  const reportIncident = useCallback(
    async (type: string, payload?: string) => {
      if (!participationId || fullscreenBlocked) return;
      const res = await fetch("/api/exam-session/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participationId, type, payload }),
      });
      const json = await res.json();
      if (json.data?.excluded) {
        router.replace("/student/exam/submitted?reason=excluded");
        return;
      }
      if (type === "tab_switch") {
        setWarning(
          "Changement d'onglet détecté et enregistré. Restez sur cette fenêtre.",
        );
      }
    },
    [participationId, fullscreenBlocked, router],
  );

  useEffect(() => {
    if (isFullscreen) {
      setFullscreenBlocked(false);
    }
  }, [isFullscreen]);

  async function handleEnterFullscreen() {
    setEnteringFullscreen(true);
    const ok = await enter();
    setEnteringFullscreen(false);
    if (!ok) {
      setWarning(
        "Impossible d'activer le plein écran. Autorisez-le dans votre navigateur.",
      );
    }
  }
  useTabVisibility(() => reportIncident("tab_switch"));
  useClipboardGuard((text) => reportIncident("clipboard_paste", text));
  useKeyboardLock();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/exam-session/join?examId=${examId}`);
      const json = await res.json();
      if (!json.success) return;

      const {
        exam,
        participation,
        phase,
        endAt: end,
        fullscreenExitCount: fc,
        excluded,
      } = json.data;

      if (phase === "submitted" || excluded) {
        router.replace(
          excluded
            ? "/student/exam/submitted?reason=excluded"
            : "/student/exam/submitted",
        );
        return;
      }
      if (phase === "waiting") {
        router.replace(`/student/exam/waiting?examId=${examId}`);
        return;
      }

      setExamName(exam.name);
      setExercises(exam.exercises);
      setEndAt(end);
      setFullscreenExitCount(fc ?? 0);

      if (fc && fc >= FULLSCREEN_MAX_EXITS) {
        router.replace("/student/exam/submitted?reason=excluded");
        return;
      }

      if (fc && fc > 0) {
        setFullscreenBlocked(true);
      }

      if (participation) {
        setParticipationId(participation.id);
        const initial: Record<string, string> = {};
        for (const ex of exam.exercises) {
          if (ex.type !== "code") continue;
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

      await enter();
    }
    load();
  }, [examId, router, enter]);

  const activeExercise = exercises.find((e) => e.id === activeId);
  const activeCode = codes[activeId] ?? "";
  const isCodeActive = activeExercise?.type === "code";

  useAutosave(
    participationId,
    isCodeActive ? activeId : "",
    isCodeActive ? activeCode : "",
  );

  async function handleRun() {
    if (fullscreenBlocked) return;
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
    <div className="relative flex h-screen flex-col bg-background">
      {fullscreenBlocked ? (
        <FullscreenLockOverlay
          exitCount={fullscreenExitCount}
          maxExits={FULLSCREEN_MAX_EXITS}
          onEnterFullscreen={handleEnterFullscreen}
          entering={enteringFullscreen}
        />
      ) : null}

      <header className="flex items-center justify-between border-b border-card-border px-4 py-3">
        <div>
          <h1 className="font-semibold">{examName}</h1>
          <p className="text-xs text-muted">Ne quittez pas cette fenêtre</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!confirmSubmit ? (
            <Button size="sm" onClick={() => setConfirmSubmit(true)}>
              Soumettre l&apos;examen
            </Button>
          ) : (
            <>
              <Button size="sm" variant="danger" onClick={() => submitExam("manual")}>
                Confirmer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmSubmit(false)}>
                Annuler
              </Button>
            </>
          )}
          <div className="font-mono text-2xl font-bold text-accent">{timerLabel}</div>
        </div>
      </header>

      {warning ? (
        <Alert variant="warning" className="mx-4 mt-3">
          {warning}
        </Alert>
      ) : null}

      <div
        className={`flex flex-1 overflow-hidden ${fullscreenBlocked ? "pointer-events-none select-none opacity-40" : ""}`}
      >
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
                    : "text-muted hover:bg-surface-subtle"
                }`}
              >
                {ex.title}
                <span className="ml-1 text-xs opacity-60">
                  ({ex.type === "qcm" ? "QCM" : "Code"})
                </span>
              </button>
            ))}
          </nav>
          {activeExercise?.statement ? (
            <div className="mt-6 text-sm">
              <div className="whitespace-pre-wrap text-muted">
                {activeExercise.statement}
              </div>
            </div>
          ) : null}
        </aside>

        <main className="flex flex-1 flex-col overflow-y-auto p-4">
          {activeExercise?.type === "qcm" ? (
            <QcmExercisePanel
              questions={(activeExercise.qcmQuestions ?? []).map((q) => ({
                ...q,
                points: Number(q.points),
              }))}
              answers={qcmAnswers}
              onChange={(questionId, choiceIds) =>
                setQcmAnswers((prev) => ({ ...prev, [questionId]: choiceIds }))
              }
            />
          ) : (
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
          )}
        </main>
      </div>
    </div>
  );
}
