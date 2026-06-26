"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function ClassForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [track, setTrack] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          track: track || undefined,
          level: level || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setName("");
      setTrack("");
      setLevel("");
      onSuccess?.();
      router.refresh();
    } catch {
      setError("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Nom de la classe"
          placeholder="L2 INFO"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Filière"
          placeholder="Informatique"
          value={track}
          onChange={(e) => setTrack(e.target.value)}
        />
        <Input
          label="Niveau"
          placeholder="Licence 2"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        />
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button type="submit" loading={loading}>
        Ajouter la classe
      </Button>
    </form>
  );
}
