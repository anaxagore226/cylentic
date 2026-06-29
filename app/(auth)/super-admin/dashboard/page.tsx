import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  requireSuperAdmin,
  SUPER_ADMIN_NAV_GROUPS,
} from "@/lib/super-admin/context";
import { superAdminService } from "@/lib/services/super-admin.service";
import {
  ChartLegend,
  CompletionGauge,
  DashboardChartCard,
  ExamStatusDonutChart,
  ExamsByMonthChart,
  ParticipationTrendChart,
} from "@/components/teacher/dashboard/teacher-charts";
import {
  SuperAdminDashboardKpis,
  SuperAdminEstablishmentsTable,
  SuperAdminPlanLegend,
  SuperAdminQuickActions,
} from "@/components/super-admin/dashboard/super-admin-dashboard-panels";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default async function SuperAdminDashboardPage() {
  const ctx = await requireSuperAdmin();
  if (!ctx) redirect("/login");

  const stats = await superAdminService.getDashboardStats();

  return (
    <DashboardShell
      nav={SUPER_ADMIN_NAV_GROUPS}
      title="Tableau de bord"
      userName={`${ctx.admin.firstName} ${ctx.admin.lastName}`}
      roleLabel="Super Administrateur — Cylentic"
      headerExtra={
        <Link href="/super-admin/establishments" className="hidden sm:block">
          <Button size="sm">
            <Building2 className="h-4 w-4" />
            Établissements
          </Button>
        </Link>
      }
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{getGreeting()},</p>
          <h2 className="text-2xl font-bold tracking-tight">
            {ctx.admin.firstName} {ctx.admin.lastName}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Vue globale de la plateforme : établissements, utilisateurs et
            activité des examens.
          </p>
        </div>
      </div>

      <SuperAdminDashboardKpis kpis={stats.kpis} />

      <div className="mt-6">
        <SuperAdminQuickActions />
      </div>

      <section id="statistiques" className="mt-8 scroll-mt-24">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Statistiques</h2>
          <p className="text-sm text-muted">
            Croissance et activité sur l&apos;ensemble de la plateforme
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <DashboardChartCard
            className="lg:col-span-2"
            title="Participations aux examens"
            subtitle="Activité étudiante sur les 30 derniers jours"
          >
            <ParticipationTrendChart data={stats.participationTrend} />
          </DashboardChartCard>

          <DashboardChartCard
            title="Taux de complétion"
            subtitle="Copies finalisées — plateforme entière"
          >
            <CompletionGauge rate={stats.kpis.completionRate} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-xl bg-surface-subtle px-3 py-2">
                <p className="font-semibold text-accent">
                  {stats.kpis.totalParticipations}
                </p>
                <p className="text-xs text-muted">Participations</p>
              </div>
              <div className="rounded-xl bg-surface-subtle px-3 py-2">
                <p className="font-semibold text-amber-400">
                  {stats.kpis.incidentCount}
                </p>
                <p className="text-xs text-muted">Incidents</p>
              </div>
            </div>
          </DashboardChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DashboardChartCard
            title="Nouveaux établissements"
            subtitle="Inscriptions sur les 6 derniers mois"
          >
            <ExamsByMonthChart data={stats.establishmentsByMonth} />
          </DashboardChartCard>

          <DashboardChartCard
            title="Examens créés"
            subtitle="Volume global sur 6 mois"
          >
            <ExamsByMonthChart data={stats.examsByMonth} />
          </DashboardChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <DashboardChartCard
            className="lg:col-span-2"
            title="Nouvelles inscriptions"
            subtitle="Établissements créés sur les 30 derniers jours"
          >
            <ParticipationTrendChart data={stats.establishmentGrowthTrend} />
          </DashboardChartCard>

          <DashboardChartCard
            title="Abonnements par plan"
            subtitle="Répartition des établissements"
          >
            <ExamStatusDonutChart data={stats.planUsage} />
            <SuperAdminPlanLegend items={stats.planUsage} />
          </DashboardChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DashboardChartCard
            title="Répartition des utilisateurs"
            subtitle="Par rôle sur la plateforme"
          >
            <ExamStatusDonutChart data={stats.userRoleChart} />
            <ChartLegend items={stats.userRoleChart} />
          </DashboardChartCard>
        </div>
      </section>

      <Card className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Établissements récents</h3>
            <p className="text-sm text-muted">
              Dernières inscriptions sur la plateforme
            </p>
          </div>
          <Link href="/super-admin/establishments">
            <Button variant="secondary" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <SuperAdminEstablishmentsTable
          establishments={stats.recentEstablishments}
        />
      </Card>
    </DashboardShell>
  );
}
