"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  code: string;
  name: string;
  maxTeachers: number | null;
  maxStudents: number | null;
  maxExamsPerMonth: number | null;
  priceMin: string | null;
  priceMax: string | null;
  isActive: boolean;
}

export function PlanEditor() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Plan>>({});

  useEffect(() => {
    fetch("/api/super-admin/plans")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPlans(json.data);
      });
  }, []);

  function startEdit(plan: Plan) {
    setEditing(plan.id);
    setForm(plan);
  }

  async function save() {
    if (!editing) return;
    const res = await fetch("/api/super-admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: editing,
        name: form.name,
        maxTeachers: form.maxTeachers ? Number(form.maxTeachers) : null,
        maxStudents: form.maxStudents ? Number(form.maxStudents) : null,
        maxExamsPerMonth: form.maxExamsPerMonth
          ? Number(form.maxExamsPerMonth)
          : null,
        priceMin: form.priceMin ? Number(form.priceMin) : null,
        priceMax: form.priceMax ? Number(form.priceMax) : null,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setPlans((prev) => prev.map((p) => (p.id === editing ? json.data : p)));
      setEditing(null);
    }
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <Card key={plan.id}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="text-xs text-muted">{plan.code}</p>
            </div>
            <Badge variant={plan.isActive ? "success" : "default"}>
              {plan.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>

          {editing === plan.id ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                label="Nom"
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Max profs"
                type="number"
                value={form.maxTeachers ?? ""}
                onChange={(e) =>
                  setForm({ ...form, maxTeachers: Number(e.target.value) })
                }
              />
              <Input
                label="Max étudiants"
                type="number"
                value={form.maxStudents ?? ""}
                onChange={(e) =>
                  setForm({ ...form, maxStudents: Number(e.target.value) })
                }
              />
              <Input
                label="Prix min (FCFA)"
                type="number"
                value={form.priceMin ?? ""}
                onChange={(e) =>
                  setForm({ ...form, priceMin: e.target.value })
                }
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button onClick={save}>Enregistrer</Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-between text-sm text-muted">
              <span>
                {plan.maxTeachers ?? "∞"} profs · {plan.maxStudents ?? "∞"}{" "}
                étudiants
              </span>
              <Button size="sm" variant="secondary" onClick={() => startEdit(plan)}>
                Modifier
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
