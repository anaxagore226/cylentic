"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

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

function createChoices(count: number, answerType: "single" | "multiple"): Choice[] {
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
    return next.map((c, i) => ({ ...c, isCorrect: i === (correctIdx >= 0 ? correctIdx : 0) }));
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

export function ExerciseQcmForm({ examId }: { examId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [points, setPoints] = useState("10");
  const [questions, setQuestions] = useState<Question[]>([
    emptyQuestion(DEFAULT_CHOICE_COUNT),
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateQuestion(idx: number, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        const next = { ...q, ...patch };
        if (patch.answerType && patch.answerType !== q.answerType) {
          next.choices = resizeChoices(q.choices, q.choiceCount, patch.answerType);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/exams/${examId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "qcm",
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
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      router.refresh();
      setTitle("");
      setStatement("");
      setQuestions([emptyQuestion(DEFAULT_CHOICE_COUNT)]);
    } catch {
      setError("Erreur lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="font-semibold">Ajouter un bloc QCM</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-6">
        <Input label="Titre du bloc" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Introduction (optionnel)" value={statement} onChange={(e) => setStatement(e.target.value)} />
        <Input label="Points totaux" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />

        {questions.map((q, qi) => (
          <div key={qi} className="space-y-3 rounded-xl border border-card-border p-4">
            <p className="text-sm font-medium">Question {qi + 1}</p>
            <Input
              label="Intitulé"
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Nombre de propositions"
                value={String(q.choiceCount)}
                onChange={(e) => setChoiceCount(qi, Number(e.target.value))}
                options={CHOICE_COUNT_OPTIONS}
              />
              <Input
                label="Points"
                type="number"
                min={0}
                value={q.points}
                onChange={(e) => updateQuestion(qi, { points: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={q.answerType === "single"}
                  onChange={() => updateQuestion(qi, { answerType: "single" })}
                />
                Réponse unique
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={q.answerType === "multiple"}
                  onChange={() => updateQuestion(qi, { answerType: "multiple" })}
                />
                Réponses multiples
              </label>
            </div>
            <p className="text-xs text-muted">
              Cochez la ou les bonnes réponses parmi les {q.choiceCount} propositions.
            </p>
            {q.choices.map((c, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <input
                  type={q.answerType === "single" ? "radio" : "checkbox"}
                  name={`q-${qi}-correct`}
                  checked={c.isCorrect}
                  onChange={() => {
                    if (q.answerType === "single") {
                      setQuestions((prev) =>
                        prev.map((qu, i) =>
                          i === qi
                            ? {
                                ...qu,
                                choices: qu.choices.map((ch, j) => ({
                                  ...ch,
                                  isCorrect: j === ci,
                                })),
                              }
                            : qu,
                        ),
                      );
                    } else {
                      updateChoice(qi, ci, { isCorrect: !c.isCorrect });
                    }
                  }}
                />
                <Input
                  value={c.text}
                  onChange={(e) => updateChoice(qi, ci, { text: e.target.value })}
                  placeholder={`Proposition ${ci + 1}`}
                  className="flex-1"
                  required
                />
              </div>
            ))}
            <Input
              label="Explication (optionnel)"
              value={q.explanation}
              onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
            />
            {questions.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
              >
                Retirer cette question
              </Button>
            ) : null}
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={() => setQuestions((p) => [...p, emptyQuestion(DEFAULT_CHOICE_COUNT)])}
        >
          + Question
        </Button>

        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button type="submit" loading={loading}>
          Ajouter le QCM
        </Button>
      </form>
    </Card>
  );
}
