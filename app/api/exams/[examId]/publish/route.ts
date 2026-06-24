import { getSession } from "@/lib/auth/session";
import { examService, ExamError } from "@/lib/services/exam.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const { examId } = await params;
    const exam = await examService.publish(examId, session.sub);

    return jsonOk({
      id: exam.id,
      accessCode: exam.accessCode,
      status: exam.status,
    });
  } catch (err) {
    if (err instanceof ExamError) return jsonError(err.message, 400);
    console.error("[publish]", err);
    return jsonError("Erreur serveur", 500);
  }
}
