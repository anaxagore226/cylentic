"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FlaskConical,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ExerciseFormSection } from "@/components/teacher/exercise-form-section";
import { cn } from "@/lib/utils/cn";

interface UnitTestRow {
  input: string;
  expectedOutput: string;
  weight: string;
  isHidden: boolean;
}

function emptyTest(): UnitTestRow {
  return { input: "", expectedOutput: "", weight: "1", isHidden: false };
}

interface ExerciseCodeFormProps {
  examId: string;
  exerciseId?: string;
  embedded?: boolean;
  initialValues?: {
    title: string;
    statement: string;
    points: string;
    tests: UnitTestRow[];
  };
  onSuccess?: () => void;
}

export function ExerciseCodeForm({
  examId,
  exerciseId,
  embedded = false,
  initialValues,
  onSuccess,
}: ExerciseCodeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(exerciseId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [statement, setStatement] = useState(initialValues?.statement ?? "");
  const [points, setPoints] = useState(initialValues?.points ?? "10");
  const [tests, setTests] = useState<UnitTestRow[]>(
    initialValues?.tests?.length ? initialValues.tests : [emptyTest()],
  );

  function updateTest(index: number, patch: Partial<UnitTestRow>) {
    setTests((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  }

  function addTest() {
    setTests((prev) => [...prev, emptyTest()]);
  }

  function removeTest(index: number) {
    setTests((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function resetForm() {
    setTitle("");
    setStatement("");
    setPoints("10");
    setTests([emptyTest()]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const unitTests = tests
      .filter((t) => t.expectedOutput.trim())
      .map((t) => ({
        input: t.input || undefined,
        expectedOutput: t.expectedOutput,
        weight: Number(t.weight) || 1,
        isHidden: t.isHidden,
      }));

    try {
      const payload = {
        title,
        statement,
        language: "python" as const,
        points: Number(points),
        correctionMode: "auto" as const,
        unitTests: unitTests.length ? unitTests : undefined,
      };

      const url = isEdit
        ? `/api/exams/${examId}/exercises/${exerciseId}`
        : `/api/exams/${examId}/exercises`;

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? payload : { type: "code", ...payload }),
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

  const validTests = tests.filter((t) => t.expectedOutput.trim()).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ExerciseFormSection
        step={1}
        title="Informations générales"
        description="Titre, barème et langage de l'exercice."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Python 3</Badge>
            <Badge>Correction automatique</Badge>
          </div>
          <Input
            label="Titre de l'exercice"
            placeholder="Ex. Somme de deux nombres"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Points"
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
        title="Énoncé"
        description="Décrivez clairement ce que l'étudiant doit implémenter."
      >
        <Textarea
          label="Consignes"
          rows={5}
          placeholder="Écrivez une fonction `somme(a, b)` qui retourne la somme de deux entiers…"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          required
        />
      </ExerciseFormSection>

      <ExerciseFormSection
        step={3}
        title="Tests unitaires"
        description="Chaque test exécute du code Python après la soumission de l'étudiant."
        icon={<FlaskConical className="h-4 w-4" />}
      >
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                test.isHidden
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-card-border bg-surface-subtle/50",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Test {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateTest(index, { isHidden: !test.isHidden })
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      test.isHidden
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-muted hover:bg-card hover:text-foreground",
                    )}
                    title={
                      test.isHidden
                        ? "Test masqué aux étudiants"
                        : "Rendre ce test invisible"
                    }
                  >
                    {test.isHidden ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {test.isHidden ? "Masqué" : "Visible"}
                  </button>
                  {tests.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeTest(index)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      aria-label="Supprimer le test"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted">
                    Code exécuté (optionnel)
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-card-border bg-input-bg px-3 py-2 font-mono text-xs outline-none focus:border-accent/50"
                    rows={2}
                    placeholder='print(somme(2, 3))'
                    value={test.input}
                    onChange={(e) =>
                      updateTest(index, { input: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_5rem]">
                  <div>
                    <label className="mb-1.5 block text-xs text-muted">
                      Sortie attendue
                    </label>
                    <input
                      className="w-full rounded-lg border border-card-border bg-input-bg px-3 py-2 font-mono text-xs outline-none focus:border-accent/50"
                      placeholder="5"
                      value={test.expectedOutput}
                      onChange={(e) =>
                        updateTest(index, { expectedOutput: e.target.value })
                      }
                      required={index === 0}
                    />
                  </div>
                  <Input
                    label="Poids"
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={test.weight}
                    onChange={(e) =>
                      updateTest(index, { weight: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="secondary" size="sm" onClick={addTest}>
            <Plus className="h-4 w-4" />
            Ajouter un test
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
        <p className="text-sm text-muted">
          {validTests} test{validTests > 1 ? "s" : ""} configuré
          {validTests > 1 ? "s" : ""} · {points} points
        </p>
        <Button type="submit" loading={loading}>
          <CheckCircle2 className="h-4 w-4" />
          {isEdit ? "Enregistrer les modifications" : "Ajouter l'exercice"}
        </Button>
      </div>
    </form>
  );
}
