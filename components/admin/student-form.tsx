"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface ClassOption {
  id: string;
  name: string;
}

interface YearOption {
  id: string;
  label: string;
}

export function StudentForm() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    matricule: "",
    classId: "",
    academicYearId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/academic-years").then((r) => r.json()),
    ]).then(([clsRes, yearRes]) => {
      if (clsRes.success) {
        setClasses(clsRes.data);
        if (clsRes.data[0]) setForm((f) => ({ ...f, classId: clsRes.data[0].id }));
      }
      if (yearRes.success) {
        setYears(yearRes.data);
        const active = yearRes.data.find((y: YearOption & { isActive: boolean }) => y.isActive);
        if (active) setForm((f) => ({ ...f, academicYearId: active.id }));
      }
    });
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          academicYearId: form.academicYearId || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setSuccess(
        `Étudiant créé — Identifiant : ${json.data.identifier} / Mot de passe : ${json.data.defaultPassword}`,
      );
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        matricule: "",
        classId: classes[0]?.id ?? "",
        academicYearId: form.academicYearId,
      });
      router.refresh();
    } catch {
      setError("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="font-semibold">Ajouter un étudiant</h3>
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
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            label="Matricule / INE"
            value={form.matricule}
            onChange={(e) => update("matricule", e.target.value)}
            required
          />
          <Select
            label="Classe"
            value={form.classId}
            onChange={(e) => update("classId", e.target.value)}
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Année académique"
            value={form.academicYearId}
            onChange={(e) => update("academicYearId", e.target.value)}
            options={[
              { value: "", label: "—" },
              ...years.map((y) => ({ value: y.id, label: y.label })),
            ]}
          />
        </div>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}
        <Button type="submit" loading={loading} disabled={!form.classId}>
          Créer le compte étudiant
        </Button>
      </form>
    </Card>
  );
}
