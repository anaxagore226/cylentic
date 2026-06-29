"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  CircleDot,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { ExerciseFormSection } from "@/components/teacher/exercise-form-section";
import { cn } from "@/lib/utils/cn";

const MIN_CHOICES = 2;
const MAX_CHOICES = 8;
const DEFAULT_CHOICE_COUNT = 4;

const CHOICE_COUNT_OPTIONS = Array.from(
  { length: MAX_CHOICES - MIN_CHOICES + 1 },
  (_, i) => {
    const value = String(i + MIN_CHOICES);
    return { value, label: `${value} propositions` };
  },
);

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface Question {
  text: string;
  answerType: "single" | "multiple";
  points: string;
  explanation: string;
  choiceCount: number;
  choices: Choice[];
}

function createChoices(
  count: number,
  answerType: "single" | "multiple",
): Choice[] {
  return Array.from({ length: count }, (_, i) => ({
    text: "",
    isCorrect: answerType === "single" ? i === 0 : false,
  }));
}

function resizeChoices(
  choices: Choice[],
  count: number,
  answerType: "single" | "multiple",
): Choice[] {
  const next = choices.slice(0, count);
  while (next.length < count) {
    next.push({ text: "", isCorrect: false });
  }
  if (answerType === "single") {
    const correctIdx = next.findIndex((c) => c.isCorrect);
    return next.map((c, i) => ({
      ...c,
      isCorrect: i === (correctIdx >= 0 ? correctIdx : 0),
    }));
  }
  return next;
}

const emptyQuestion = (choiceCount = DEFAULT_CHOICE_COUNT): Question => ({
  text: "",
  answerType: "single",
  points: "1",
  explanation: "",
  choiceCount,
  choices: createChoices(choiceCount, "single"),
});

function choiceLetter(index: number) {
  return String.fromCharCode(65 + index);
}

interface ExerciseQcmFormProps {
  examId: string;
  exerciseId?: string;
  embedded?: boolean;
  initialValues?: {
    title: string;
    statement: string;
    points: string;
    questions: Question[];
  };
  onSuccess?: () => void;
}

