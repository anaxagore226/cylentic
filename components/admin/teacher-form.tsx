"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export function TeacherForm({
  onSuccess,
  embedded,
}: {
  onSuccess?: () => void;
  embedded?: boolean;
}) {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subjects: "",
    function: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          subjects: form.subjects || undefined,
          function: form.function || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setSuccess(
        `Professeur créé — Identifiant : ${json.data.identifier} / Mot de passe : ${json.data.defaultPassword}`,
      );
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        subjects: "",
        function: "",
      });
      onSuccess?.();
      router.refresh();
    } catch {
      setError("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Prénom"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />
          <Input
            label="Nom"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
          <Input
            label="Email professionnel"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            label="Matières enseignées"
            value={form.subjects}
            onChange={(e) => update("subjects", e.target.value)}
          />
          <Input
            label="Fonction"
            placeholder="Professeur, MC…"
            value={form.function}
            onChange={(e) => update("function", e.target.value)}
            className="sm:col-span-2"
          />
        </div>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}
      <Button type="submit" loading={loading}>
        Créer le compte professeur
      </Button>
    </form>
  );

  if (embedded) {
    return (
      <div>
        <h3 className="font-semibold">Ajouter un professeur</h3>
        {formContent}
      </div>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold">Ajouter un professeur</h3>
      {formContent}
    </Card>
  );
}
