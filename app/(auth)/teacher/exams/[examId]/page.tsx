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
import { ExerciseComposer } from "@/components/teacher/exercise-composer";
import { ExerciseList } from "@/components/teacher/exercise-list";
import { DeleteExamButton } from "@/components/teacher/delete-exam-button";
import { ExportResultsButtons } from "@/components/teacher/export-buttons";
import { TEACHER_NAV_GROUPS } from "@/lib/teacher/nav";

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
  const isDraft = exam.status === "draft";

  return (
    <DashboardShell
      nav={TEACHER_NAV_GROUPS}
      title={exam.name}
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{exam.status}</Badge>
          {exam.startAt ? (
            <span className="text-sm text-muted">
              Début : {exam.startAt.toLocaleString("fr-FR")}
            </span>
          ) : null}
        </div>
        <DeleteExamButton examId={exam.id} examName={exam.name} />
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
          <div className="mt-4">
            <p className="mb-2 text-sm text-muted">Exporter les résultats</p>
            <ExportResultsButtons examId={exam.id} />
          </div>
        </div>
      ) : canPublish ? (
        <div className="mb-6">
          <PublishExamButton examId={exam.id} />
        </div>
      ) : isDraft ? (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5 text-sm text-amber-300">
          Ajoutez au moins un exercice avant de publier.
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit lg:col-span-1">
          <h2 className="font-semibold">Informations</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Durée</dt>
              <dd className="font-medium">{exam.durationMinutes} min</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Délai retardataires</dt>
              <dd className="font-medium">{exam.accessDelayMinutes} min</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Correction</dt>
              <dd className="font-medium">{exam.correctionMode}</dd>
            </div>
            <div>
              <dt className="text-muted">Classes</dt>
              <dd className="mt-1 font-medium">
                {exam.examClasses.map((ec) => ec.class.name).join(", ") || "—"}
              </dd>
            </div>
            <div className="border-t border-card-border pt-3">
              <dt className="text-muted">Exercices</dt>
              <dd className="mt-1 text-2xl font-semibold text-accent">
                {exam.exercises.length}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              Contenu de l&apos;examen
            </h2>
            <span className="text-sm text-muted">
              {exam.exercises.length} exercice
              {exam.exercises.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ExerciseList
            examId={exam.id}
            exercises={exam.exercises}
            editable={isDraft}
            emptyHint={
              isDraft
                ? "Commencez par composer votre premier exercice ci-dessous."
                : "Aucun exercice dans cet examen."
            }
          />
        </Card>
      </div>

      {isDraft ? (
        <div className="mt-6">
          <ExerciseComposer examId={exam.id} />
        </div>
      ) : null}
    </DashboardShell>
  );
}
