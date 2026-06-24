import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { examService } from "@/lib/services/exam.service";

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

export default async function TeacherExamsPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });
  if (!user) redirect("/login");

  const exams = await examService.listByTeacher(user.id);

  return (
    <DashboardShell
      nav={TEACHER_NAV}
      title="Mes examens"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
    >
      <div className="mb-6 flex justify-end">
        <Link href="/teacher/exams/new">
          <Button>Créer un examen</Button>
        </Link>
      </div>

      <Card>
        {exams.length === 0 ? (
          <p className="text-sm text-muted">Aucun examen.</p>
        ) : (
          <ul className="divide-y divide-card-border">
            {exams.map((exam) => (
              <li
                key={exam.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
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
                      {exam.startAt.toLocaleString("fr-FR")} · {exam.durationMinutes} min
                    </p>
                  ) : null}
                  {exam.accessCode ? (
                    <p className="mt-1 font-mono text-xs text-accent">
                      Code : {exam.accessCode}
                    </p>
                  ) : null}
                </div>
                <Badge>{statusLabels[exam.status] ?? exam.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}
