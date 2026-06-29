import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { AdminDashboardStats } from "@/lib/services/admin-dashboard.service";

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

export function AdminDashboardKpis({
  kpis,
}: {
  kpis: AdminDashboardStats["kpis"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Étudiants actifs"
        value={kpis.studentCount}
        hint={`${kpis.classCount} classes`}
        icon={<GraduationCap className="h-5 w-5" />}
        accent="green"
      />
      <KpiCard
        label="Professeurs"
        value={kpis.teacherCount}
        hint={`${kpis.adminCount} administrateur${kpis.adminCount > 1 ? "s" : ""}`}
        icon={<Users className="h-5 w-5" />}
        accent="blue"
      />
      <KpiCard
        label="Participations"
        value={kpis.totalParticipations}
        hint={`${kpis.currentPeriodParticipations} sur 30 jours`}
        icon={<ClipboardList className="h-5 w-5" />}
        trend={kpis.participationTrendDelta}
        accent="purple"
      />
      <KpiCard
        label="Examens"
        value={kpis.totalExams}
        hint={`${kpis.inProgressExams} en cours · ${kpis.completionRate}% complétion`}
        icon={<FileText className="h-5 w-5" />}
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

export function AdminRecentExamsTable({
  exams,
}: {
  exams: AdminDashboardStats["recentExams"];
}) {
  if (exams.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Aucun examen créé dans l&apos;établissement.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
            <th className="pb-3 font-medium">Examen</th>
            <th className="pb-3 font-medium">Professeur</th>
            <th className="pb-3 font-medium">Statut</th>
            <th className="pb-3 font-medium">Participants</th>
            <th className="pb-3 font-medium">Mis à jour</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {exams.map((exam) => (
            <tr key={exam.id} className="transition-colors hover:bg-surface-subtle/50">
              <td className="py-3.5 pr-4 font-medium">{exam.name}</td>
              <td className="py-3.5 pr-4 text-muted">{exam.teacherName}</td>
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

export function AdminLiveExamsPanel({
  exams,
}: {
  exams: AdminDashboardStats["liveExams"];
}) {
  if (exams.length === 0) {
    return (
      <p className="py-6 text-sm text-muted">
        Aucun examen publié ou en cours actuellement.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {exams.map((exam) => (
        <li
          key={exam.id}
          className="rounded-xl border border-card-border bg-surface-subtle/40 px-4 py-3"
        >
          <p className="truncate font-medium">{exam.name}</p>
          <p className="text-xs text-muted">
            {exam.teacherName} · {exam.participations} participant
            {exam.participations !== 1 ? "s" : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AdminActivityPanel({
  logs,
  incidentCount,
}: {
  logs: AdminDashboardStats["recentLogs"];
  incidentCount: number;
}) {
  return (
    <div className="space-y-4">
      {incidentCount > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong className="text-amber-300">{incidentCount}</strong> incident
            {incidentCount > 1 ? "s" : ""} anti-triche sur l&apos;établissement.
          </span>
        </div>
      ) : null}

      {logs.length === 0 ? (
        <p className="py-4 text-sm text-muted">Aucune activité récente.</p>
      ) : (
        <ul className="divide-y divide-card-border">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-accent">
                  {log.action}
                </p>
                <p className="truncate text-xs text-muted">{log.actorName}</p>
              </div>
              <time className="shrink-0 text-xs text-muted">
                {new Date(log.createdAt).toLocaleString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/admin/activity-logs"
        className="inline-block text-sm text-accent hover:underline"
      >
        Voir tout le journal
      </Link>
    </div>
  );
}

interface UsageBarProps {
  label: string;
  current: number;
  max: number | null;
  percent: number | null;
  level: "ok" | "warning" | "exceeded";
}

function UsageBar({ label, current, max, percent, level }: UsageBarProps) {
  const width = percent ?? (max == null ? 30 : 0);
  const barColor =
    level === "exceeded"
      ? "bg-red-500"
      : level === "warning"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium">
          {current}
          {max != null ? ` / ${max}` : " / Illimité"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${max == null ? 30 : Math.min(100, width)}%` }}
        />
      </div>
    </div>
  );
}

export function AdminBillingPanel({
  billing,
}: {
  billing: {
    planName: string;
    isSimulated: boolean;
    trialEndsAt: string | null;
    consumption: {
      teachers: { current: number; max: number | null; percent: number | null; level: "ok" | "warning" | "exceeded" };
      students: { current: number; max: number | null; percent: number | null; level: "ok" | "warning" | "exceeded" };
      examsThisMonth: { current: number; max: number | null; percent: number | null; level: "ok" | "warning" | "exceeded" };
    };
  };
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Plan tarifaire</h3>
          <p className="mt-1 text-sm text-muted">{billing.planName}</p>
          {billing.isSimulated ? (
            <p className="mt-2 text-xs text-accent">
              Paiement en cours d&apos;intégration
              {billing.trialEndsAt
                ? ` — essai jusqu'au ${new Date(billing.trialEndsAt).toLocaleDateString("fr-FR")}`
                : ""}
            </p>
          ) : null}
        </div>
        <Link
          href="/admin/subscription"
          className="rounded-xl border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent/40 hover:text-accent"
        >
          Gérer l&apos;abonnement
        </Link>
      </div>

      <div className="mt-6 space-y-5">
        <UsageBar
          label="Professeurs"
          current={billing.consumption.teachers.current}
          max={billing.consumption.teachers.max}
          percent={billing.consumption.teachers.percent}
          level={billing.consumption.teachers.level}
        />
        <UsageBar
          label="Étudiants"
          current={billing.consumption.students.current}
          max={billing.consumption.students.max}
          percent={billing.consumption.students.percent}
          level={billing.consumption.students.level}
        />
        <UsageBar
          label="Examens ce mois"
          current={billing.consumption.examsThisMonth.current}
          max={billing.consumption.examsThisMonth.max}
          percent={billing.consumption.examsThisMonth.percent}
          level={billing.consumption.examsThisMonth.level}
        />
      </div>
    </Card>
  );
}

export function AdminQuickActions() {
  const actions = [
    { href: "/admin/students", label: "Gérer les étudiants", icon: GraduationCap },
    { href: "/admin/teachers", label: "Gérer les professeurs", icon: Users },
    { href: "/admin/classes", label: "Gérer les classes", icon: BookOpen },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-xl border border-card-border bg-card/60 px-4 py-3 text-sm font-medium transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
