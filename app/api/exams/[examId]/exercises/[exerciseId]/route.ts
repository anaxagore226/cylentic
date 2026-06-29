import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  updateCodeExerciseSchema,
  updateQcmExerciseSchema,
} from "@/lib/validators/exercise.schema";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

async function getDraftExercise(examId: string, exerciseId: string, teacherId: string) {
  return prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      examId,
      exam: { teacherId, status: "draft" },
    },
    include: {
      unitTests: { orderBy: { orderIndex: "asc" } },
      qcmQuestions: {
        orderBy: { orderIndex: "asc" },
        include: { choices: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string; exerciseId: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return jsonError("Accès refusé", 403);
  }

  const { examId, exerciseId } = await params;

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      examId,
      exam: { teacherId: session.sub },
    },
    include: {
      unitTests: { orderBy: { orderIndex: "asc" } },
      qcmQuestions: {
        orderBy: { orderIndex: "asc" },
        include: { choices: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  if (!exercise) return jsonError("Exercice introuvable", 404);

  return jsonOk(exercise);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ examId: string; exerciseId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const { examId, exerciseId } = await params;
    const existing = await getDraftExercise(examId, exerciseId, session.sub);
    if (!existing) return jsonError("Exercice non modifiable", 400);

    const body = await request.json();

    if (existing.type === "code") {
      const parsed = updateCodeExerciseSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
      }

      const data = parsed.data;
      const exercise = await prisma.$transaction(async (tx) => {
        await tx.unitTest.deleteMany({ where: { exerciseId } });
        return tx.exercise.update({
          where: { id: exerciseId },
          data: {
            title: data.title,
            statement: data.statement,
            language: data.language,
            points: data.points,
            correctionMode: data.correctionMode,
            unitTests: data.unitTests?.length
              ? {
                  create: data.unitTests.map((t, i) => ({
                    input: t.input,
                    expectedOutput: t.expectedOutput,
                    weight: t.weight,
                    isHidden: t.isHidden,
                    orderIndex: i,
                  })),
                }
              : undefined,
          },
          include: { unitTests: { orderBy: { orderIndex: "asc" } } },
        });
      });

      return jsonOk(exercise);
    }

    const parsed = updateQcmExerciseSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const data = parsed.data;
    const exercise = await prisma.$transaction(async (tx) => {
      await tx.qcmQuestion.deleteMany({ where: { exerciseId } });
      return tx.exercise.update({
        where: { id: exerciseId },
        data: {
          title: data.title,
          statement: data.statement,
          points: data.points,
          qcmQuestions: {
            create: data.questions.map((q, qi) => ({
              text: q.text,
              answerType: q.answerType,
              points: q.points,
              explanation: q.explanation,
              orderIndex: qi,
              choices: {
                create: q.choices.map((c, ci) => ({
                  text: c.text,
                  isCorrect: c.isCorrect,
                  orderIndex: ci,
                })),
              },
            })),
          },
        },
        include: {
          qcmQuestions: {
            orderBy: { orderIndex: "asc" },
            include: { choices: { orderBy: { orderIndex: "asc" } } },
          },
        },
      });
    });

    return jsonOk(exercise);
  } catch (err) {
    console.error("[exercises PATCH]", err);
    return jsonError("Erreur serveur", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ examId: string; exerciseId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const { examId, exerciseId } = await params;
    const existing = await getDraftExercise(examId, exerciseId, session.sub);
    if (!existing) return jsonError("Exercice non supprimable", 400);

    await prisma.exercise.delete({ where: { id: exerciseId } });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[exercises DELETE]", err);
    return jsonError("Erreur serveur", 500);
  }
}
