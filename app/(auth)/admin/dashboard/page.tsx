import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billingService } from "@/lib/services/billing.service";
import { onboardingService } from "@/lib/services/onboarding.service";
import { adminDashboardService } from "@/lib/services/admin-dashboard.service";
import { ADMIN_NAV_GROUPS, requireAdmin } from "@/lib/admin/context";
import {
  ChartLegend,
  CompletionGauge,
  DashboardChartCard,
  ExamStatusDonutChart,
  ExamsByMonthChart,
  ParticipationTrendChart,
} from "@/components/teacher/dashboard/teacher-charts";
import {
  AdminActivityPanel,
  AdminBillingPanel,
  AdminDashboardKpis,
  AdminLiveExamsPanel,
  AdminQuickActions,
  AdminRecentExamsTable,
} from "@/components/admin/dashboard/admin-dashboard-panels";
import { GraduationCap } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();
  const establishmentId = user.establishmentId;

  const onboarding = await onboardingService
    .getStatus(establishmentId)
    .catch(() => null);

  if (onboarding && !onboarding.isComplete) {
    redirect("/admin/onboarding");
  }

  const [stats, billing] = await Promise.all([
    adminDashboardService.getStats(establishmentId),
    billingService.getOverview(establishmentId).catch(() => null),
  ]);

  return (
    <DashboardShell
      nav={ADMIN_NAV_GROUPS}
      title="Tableau de bord"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
      headerExtra={
        <Link href="/admin/students" className="hidden sm:block">
          <Button size="sm">
            <GraduationCap className="h-4 w-4" />
            Gérer les étudiants
          </Button>
        </Link>
      }
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{getGreeting()},</p>
          <h2 className="text-2xl font-bold tracking-tight">
            {user.establishment.name}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Pilotage de l&apos;établissement : utilisateurs, examens et
            consommation de la plateforme.
          </p>
        </div>
      </div>

      <AdminDashboardKpis kpis={stats.kpis} />

      <div className="mt-6">
        <AdminQuickActions />
      </div>

      <section id="statistiques" className="mt-8 scroll-mt-24">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Statistiques</h2>
          <p className="text-sm text-muted">
            Activité des examens et tendances de l&apos;établissement
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <DashboardChartCard
            className="lg:col-span-2"
            title="Participations étudiantes"
            subtitle="Connexions aux examens sur les 30 derniers jours"
          >
            <ParticipationTrendChart data={stats.participationTrend} />
          </DashboardChartCard>

          <DashboardChartCard
            title="Taux de complétion"
            subtitle="Copies finalisées sur l'établissement"
          >
            <CompletionGauge rate={stats.kpis.completionRate} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-xl bg-surface-subtle px-3 py-2">
                <p className="font-semibold text-accent">
                  {stats.kpis.totalParticipations}
                </p>
                <p className="text-xs text-muted">Total</p>
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
            title="Examens créés"
            subtitle="Évolution sur les 6 derniers mois"
          >
            <ExamsByMonthChart data={stats.examsByMonth} />
          </DashboardChartCard>

          <DashboardChartCard
            title="Répartition par statut"
            subtitle="Tous les examens de l'établissement"
          >
            <ExamStatusDonutChart data={stats.examStatusChart} />
            <ChartLegend items={stats.examStatusChart} />
          </DashboardChartCard>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="font-semibold">Examens actifs</h3>
          <p className="mt-1 text-sm text-muted">
            Sessions publiées ou en cours
          </p>
          <div className="mt-4">
            <AdminLiveExamsPanel exams={stats.liveExams} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold">Activité récente</h3>
          <p className="mt-1 text-sm text-muted">
            Dernières actions administratives
          </p>
          <div className="mt-4">
            <AdminActivityPanel
              logs={stats.recentLogs}
              incidentCount={stats.kpis.incidentCount}
            />
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-4">
              <h3 className="font-semibold">Examens récents</h3>
              <p className="text-sm text-muted">
                Derniers examens modifiés dans l&apos;établissement
              </p>
            </div>
            <AdminRecentExamsTable exams={stats.recentExams} />
          </Card>
        </div>

        {billing ? (
          <AdminBillingPanel
            billing={{
              planName: billing.plan.name,
              isSimulated: billing.subscription.isSimulated,
              trialEndsAt: billing.subscription.trialEndsAt,
              consumption: billing.consumption,
            }}
          />
        ) : (
          <Card>
            <h3 className="font-semibold">Abonnement</h3>
            <p className="mt-2 text-sm text-muted">
              Informations d&apos;abonnement indisponibles.
            </p>
            <Link
              href="/admin/subscription"
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              Voir l&apos;abonnement
            </Link>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
