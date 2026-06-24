"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface Question {
  text: string;
  answerType: "single" | "multiple";
  points: string;
  explanation: string;
  choices: Choice[];
}

const emptyQuestion = (): Question => ({
  text: "",
  answerType: "single",
  points: "1",
  explanation: "",
  choices: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
});

export function ExerciseQcmForm({ examId }: { examId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [points, setPoints] = useState("10");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateQuestion(idx: number, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
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
      setQuestions([emptyQuestion()]);
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
          <div key={qi} className="rounded-xl border border-card-border p-4 space-y-3">
            <p className="text-sm font-medium">Question {qi + 1}</p>
            <Input
              label="Intitulé"
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              required
            />
            <div className="flex gap-4">
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
                  placeholder={`Choix ${ci + 1}`}
                  className="flex-1"
                />
              </div>
            ))}
            <Input
              label="Explication (post-MVP visible prof)"
              value={q.explanation}
              onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
            />
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={() => setQuestions((p) => [...p, emptyQuestion()])}>
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
