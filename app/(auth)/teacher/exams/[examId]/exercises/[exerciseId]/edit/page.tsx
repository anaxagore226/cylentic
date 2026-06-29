import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Code2, ListChecks } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseCodeForm } from "@/components/teacher/exercise-code-form";
import { ExerciseQcmForm } from "@/components/teacher/exercise-qcm-form";
import { TEACHER_NAV_GROUPS } from "@/lib/teacher/nav";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ examId: string; exerciseId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const { examId, exerciseId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });
  if (!user) redirect("/login");

  const exam = await prisma.exam.findFirst({
    where: { id: examId, teacherId: user.id },
  });
  if (!exam) notFound();
  if (exam.status !== "draft") redirect(`/teacher/exams/${examId}`);

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, examId },
    include: {
      unitTests: { orderBy: { orderIndex: "asc" } },
      qcmQuestions: {
        orderBy: { orderIndex: "asc" },
        include: { choices: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!exercise) notFound();

  const isCode = exercise.type === "code";
  const Icon = isCode ? Code2 : ListChecks;

  return (
    <DashboardShell
      nav={TEACHER_NAV_GROUPS}
      title="Modifier l'exercice"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
    >
      <div className="mb-6">
        <Link
          href={`/teacher/exams/${examId}`}
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à {exam.name}
        </Link>
      </div>

      <Card className="mb-6 overflow-hidden p-0">
        <div className="border-b border-card-border bg-gradient-to-r from-accent/5 via-transparent to-sky-500/5 px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold">{exercise.title}</h1>
                <Badge variant={isCode ? "success" : "default"}>
                  {isCode ? "Code Python" : "QCM"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                Modifiez le contenu de cet exercice. Les changements ne seront
                visibles qu&apos;après enregistrement.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isCode ? (
            <ExerciseCodeForm
              examId={examId}
              exerciseId={exerciseId}
              initialValues={{
                title: exercise.title,
                statement: exercise.statement ?? "",
                points: String(exercise.points),
                tests: exercise.unitTests.length
                  ? exercise.unitTests.map((t) => ({
                      input: t.input ?? "",
                      expectedOutput: t.expectedOutput,
                      weight: String(t.weight),
                      isHidden: t.isHidden,
                    }))
                  : [{ input: "", expectedOutput: "", weight: "1", isHidden: false }],
              }}
            />
          ) : (
            <ExerciseQcmForm
              examId={examId}
              exerciseId={exerciseId}
              initialValues={{
                title: exercise.title,
                statement: exercise.statement ?? "",
                points: String(exercise.points),
                questions: exercise.qcmQuestions.map((q) => ({
                  text: q.text,
                  answerType: q.answerType as "single" | "multiple",
                  points: String(q.points),
                  explanation: q.explanation ?? "",
                  choiceCount: q.choices.length,
                  choices: q.choices.map((c) => ({
                    text: c.text,
                    isCorrect: c.isCorrect,
                  })),
                })),
              }}
            />
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}
