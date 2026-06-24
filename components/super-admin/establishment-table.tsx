"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Establishment {
  id: string;
  name: string;
  acronym: string;
  city: string;
  isActive: boolean;
  subscriptions: { plan: { name: string } }[];
  _count: { users: number; exams: number; classes: number };
}

export function EstablishmentTable() {
  const [items, setItems] = useState<Establishment[]>([]);

  useEffect(() => {
    fetch("/api/super-admin/establishments")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setItems(json.data);
      });
  }, []);

  async function toggle(id: string, isActive: boolean) {
    await fetch("/api/super-admin/establishments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ establishmentId: id, isActive }),
    });
    setItems((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive } : e)),
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border text-left text-muted">
            <th className="px-4 py-3">Établissement</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Users</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id} className="border-b border-card-border/50">
              <td className="px-4 py-3">
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-muted">
                  {e.acronym} · {e.city}
                </p>
              </td>
              <td className="px-4 py-3">{e.subscriptions[0]?.plan.name ?? "—"}</td>
              <td className="px-4 py-3">{e._count.users}</td>
              <td className="px-4 py-3">
                <Badge variant={e.isActive ? "success" : "danger"}>
                  {e.isActive ? "Actif" : "Suspendu"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant={e.isActive ? "danger" : "secondary"}
                  onClick={() => toggle(e.id, !e.isActive)}
                >
                  {e.isActive ? "Suspendre" : "Réactiver"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
