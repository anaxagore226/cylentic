import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TEACHER_NAV = [
  { href: "/teacher/dashboard", label: "Tableau de bord" },
  { href: "/teacher/exams", label: "Mes examens" },
  { href: "/teacher/exams/new", label: "Créer un examen" },
];

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  in_progress: "En cours",
  finished: "Terminé",
  archived: "Archivé",
};

const statusVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  draft: "default",
  published: "success",
  in_progress: "warning",
  finished: "default",
  archived: "default",
};

export default async function TeacherDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });
  if (!user) redirect("/login");

  const exams = await prisma.exam.findMany({
    where: { teacherId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const counts = {
    draft: exams.filter((e) => e.status === "draft").length,
    published: exams.filter((e) => e.status === "published").length,
    in_progress: exams.filter((e) => e.status === "in_progress").length,
    finished: exams.filter((e) => e.status === "finished").length,
  };

  return (
    <DashboardShell
      nav={TEACHER_NAV}
      title="Tableau de bord professeur"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
    >
      <div className="mb-6 flex justify-end">
        <Link href="/teacher/exams/new">
          <Button>Créer un nouvel examen</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {Object.entries(counts).map(([key, value]) => (
          <Card key={key}>
            <p className="text-xs uppercase text-muted">
              {statusLabels[key]}
            </p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 font-semibold">Examens récents</h2>
        {exams.length === 0 ? (
          <p className="text-sm text-muted">
            Aucun examen pour le moment. Créez votre premier examen.
          </p>
        ) : (
          <ul className="divide-y divide-card-border">
            {exams.map((exam) => (
              <li
                key={exam.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <Link
                    href={`/teacher/exams/${exam.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {exam.name}
                  </Link>
                  {exam.startAt ? (
                    <p className="text-xs text-muted">
                      {exam.startAt.toLocaleString("fr-FR")}
                    </p>
                  ) : null}
                </div>
                <Badge variant={statusVariant[exam.status] ?? "default"}>
                  {statusLabels[exam.status] ?? exam.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}