export function ExerciseQcmForm({
  examId,
  exerciseId,
  embedded = false,
  initialValues,
  onSuccess,
}: ExerciseQcmFormProps) {
  const router = useRouter();
  const isEdit = Boolean(exerciseId);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [statement, setStatement] = useState(initialValues?.statement ?? "");
  const [points, setPoints] = useState(initialValues?.points ?? "10");
  const [questions, setQuestions] = useState<Question[]>(
    initialValues?.questions?.length
      ? initialValues.questions
      : [emptyQuestion(DEFAULT_CHOICE_COUNT)],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const questionPointsTotal = questions.reduce(
    (sum, q) => sum + (Number(q.points) || 0),
    0,
  );

  function updateQuestion(idx: number, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        const next = { ...q, ...patch };
        if (patch.answerType && patch.answerType !== q.answerType) {
          next.choices = resizeChoices(
            q.choices,
            q.choiceCount,
            patch.answerType,
          );
        }
        return next;
      }),
    );
  }

  function setChoiceCount(qIdx: number, count: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          choiceCount: count,
          choices: resizeChoices(q.choices, count, q.answerType),
        };
      }),
    );
  }

  function updateChoice(qIdx: number, cIdx: number, patch: Partial<Choice>) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              choices: q.choices.map((c, j) =>
                j === cIdx ? { ...c, ...patch } : c,
              ),
            }
          : q,
      ),
    );
  }

  function toggleCorrect(qIdx: number, cIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        if (q.answerType === "single") {
          return {
            ...q,
            choices: q.choices.map((c, j) => ({
              ...c,
              isCorrect: j === cIdx,
            })),
          };
        }
        return {
          ...q,
          choices: q.choices.map((c, j) =>
            j === cIdx ? { ...c, isCorrect: !c.isCorrect } : c,
          ),
        };
      }),
    );
  }

  function resetForm() {
    setTitle("");
    setStatement("");
    setPoints("10");
    setQuestions([emptyQuestion(DEFAULT_CHOICE_COUNT)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        title,
        statement: statement || undefined,
        points: Number(points),
        questions: questions.map((q) => ({
          text: q.text,
          answerType: q.answerType,
          points: Number(q.points),
          explanation: q.explanation || undefined,
          choices: q.choices,
        })),
      };

      const url = isEdit
        ? `/api/exams/${examId}/exercises/${exerciseId}`
        : `/api/exams/${examId}/exercises`;

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? payload : { type: "qcm", ...payload }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      if (isEdit) {
        router.push(`/teacher/exams/${examId}`);
        router.refresh();
        return;
      }
      router.refresh();
      resetForm();
      onSuccess?.();
    } catch {
      setError("Erreur lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ExerciseFormSection
        step={1}
        title="Bloc QCM"
        description="Titre, introduction et barème global du bloc."
      >
        <div className="space-y-4">
          <Input
            label="Titre du bloc"
            placeholder="Ex. Bases de Python — chapitre 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Introduction (optionnel)"
            rows={2}
            placeholder="Ce QCM porte sur les types de données et les structures de contrôle…"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
          <Input
            label="Points totaux du bloc"
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            required
          />
        </div>
      </ExerciseFormSection>

      <ExerciseFormSection
        step={2}
        title="Questions"
        description="Cliquez sur une proposition pour la marquer comme correcte."
        icon={<ListChecks className="h-4 w-4" />}
      >
        <div className="space-y-5">
          {questions.map((q, qi) => (
            <article
              key={qi}
              className="overflow-hidden rounded-2xl border border-card-border bg-card/60"
            >
              <header className="flex items-center justify-between gap-3 border-b border-card-border bg-surface-subtle/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                    {qi + 1}
                  </span>
                  <span className="text-sm font-medium">
                    Question {qi + 1}
                  </span>
                </div>
                {questions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((prev) => prev.filter((_, i) => i !== qi))
                    }
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label="Supprimer la question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </header>

              <div className="space-y-4 p-4 sm:p-5">
                <Textarea
                  label="Intitulé de la question"
                  rows={2}
                  placeholder="Quelle est la sortie de print(type([])) ?"
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <Select
                    label="Propositions"
                    value={String(q.choiceCount)}
                    onChange={(e) =>
                      setChoiceCount(qi, Number(e.target.value))
                    }
                    options={CHOICE_COUNT_OPTIONS}
                  />
                  <Input
                    label="Points"
                    type="number"
                    min={0}
                    value={q.points}
                    onChange={(e) =>
                      updateQuestion(qi, { points: e.target.value })
                    }
                  />
                  <div>
                    <span className="mb-2 block text-sm text-muted">
                      Type de réponse
                    </span>
                    <div className="flex rounded-xl border border-card-border bg-input-bg p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(qi, { answerType: "single" })
                        }
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all",
                          q.answerType === "single"
                            ? "bg-accent/15 text-accent shadow-sm"
                            : "text-muted hover:text-foreground",
                        )}
                      >
                        <CircleDot className="h-3.5 w-3.5" />
                        Unique
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(qi, { answerType: "multiple" })
                        }
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all",
                          q.answerType === "multiple"
                            ? "bg-accent/15 text-accent shadow-sm"
                            : "text-muted hover:text-foreground",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Multiple
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted">
                    {q.answerType === "single"
                      ? "Sélectionnez la bonne réponse."
                      : "Sélectionnez toutes les bonnes réponses."}
                  </p>
                  {q.choices.map((c, ci) => (
                    <div
                      key={ci}
                      className={cn(
                        "flex items-stretch gap-2 rounded-xl border transition-all",
                        c.isCorrect
                          ? "border-accent/50 bg-accent/10"
                          : "border-card-border hover:border-accent/25",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCorrect(qi, ci)}
                        className={cn(
                          "flex w-11 shrink-0 items-center justify-center rounded-l-[10px] border-r text-sm font-bold transition-colors",
                          c.isCorrect
                            ? "border-accent/30 bg-accent/20 text-accent"
                            : "border-card-border bg-surface-subtle text-muted hover:text-foreground",
                        )}
                        aria-label={`Marquer la proposition ${choiceLetter(ci)} comme correcte`}
                      >
                        {c.isCorrect ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          choiceLetter(ci)
                        )}
                      </button>
                      <input
                        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted/50"
                        value={c.text}
                        onChange={(e) =>
                          updateChoice(qi, ci, { text: e.target.value })
                        }
                        placeholder={`Proposition ${choiceLetter(ci)}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <Input
                  label="Explication (affichée après correction, optionnel)"
                  value={q.explanation}
                  onChange={(e) =>
                    updateQuestion(qi, { explanation: e.target.value })
                  }
                  placeholder="Le type list s'écrit list en Python 3…"
                />
              </div>
            </article>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setQuestions((p) => [...p, emptyQuestion(DEFAULT_CHOICE_COUNT)])
            }
          >
            <Plus className="h-4 w-4" />
            Ajouter une question
          </Button>
        </div>
      </ExerciseFormSection>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-card-border bg-card/50 px-5 py-4",
          embedded && "sticky bottom-4 backdrop-blur-sm",
        )}
      >
        <div className="text-sm text-muted">
          <span className="font-medium text-foreground">
            {questions.length}
          </span>{" "}
          question{questions.length > 1 ? "s" : ""} ·{" "}
          <span className="font-medium text-foreground">
            {questionPointsTotal}
          </span>{" "}
          pts (questions) · bloc{" "}
          <span className="font-medium text-foreground">{points}</span> pts
        </div>
        <Button type="submit" loading={loading}>
          <CheckCircle2 className="h-4 w-4" />
          {isEdit ? "Enregistrer les modifications" : "Ajouter le QCM"}
        </Button>
      </div>
    </form>
  );
}
