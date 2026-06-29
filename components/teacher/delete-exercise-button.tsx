"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteExerciseButton({
  examId,
  exerciseId,
  exerciseTitle,
}: {
  examId: string;
  exerciseId: string;
  exerciseTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      `Supprimer l'exercice « ${exerciseTitle} » ?\n\nCette action est irréversible.`,
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/exams/${examId}/exercises/${exerciseId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error ?? "Suppression impossible");
        return;
      }
      router.refresh();
    } catch {
      alert("Impossible de supprimer l'exercice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
      aria-label={`Supprimer ${exerciseTitle}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
