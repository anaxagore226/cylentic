import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ResultRow {
  id: string;
  student: {
    identifier: string;
    name: string;
    className: string;
  };
  status: string;
  statusLabel: string;
  connectedAt?: string | null;
  submittedAt?: string | null;
  autoScore: number | null;
  manualScore: number | null;
  finalScore: number | null;
  incidentCount: number;
}

export function ResultsTable({
  examId,
  rows,
}: {
  examId: string;
  rows: ResultRow[];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Étudiant</th>
              <th className="px-4 py-3 font-medium">Classe</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Score auto</th>
              <th className="px-4 py-3 font-medium">Score final</th>
              <th className="px-4 py-3 font-medium">Incidents</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  Aucune participation pour le moment.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-card-border/50 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.student.name}</p>
                    <p className="font-mono text-xs text-muted">
                      {row.student.identifier}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted">{row.student.className}</td>
                  <td className="px-4 py-3">
                    <Badge>{row.statusLabel}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {row.autoScore != null ? row.autoScore.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {row.finalScore != null ? row.finalScore.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.incidentCount > 0 ? (
                      <span className="text-danger">{row.incidentCount}</span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/teacher/exams/${examId}/results/${row.id}`}
                      className="text-accent hover:underline"
                    >
                      Détail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
