"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export function ExerciseCodeForm({ examId }: { examId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    statement: "",
    points: "10",
    testInput: "print(somme(2, 3))",
    testOutput: "5",
    starterCode: "def somme(a, b):\n    pass",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/exams/${examId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          statement: form.statement,
          language: "python",
          points: Number(form.points),
          correctionMode: "auto",
          unitTests: [
            {
              input: form.testInput,
              expectedOutput: form.testOutput,
            },
          ],
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      router.refresh();
      setForm({
        title: "",
        statement: "",
        points: "10",
        testInput: "print(somme(2, 3))",
        testOutput: "5",
        starterCode: "def somme(a, b):\n    pass",
      });
    } catch {
      setError("Erreur lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="font-semibold">Ajouter un exercice Python</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Titre"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <div>
          <label className="mb-2 block text-sm text-muted">Énoncé</label>
          <textarea
            className="w-full rounded-xl border border-card-border bg-input-bg px-4 py-3 text-sm"
            rows={4}
            value={form.statement}
            onChange={(e) => setForm({ ...form, statement: e.target.value })}
            required
          />
        </div>
        <Input
          label="Points"
          type="number"
          value={form.points}
          onChange={(e) => setForm({ ...form, points: e.target.value })}
          required
        />
        <Input
          label="Test — code Python (après le code étudiant)"
          value={form.testInput}
          onChange={(e) => setForm({ ...form, testInput: e.target.value })}
        />
        <Input
          label="Sortie attendue"
          value={form.testOutput}
          onChange={(e) => setForm({ ...form, testOutput: e.target.value })}
        />
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button type="submit" loading={loading}>
          Ajouter l&apos;exercice
        </Button>
      </form>
    </Card>
  );
}
