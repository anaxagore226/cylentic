import { getSession } from "@/lib/auth/session";
import {
  participationService,
  ParticipationError,
} from "@/lib/services/participation.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";
import { z } from "zod";

const schema = z.object({
  participationId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  content: z.string(),
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

    await participationService.autosave(
      parsed.data.participationId,
      session.sub,
      parsed.data.exerciseId,
      parsed.data.content,
    );

    return jsonOk({ saved: true });
  } catch (err) {
    if (err instanceof ParticipationError) return jsonError(err.message, 400);
    console.error("[autosave]", err);
    return jsonError("Erreur serveur", 500);
  }
}
