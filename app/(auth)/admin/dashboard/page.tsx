import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { ADMIN_NAV, requireAdmin } from "@/lib/admin/context";

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      establishment: {
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!fullUser) return null;

  const establishmentId = fullUser.establishmentId;

  const [studentCount, teacherCount, examCount, incidentCount] =
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
    ]);

  const subscription = fullUser.establishment.subscriptions[0];
  const plan = subscription?.plan;

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
      userName={`${fullUser.firstName} ${fullUser.lastName}`}
      roleLabel={`Admin — ${fullUser.establishment.name}`}
    >
      {subscription?.isSimulated ? (
        <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          Paiement en cours d&apos;intégration — mode{" "}
          <strong>{plan?.name ?? "Pro"}</strong> actif
          {subscription.trialEndsAt
            ? ` jusqu'au ${subscription.trialEndsAt.toLocaleDateString("fr-FR")}`
            : ""}
          .
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

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Plan tarifaire</h2>
          <Badge variant="success">{plan?.name ?? "—"}</Badge>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Professeurs max</dt>
            <dd className="font-medium">
              {plan?.maxTeachers ?? "Illimité"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Étudiants max</dt>
            <dd className="font-medium">
              {plan?.maxStudents ?? "Illimité"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Examens / mois</dt>
            <dd className="font-medium">
              {plan?.maxExamsPerMonth ?? "Illimité"}
            </dd>
          </div>
        </dl>
      </Card>
    </DashboardShell>
  );
}
