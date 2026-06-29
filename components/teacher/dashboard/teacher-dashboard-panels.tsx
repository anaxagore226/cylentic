import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ClipboardCheck,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { TeacherDashboardStats } from "@/lib/services/teacher-dashboard.service";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  trend?: number;
  accent?: "green" | "blue" | "purple" | "amber" | "red";
}

const accentStyles = {
  green: "bg-emerald-500/10 text-emerald-400",
  blue: "bg-blue-500/10 text-blue-400",
  purple: "bg-violet-500/10 text-violet-400",
  amber: "bg-amber-500/10 text-amber-400",
  red: "bg-red-500/10 text-red-400",
};

function KpiCard({ label, value, hint, icon, trend, accent = "green" }: KpiCardProps) {
  const trendUp = trend != null && trend >= 0;

  return (
    <Card className="relative overflow-hidden transition-colors hover:border-accent/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
          {trend != null ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                trendUp ? "text-emerald-400" : "text-red-400",
              )}
            >
              {trendUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend > 0 ? "+" : ""}
              {trend}% vs. période précédente
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accentStyles[accent],
          )}
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}

export function TeacherDashboardKpis({
  kpis,
}: {
  kpis: TeacherDashboardStats["kpis"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Examens"
        value={kpis.totalExams}
        hint={`${kpis.inProgressExams} en cours`}
        icon={<FileText className="h-5 w-5" />}
        accent="purple"
      />
      <KpiCard
        label="Participations"
        value={kpis.totalParticipations}
        hint={`${kpis.currentPeriodParticipations} sur 30 jours`}
        icon={<Users className="h-5 w-5" />}
        trend={kpis.participationTrendDelta}
        accent="green"
      />
      <KpiCard
        label="Étudiants touchés"
        value={kpis.uniqueStudents}
        hint={`${kpis.completionRate}% de complétion`}
        icon={<ClipboardCheck className="h-5 w-5" />}
        accent="blue"
      />
      <KpiCard
        label="Score moyen"
        value={kpis.averageScore != null ? `${kpis.averageScore}` : "—"}
        hint={`${kpis.exerciseCount} exercices créés`}
        icon={<BookOpen className="h-5 w-5" />}
        accent="amber"
      />
    </div>
  );
}

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  in_progress: "En cours",
  finished: "Terminé",
  archived: "Archivé",
};

const statusVariant: Record<string, string> = {
  draft: "bg-surface-subtle text-muted border-card-border",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  finished: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  archived: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export function RecentExamsTable({
  exams,
}: {
  exams: TeacherDashboardStats["recentExams"];
}) {
  if (exams.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Aucun examen créé.{" "}
        <Link href="/teacher/exams/new" className="text-accent hover:underline">
          Créer votre premier examen
        </Link>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
            <th className="pb-3 font-medium">Examen</th>
            <th className="pb-3 font-medium">Statut</th>
            <th className="pb-3 font-medium">Exercices</th>
            <th className="pb-3 font-medium">Participants</th>
            <th className="pb-3 font-medium">Mis à jour</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {exams.map((exam) => (
            <tr key={exam.id} className="group transition-colors hover:bg-surface-subtle/50">
              <td className="py-3.5 pr-4">
                <Link
                  href={`/teacher/exams/${exam.id}`}
                  className="font-medium transition-colors group-hover:text-accent"
                >
                  {exam.name}
                </Link>
              </td>
              <td className="py-3.5 pr-4">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    statusVariant[exam.status] ?? statusVariant.draft,
                  )}
                >
                  {statusLabels[exam.status] ?? exam.status}
                </span>
              </td>
              <td className="py-3.5 pr-4 text-muted">{exam.exercises}</td>
              <td className="py-3.5 pr-4 text-muted">{exam.participations}</td>
              <td className="py-3.5 text-muted">
                {new Date(exam.updatedAt).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LiveExamsPanel({
  exams,
}: {
  exams: TeacherDashboardStats["liveExams"];
}) {
  if (exams.length === 0) {
    return (
      <p className="py-6 text-sm text-muted">
        Aucun examen publié ou en cours pour le moment.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {exams.map((exam) => (
        <li
          key={exam.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-surface-subtle/40 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{exam.name}</p>
            <p className="text-xs text-muted">
              {exam.participations} participant
              {exam.participations !== 1 ? "s" : ""}
              {exam.startAt
                ? ` · ${new Date(exam.startAt).toLocaleString("fr-FR")}`
                : ""}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/teacher/exams/${exam.id}/live`}
              className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Live
            </Link>
            <Link
              href={`/teacher/exams/${exam.id}`}
              className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              Voir
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RecentActivityTable({
  submissions,
  incidentCount,
}: {
  submissions: TeacherDashboardStats["recentSubmissions"];
  incidentCount: number;
}) {
  return (
    <div className="space-y-4">
      {incidentCount > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong className="text-amber-300">{incidentCount}</strong> incident
            {incidentCount > 1 ? "s" : ""} anti-triche détecté
            {incidentCount > 1 ? "s" : ""} sur vos examens.
          </span>
        </div>
      ) : null}

      {submissions.length === 0 ? (
        <p className="py-4 text-sm text-muted">Aucune soumission récente.</p>
      ) : (
        <ul className="divide-y divide-card-border">
          {submissions.map((s) => (
            <li
              key={s.participationId}
              className="flex items-center justify-between gap-3 py-3 first:pt-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{s.studentName}</p>
                <p className="truncate text-xs text-muted">{s.examName}</p>
              </div>
              <div className="shrink-0 text-right">
                {s.finalScore != null ? (
                  <p className="text-sm font-semibold text-accent">
                    {s.finalScore} pts
                  </p>
                ) : (
                  <p className="text-xs text-muted">En cours</p>
                )}
                {s.submittedAt ? (
                  <p className="text-xs text-muted">
                    {new Date(s.submittedAt).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
