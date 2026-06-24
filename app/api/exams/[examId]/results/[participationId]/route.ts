import { getSession } from "@/lib/auth/session";
import { resultsService, ResultsError } from "@/lib/services/results.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";
import { z } from "zod";

const patchSchema = z.object({
  manualScore: z.coerce.number().min(0).optional(),
  comment: z.string().optional(),
  submissionScores: z
    .array(
      z.object({
        submissionId: z.string().uuid(),
        manualScore: z.coerce.number().min(0),
        comment: z.string().optional(),
      }),
    )
    .optional(),
});

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ examId: string; participationId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const { examId, participationId } = await params;
    const data = await resultsService.getParticipationDetail(
      examId,
      participationId,
      session.sub,
    );
    return jsonOk(data);
  } catch (err) {
    if (err instanceof ResultsError) return jsonError(err.message, 404);
    console.error("[participation GET]", err);
    return jsonError("Erreur serveur", 500);
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ examId: string; participationId: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const { examId, participationId } = await params;
    const updated = await resultsService.updateManualScore(
      examId,
      participationId,
      session.sub,
      parsed.data,
    );

    return jsonOk({
      finalScore: updated.finalScore != null ? Number(updated.finalScore) : null,
      manualScore: updated.manualScore != null ? Number(updated.manualScore) : null,
    });
  } catch (err) {
    if (err instanceof ResultsError) return jsonError(err.message, 404);
    console.error("[participation PATCH]", err);
    return jsonError("Erreur serveur", 500);
  }
}
