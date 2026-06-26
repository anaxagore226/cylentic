"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function AcademicYearForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, isActive: true }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setLabel("");
      onSuccess?.();
      router.refresh();
    } catch {
      setError("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <Input
        label="Année académique"
        placeholder="2025-2026"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
        className="min-w-[200px]"
      />
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button type="submit" loading={loading}>
        Créer l&apos;année
      </Button>
    </form>
  );
}
