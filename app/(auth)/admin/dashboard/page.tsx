import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { billingService } from "@/lib/services/billing.service";
import { ADMIN_NAV, requireAdmin } from "@/lib/admin/context";

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();

  const establishmentId = user.establishmentId;

  const [studentCount, teacherCount, examCount, incidentCount, billing] =
    await Promise.all([
      prisma.user.count({
        where: { establishmentId, role: "student", isActive: true },
      }),
      prisma.user.count({
        where: { establishmentId, role: "teacher", isActive: true },
      }),
      prisma.exam.count({ where: { establishmentId } }),
      prisma.incident.count({
        where: {
          participation: { exam: { establishmentId } },
        },
      }),
      billingService.getOverview(establishmentId).catch(() => null),
    ]);

  const stats = [
    { label: "Étudiants actifs", value: studentCount },
    { label: "Professeurs actifs", value: teacherCount },
    { label: "Examens créés", value: examCount },
    { label: "Incidents détectés", value: incidentCount },
  ];

  return (
    <DashboardShell
      nav={ADMIN_NAV}
      title="Tableau de bord"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
    >
      {billing?.subscription.isSimulated ? (
        <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          Paiement en cours d&apos;intégration — plan{" "}
          <strong>{billing.plan.name}</strong> actif
          {billing.subscription.trialEndsAt
            ? ` jusqu'au ${new Date(billing.subscription.trialEndsAt).toLocaleDateString("fr-FR")}`
            : ""}
          .{" "}
          <Link href="/admin/subscription" className="underline">
            Gérer l&apos;abonnement
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs uppercase tracking-wider text-muted">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </div>

      {billing ? (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Plan tarifaire</h2>
              <p className="text-sm text-muted">{billing.plan.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">{billing.plan.name}</Badge>
              <Link href="/admin/subscription">
                <Button variant="secondary" size="sm">
                  Voir l&apos;abonnement
                </Button>
              </Link>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Professeurs</dt>
              <dd className="font-medium">
                {billing.consumption.teachers.current}
                {billing.consumption.teachers.max != null
                  ? ` / ${billing.consumption.teachers.max}`
                  : " / Illimité"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Étudiants</dt>
              <dd className="font-medium">
                {billing.consumption.students.current}
                {billing.consumption.students.max != null
                  ? ` / ${billing.consumption.students.max}`
                  : " / Illimité"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Examens ce mois</dt>
              <dd className="font-medium">
                {billing.consumption.examsThisMonth.current}
                {billing.consumption.examsThisMonth.max != null
                  ? ` / ${billing.consumption.examsThisMonth.max}`
                  : " / Illimité"}
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}
    </DashboardShell>
  );
}
