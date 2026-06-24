"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IncidentTimeline } from "@/components/teacher/incident-timeline";
import { ManualScoreForm } from "@/components/teacher/manual-score-form";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface SubmissionData {
  id: string;
  title: string;
  sourceCode: string | null;
  autoScore: number | null;
  manualScore: number | null;
  finalScore: number | null;
  maxPoints: number;
  testResults: {
    passed: boolean;
    input: string | null;
    expectedOutput: string;
    actualOutput: string | null;
    stderr: string | null;
    status: string | null;
  }[];
}

interface DetailData {
  student: {
    identifier: string;
    name: string;
    className: string;
    matricule: string;
  };
  participation: {
    connectedAt?: string | null;
    submittedAt?: string | null;
    ipAddress?: string | null;
    autoScore: number | null;
    finalScore: number | null;
    submissionReason?: string | null;
  };
  incidents: {
    id: string;
    type: string;
    occurredAt: string;
    payload?: string | null;
  }[];
  submissions: SubmissionData[];
}

export function SubmissionReview({
  examId,
  participationId,
  data,
}: {
  examId: string;
  participationId: string;
  data: DetailData;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-semibold">{data.student.name}</h2>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Identifiant</dt>
            <dd className="font-mono">{data.student.identifier}</dd>
          </div>
          <div>
            <dt className="text-muted">Classe</dt>
            <dd>{data.student.className}</dd>
          </div>
          <div>
            <dt className="text-muted">Connexion</dt>
            <dd>
              {data.participation.connectedAt
                ? new Date(data.participation.connectedAt).toLocaleString("fr-FR")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Soumission</dt>
            <dd>
              {data.participation.submittedAt
                ? new Date(data.participation.submittedAt).toLocaleString("fr-FR")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">IP</dt>
            <dd>{data.participation.ipAddress ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Score final</dt>
            <dd className="text-lg font-semibold text-accent">
              {data.participation.finalScore?.toFixed(2) ?? "—"}
            </dd>
          </div>
        </dl>
      </Card>

      {data.submissions.map((sub) => (
        <Card key={sub.id}>
          <h3 className="font-semibold">{sub.title}</h3>
          <p className="mt-1 text-sm text-muted">
            Score auto : {sub.autoScore?.toFixed(2) ?? "—"} / {sub.maxPoints} pts
          </p>

          <div className="mt-4 min-h-[200px] overflow-hidden rounded-xl border border-card-border">
            <Monaco
              height="200px"
              language="python"
              theme="vs-dark"
              value={sub.sourceCode ?? ""}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
              }}
            />
          </div>

          {sub.testResults.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Tests unitaires</h4>
              {sub.testResults.map((tr, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-card-border p-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={tr.passed ? "success" : "danger"}>
                      {tr.passed ? "OK" : "Échec"}
                    </Badge>
                    <span className="text-muted">{tr.status}</span>
                  </div>
                  <pre className="mt-2 text-muted">Entrée : {tr.input ?? "—"}</pre>
                  <pre>Attendu : {tr.expectedOutput}</pre>
                  <pre>Obtenu : {tr.actualOutput ?? "—"}</pre>
                  {tr.stderr ? (
                    <pre className="text-danger">{tr.stderr}</pre>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      ))}

      <Card>
        <h3 className="mb-4 font-semibold">Journal des incidents</h3>
        <IncidentTimeline incidents={data.incidents} />
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold">Correction manuelle</h3>
        <ManualScoreForm
          examId={examId}
          participationId={participationId}
          initialScore={data.participation.finalScore}
          submissionScores={data.submissions.map((s) => ({
            submissionId: s.id,
            title: s.title,
            autoScore: s.autoScore,
            maxPoints: s.maxPoints,
          }))}
        />
      </Card>
    </div>
  );
}
