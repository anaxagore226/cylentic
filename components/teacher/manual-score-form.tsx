"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function ManualScoreForm({
  examId,
  participationId,
  initialScore,
  submissionScores,
}: {
  examId: string;
  participationId: string;
  initialScore: number | null;
  submissionScores?: {
    submissionId: string;
    title: string;
    autoScore: number | null;
    maxPoints: number;
  }[];
}) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore?.toString() ?? "");
  const [perExercise, setPerExercise] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const body = submissionScores?.length
      ? {
          submissionScores: submissionScores.map((s) => ({
            submissionId: s.submissionId,
            manualScore: Number(perExercise[s.submissionId] ?? s.autoScore ?? 0),
          })),
        }
      : { manualScore: Number(score) };

    try {
      const res = await fetch(
        `/api/exams/${examId}/results/${participationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submissionScores?.length ? (
        submissionScores.map((s) => (
          <div key={s.submissionId} className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted">
                Auto : {s.autoScore?.toFixed(2) ?? "—"} / {s.maxPoints} pts
              </p>
            </div>
            <Input
              label="Note manuelle"
              type="number"
              min={0}
              max={s.maxPoints}
              step="0.5"
              value={perExercise[s.submissionId] ?? String(s.autoScore ?? "")}
              onChange={(e) =>
                setPerExercise((prev) => ({
                  ...prev,
                  [s.submissionId]: e.target.value,
                }))
              }
              className="w-32"
            />
          </div>
        ))
      ) : (
        <Input
          label="Note manuelle globale"
          type="number"
          min={0}
          step="0.5"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      )}

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">Note enregistrée.</Alert> : null}
      <Button type="submit" loading={loading}>
        Enregistrer la correction
      </Button>
    </form>
  );
}
