"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export function PublishExamButton({ examId }: { examId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePublish() {
    if (!confirm("Publier l'examen et générer le code d'accès ?")) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/exams/${examId}/publish`, { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      <Button onClick={handlePublish} loading={loading}>
        Publier l&apos;examen
      </Button>
    </div>
  );
}

export function AccessCodeDisplay({ code }: { code: string }) {
  return (
    <Card className="border-accent/30 bg-accent/5 text-center">
      <p className="text-sm text-muted">Code d&apos;accès</p>
      <p className="mt-2 font-mono text-4xl font-bold tracking-widest text-accent">
        {code}
      </p>
    </Card>
  );
}
