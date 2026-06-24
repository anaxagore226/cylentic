import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AccessCodeDisplay,
  PublishExamButton,
} from "@/components/teacher/access-code-display";
import { ExerciseCodeForm } from "@/components/teacher/exercise-code-form";
import { ExerciseQcmForm } from "@/components/teacher/exercise-qcm-form";

const TEACHER_NAV = [
  { href: "/teacher/dashboard", label: "Tableau de bord" },
  { href: "/teacher/exams", label: "Mes examens" },
  { href: "/teacher/exams/new", label: "Créer un examen" },
];

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const { examId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });
  if (!user) redirect("/login");

  const exam = await prisma.exam.findFirst({
    where: { id: examId, teacherId: user.id },
    include: {
      exercises: { orderBy: { orderIndex: "asc" } },
      examClasses: { include: { class: true } },
    },
  });

  if (!exam) notFound();

  const canPublish = exam.status === "draft" && exam.exercises.length > 0;

  return (
    <DashboardShell
      nav={TEACHER_NAV}
      title={exam.name}
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Badge>{exam.status}</Badge>
        {exam.startAt ? (
          <span className="text-sm text-muted">
            Début : {exam.startAt.toLocaleString("fr-FR")}
          </span>
        ) : null}
      </div>

      {exam.accessCode ? (
        <div className="mb-6">
          <AccessCodeDisplay code={exam.accessCode} />
          <div className="mt-4 flex gap-3">
            <Link href={`/teacher/exams/${exam.id}/presentation`}>
              <Button variant="secondary">Mode présentation</Button>
            </Link>
            <Link href={`/teacher/exams/${exam.id}/live`}>
              <Button variant="secondary">Suivi live</Button>
            </Link>
            <Link href={`/teacher/exams/${exam.id}/results`}>
              <Button variant="secondary">Résultats</Button>
            </Link>
          </div>
        </div>
      ) : canPublish ? (
        <div className="mb-6">
          <PublishExamButton examId={exam.id} />
        </div>
      ) : exam.status === "draft" ? (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5 text-sm text-amber-300">
          Ajoutez au moins un exercice avant de publier.
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Informations</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Durée</dt>
              <dd>{exam.durationMinutes} min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Délai retardataires</dt>
              <dd>{exam.accessDelayMinutes} min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Correction</dt>
              <dd>{exam.correctionMode}</dd>
            </div>
            <div>
              <dt className="text-muted">Classes</dt>
              <dd className="mt-1">
                {exam.examClasses.map((ec) => ec.class.name).join(", ") || "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-semibold">
            Exercices ({exam.exercises.length})
          </h2>
          {exam.status === "draft" ? (
            <div className="mt-4 space-y-6">
              <ExerciseCodeForm examId={exam.id} />
              <ExerciseQcmForm examId={exam.id} />
            </div>
          ) : null}
          {exam.exercises.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Aucun exercice — ajoutez-en un ci-dessus.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-card-border">
              {exam.exercises.map((ex) => (
                <li key={ex.id} className="py-2 first:pt-0">
                  <span className="font-medium">{ex.title}</span>
                  <span className="ml-2 text-xs text-muted">
                    {ex.type} · {String(ex.points)} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
