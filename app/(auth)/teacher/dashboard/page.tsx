import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { teacherDashboardService } from "@/lib/services/teacher-dashboard.service";
import { TEACHER_NAV_GROUPS } from "@/lib/teacher/nav";
import {
  ChartLegend,
  CompletionGauge,
  DashboardChartCard,
  ExamStatusDonutChart,
  ExamsByMonthChart,
  ParticipationTrendChart,
} from "@/components/teacher/dashboard/teacher-charts";
import {
  LiveExamsPanel,
  RecentActivityTable,
  RecentExamsTable,
  TeacherDashboardKpis,
} from "@/components/teacher/dashboard/teacher-dashboard-panels";
import { PlusCircle } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default async function TeacherDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });
  if (!user) redirect("/login");

  const stats = await teacherDashboardService.getStats(user.id);

  return (
    <DashboardShell
      nav={TEACHER_NAV_GROUPS}
      title="Tableau de bord"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
      headerExtra={
        <Link href="/teacher/exams/new" className="hidden sm:block">
          <Button size="sm">
            <PlusCircle className="h-4 w-4" />
            Nouvel examen
          </Button>
        </Link>
      }
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{getGreeting()},</p>
          <h2 className="text-2xl font-bold tracking-tight">
            {user.firstName} {user.lastName}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Vue d&apos;ensemble de vos examens, participations et performances
            étudiantes.
          </p>
        </div>
        <Link href="/teacher/exams/new" className="sm:hidden">
          <Button size="sm">
            <PlusCircle className="h-4 w-4" />
            Nouvel examen
          </Button>
        </Link>
      </div>

      <TeacherDashboardKpis kpis={stats.kpis} />

      <section id="statistiques" className="mt-8 scroll-mt-24">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Statistiques</h2>
          <p className="text-sm text-muted">
            Tendances et répartition de votre activité pédagogique
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <DashboardChartCard
            className="lg:col-span-2"
            title="Connexions étudiantes"
            subtitle="Participations enregistrées sur les 30 derniers jours"
          >
            <ParticipationTrendChart data={stats.participationTrend} />
          </DashboardChartCard>

          <DashboardChartCard title="Taux de complétion" subtitle="Copies finalisées">
            <CompletionGauge rate={stats.kpis.completionRate} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-xl bg-surface-subtle px-3 py-2">
                <p className="font-semibold text-accent">
                  {stats.kpis.totalParticipations}
                </p>
                <p className="text-xs text-muted">Total</p>
              </div>
              <div className="rounded-xl bg-surface-subtle px-3 py-2">
                <p className="font-semibold text-blue-400">
                  {Math.round(
                    (stats.kpis.completionRate / 100) *
                      stats.kpis.totalParticipations,
                  )}
                </p>
                <p className="text-xs text-muted">Complétées</p>
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
            subtitle="Vue globale de votre catalogue d'examens"
          >
            <ExamStatusDonutChart data={stats.examStatusChart} />
            <ChartLegend items={stats.examStatusChart} />
          </DashboardChartCard>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card id="live" className="scroll-mt-24 lg:col-span-1">
          <h3 className="font-semibold">Examens actifs</h3>
          <p className="mt-1 text-sm text-muted">
            Accès rapide au suivi en direct
          </p>
          <div className="mt-4">
            <LiveExamsPanel exams={stats.liveExams} />
          </div>
        </Card>

        <Card id="activite" className="scroll-mt-24 lg:col-span-2">
          <h3 className="font-semibold">Activité récente</h3>
          <p className="mt-1 text-sm text-muted">
            Dernières soumissions et alertes anti-triche
          </p>
          <div className="mt-4">
            <RecentActivityTable
              submissions={stats.recentSubmissions}
              incidentCount={stats.kpis.incidentCount}
            />
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Examens récents</h3>
            <p className="text-sm text-muted">
              Vos derniers examens modifiés
            </p>
          </div>
          <Link href="/teacher/exams">
            <Button variant="secondary" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <RecentExamsTable exams={stats.recentExams} />
      </Card>
    </DashboardShell>
  );
}
