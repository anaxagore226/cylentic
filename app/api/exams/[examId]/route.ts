import { getSession } from "@/lib/auth/session";
import { examService, ExamError } from "@/lib/services/exam.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const { examId } = await params;
    await examService.delete(examId, session.sub);

    return jsonOk({ deleted: true });
  } catch (err) {
    if (err instanceof ExamError) {
      return jsonError(err.message, err.code === "NOT_FOUND" ? 404 : 400);
    }
    console.error("[exams DELETE]", err);
    return jsonError("Erreur serveur", 500);
  }
}
