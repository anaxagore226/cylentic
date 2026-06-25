import { getSession } from "@/lib/auth/session";
import { createExamSchema } from "@/lib/validators/exam.schema";
import { examService, ExamError } from "@/lib/services/exam.service";
import { BillingError } from "@/lib/services/billing.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return jsonError("Accès refusé", 403);
  }

  const exams = await examService.listByTeacher(session.sub);
  return jsonOk(exams);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = createExamSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const exam = await examService.create(
      session.sub,
      session.establishmentId,
      parsed.data,
    );

    return jsonOk(exam, 201);
  } catch (err) {
    if (err instanceof ExamError) return jsonError(err.message, 400);
    if (err instanceof BillingError) return jsonError(err.message, 409);
    console.error("[exams POST]", err);
    return jsonError("Erreur serveur", 500);
  }
}
