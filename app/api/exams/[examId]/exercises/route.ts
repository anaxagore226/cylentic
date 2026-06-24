import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createCodeExerciseSchema } from "@/lib/validators/exercise.schema";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return jsonError("Accès refusé", 403);
  }

  const { examId } = await params;
  const exercises = await prisma.exercise.findMany({
    where: { examId, exam: { teacherId: session.sub } },
    include: { unitTests: { orderBy: { orderIndex: "asc" } } },
    orderBy: { orderIndex: "asc" },
  });

  return jsonOk(exercises);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const { examId } = await params;
    const exam = await prisma.exam.findFirst({
      where: { id: examId, teacherId: session.sub, status: "draft" },
    });
    if (!exam) return jsonError("Examen non modifiable", 400);

    const body = await request.json();
    const parsed = createCodeExerciseSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const count = await prisma.exercise.count({ where: { examId } });

    const exercise = await prisma.exercise.create({
      data: {
        examId,
        type: "code",
        title: parsed.data.title,
        statement: parsed.data.statement,
        language: parsed.data.language,
        points: parsed.data.points,
        correctionMode: parsed.data.correctionMode,
        orderIndex: count,
        unitTests: parsed.data.unitTests?.length
          ? {
              create: parsed.data.unitTests.map((t, i) => ({
                input: t.input,
                expectedOutput: t.expectedOutput,
                weight: t.weight,
                isHidden: t.isHidden,
                orderIndex: i,
              })),
            }
          : undefined,
      },
      include: { unitTests: true },
    });

    return jsonOk(exercise, 201);
  } catch (err) {
    console.error("[exercises POST]", err);
    return jsonError("Erreur serveur", 500);
  }
}
