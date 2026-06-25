"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface DeleteExamButtonProps {
  examId: string;
  examName: string;
  redirectTo?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function DeleteExamButton({
  examId,
  examName,
  redirectTo = "/teacher/exams",
  variant = "danger",
  size = "sm",
}: DeleteExamButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = confirm(
      `Supprimer définitivement l'examen « ${examName} » ?\n\nCette action est irréversible (exercices, participations et résultats associés).`,
    );
    if (!confirmed) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/exams/${examId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Suppression impossible");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error ? (
        <Alert variant="error" className="mb-2">
          {error}
        </Alert>
      ) : null}
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleDelete}
        loading={loading}
      >
        Supprimer
      </Button>
    </div>
  );
}
