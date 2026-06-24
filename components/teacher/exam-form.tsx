"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

interface ClassItem {
  id: string;
  name: string;
}

export function ExamForm() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    startAt: "",
    durationMinutes: "60",
    accessDelayMinutes: "15",
    correctionMode: "auto",
  });

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setClasses(json.data);
      });
  }, []);

  function toggleClass(id: string) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const startAt = new Date(form.startAt).toISOString();
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          startAt,
          durationMinutes: Number(form.durationMinutes),
          accessDelayMinutes: Number(form.accessDelayMinutes),
          correctionMode: form.correctionMode,
          classIds: selectedClasses,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Erreur");
        return;
      }

      router.push(`/teacher/exams/${json.data.id}`);
    } catch {
      setError("Impossible de créer l'examen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Nouvel examen (brouillon)</h2>
      <p className="mt-1 text-sm text-muted">
        Le code d&apos;accès sera généré à la publication.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Nom de l'examen"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Date et heure de début"
          type="datetime-local"
          value={form.startAt}
          onChange={(e) => setForm({ ...form, startAt: e.target.value })}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Durée (minutes)"
            type="number"
            min={5}
            value={form.durationMinutes}
            onChange={(e) =>
              setForm({ ...form, durationMinutes: e.target.value })
            }
            required
          />
          <Input
            label="Délai d'accès après démarrage (min)"
            type="number"
            min={0}
            value={form.accessDelayMinutes}
            onChange={(e) =>
              setForm({ ...form, accessDelayMinutes: e.target.value })
            }
            required
          />
        </div>
        <Select
          label="Mode de correction global"
          value={form.correctionMode}
          onChange={(e) =>
            setForm({ ...form, correctionMode: e.target.value })
          }
          options={[
            { value: "auto", label: "Automatique (tests unitaires)" },
            { value: "manual", label: "Manuel" },
          ]}
        />

        <div>
          <p className="mb-2 text-sm text-muted">Classes autorisées</p>
          {classes.length === 0 ? (
            <Alert variant="warning">
              Aucune classe disponible. L&apos;administrateur doit d&apos;abord
              créer des classes.
            </Alert>
          ) : (
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleClass(c.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    selectedClasses.includes(c.id)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-card-border text-muted hover:border-accent/30"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" loading={loading} disabled={selectedClasses.length === 0}>
          Enregistrer le brouillon
        </Button>
      </form>
    </Card>
  );
}
