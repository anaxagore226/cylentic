"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LiveRow {
  studentId: string;
  identifier: string;
  name: string;
  className: string;
  participationId: string | null;
  status: string;
  statusLabel: string;
  connectedAt: string | null;
  submittedAt: string | null;
  incidentCount: number;
}

interface LiveSummary {
  total: number;
  waiting: number;
  inProgress: number;
  submitted: number;
  excluded: number;
  absent: number;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  waiting: "warning",
  connected: "warning",
  in_progress: "default",
  submitted: "success",
  excluded: "danger",
  absent: "default",
};

export function LiveMonitor({ examId }: { examId: string }) {
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [summary, setSummary] = useState<LiveSummary | null>(null);
  const [examName, setExamName] = useState("");

  useEffect(() => {
    async function poll() {
      const res = await fetch(`/api/exams/${examId}/live`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data.rows);
        setSummary(json.data.summary);
        setExamName(json.data.exam.name);
      }
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [examId]);

  return (
    <div className="space-y-6">
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            { label: "En attente", value: summary.waiting },
            { label: "En cours", value: summary.inProgress },
            { label: "Soumis", value: summary.submitted },
            { label: "Exclus", value: summary.excluded },
            { label: "Absents", value: summary.absent },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <p className="text-xs text-muted">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold">{s.value}</p>
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left text-muted">
                <th className="px-4 py-3 font-medium">Étudiant</th>
                <th className="px-4 py-3 font-medium">Classe</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Connexion</th>
                <th className="px-4 py-3 font-medium">Incidents</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.studentId}
                  className="border-b border-card-border/50 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.name}</p>
                    <p className="font-mono text-xs text-muted">{row.identifier}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{row.className}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[row.status] ?? "default"}>
                      {row.statusLabel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {row.connectedAt
                      ? new Date(row.connectedAt).toLocaleTimeString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.incidentCount > 0 ? (
                      <span className="text-danger">{row.incidentCount}</span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.participationId && row.status === "submitted" ? (
                      <Link
                        href={`/teacher/exams/${examId}/results/${row.participationId}`}
                        className="text-accent hover:underline"
                      >
                        Voir copie
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
