import { getSession } from "@/lib/auth/session";
import { resultsService, ResultsError } from "@/lib/services/results.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const { examId } = await params;
    const data = await resultsService.getLiveStatus(examId, session.sub);
    return jsonOk(data);
  } catch (err) {
    if (err instanceof ResultsError) return jsonError(err.message, 404);
    console.error("[live GET]", err);
    return jsonError("Erreur serveur", 500);
  }
}
