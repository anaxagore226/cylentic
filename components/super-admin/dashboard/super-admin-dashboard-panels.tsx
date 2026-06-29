import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  FileText,
  Globe,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { SuperAdminDashboardStats } from "@/lib/services/super-admin.service";

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
              {trend}% nouveaux établissements
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

export function SuperAdminDashboardKpis({
  kpis,
}: {
  kpis: SuperAdminDashboardStats["kpis"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Établissements"
        value={kpis.establishmentCount}
        hint={`${kpis.activeEstablishments} actifs`}
        icon={<Building2 className="h-5 w-5" />}
        trend={kpis.establishmentGrowthDelta}
        accent="purple"
      />
      <KpiCard
        label="Utilisateurs"
        value={kpis.userCount}
        hint={`${kpis.totalParticipations} participations`}
        icon={<Users className="h-5 w-5" />}
        accent="green"
      />
      <KpiCard
        label="Examens"
        value={kpis.examCount}
        hint={`${kpis.completionRate}% de complétion`}
        icon={<FileText className="h-5 w-5" />}
        accent="blue"
      />
      <KpiCard
        label="Incidents"
        value={kpis.incidentCount}
        hint="Anti-triche plateforme"
        icon={<AlertTriangle className="h-5 w-5" />}
        accent="amber"
      />
    </div>
  );
}

export function SuperAdminQuickActions() {
  const actions = [
    {
      href: "/super-admin/establishments",
      label: "Gérer les établissements",
      icon: Building2,
    },
    { href: "/super-admin/plans", label: "Configurer les plans", icon: Globe },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
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

export function SuperAdminEstablishmentsTable({
  establishments,
}: {
  establishments: SuperAdminDashboardStats["recentEstablishments"];
}) {
  if (establishments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Aucun établissement inscrit.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
            <th className="pb-3 font-medium">Établissement</th>
            <th className="pb-3 font-medium">Plan</th>
            <th className="pb-3 font-medium">Utilisateurs</th>
            <th className="pb-3 font-medium">Examens</th>
            <th className="pb-3 font-medium">Statut</th>
            <th className="pb-3 font-medium">Inscrit le</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {establishments.map((e) => (
            <tr
              key={e.id}
              className="transition-colors hover:bg-surface-subtle/50"
            >
              <td className="py-3.5 pr-4">
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-muted">{e.acronym}</p>
              </td>
              <td className="py-3.5 pr-4">
                <Badge variant="success">{e.planName}</Badge>
              </td>
              <td className="py-3.5 pr-4 text-muted">{e.userCount}</td>
              <td className="py-3.5 pr-4 text-muted">{e.examCount}</td>
              <td className="py-3.5 pr-4">
                <Badge variant={e.isActive ? "success" : "danger"}>
                  {e.isActive ? "Actif" : "Inactif"}
                </Badge>
              </td>
              <td className="py-3.5 text-muted">
                {new Date(e.createdAt).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SuperAdminPlanLegend({
  items,
}: {
  items: SuperAdminDashboardStats["planUsage"];
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        Aucun abonnement actif.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-surface-subtle/40 px-4 py-3"
        >
          <span className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            {item.label}
          </span>
          <span className="font-semibold">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
