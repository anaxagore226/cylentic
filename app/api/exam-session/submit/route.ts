import { getSession } from "@/lib/auth/session";
import {
  participationService,
  ParticipationError,
} from "@/lib/services/participation.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";
import { z } from "zod";

const schema = z.object({
  participationId: z.string().uuid(),
  reason: z.enum(["manual", "timer", "excluded"]).default("manual"),
  qcmAnswers: z
    .array(
      z.object({
        exerciseId: z.string().uuid(),
        answers: z.array(
          z.object({
            questionId: z.string().uuid(),
            choiceIds: z.array(z.string().uuid()),
          }),
        ),
      }),
    )
    .optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError("Données invalides", 400);

    await participationService.submitExam(
      parsed.data.participationId,
      session.sub,
      parsed.data.reason,
      parsed.data.qcmAnswers,
    );

    return jsonOk({ submitted: true });
  } catch (err) {
    if (err instanceof ParticipationError) return jsonError(err.message, 400);
    console.error("[submit]", err);
    return jsonError("Erreur serveur", 500);
  }
}
