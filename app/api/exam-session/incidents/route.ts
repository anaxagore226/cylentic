import { getSession } from "@/lib/auth/session";
import {
  participationService,
  ParticipationError,
} from "@/lib/services/participation.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";
import { z } from "zod";
import type { IncidentType } from "@/app/generated/prisma/client";

const schema = z.object({
  participationId: z.string().uuid(),
  type: z.enum([
    "fullscreen_exit",
    "tab_switch",
    "session_close",
    "network_issue",
    "clipboard_paste",
  ]),
  payload: z.string().optional(),
  durationSeconds: z.number().optional(),
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

    const result = await participationService.recordIncident(
      parsed.data.participationId,
      session.sub,
      parsed.data.type as IncidentType,
      parsed.data.payload,
      parsed.data.durationSeconds,
    );

    return jsonOk(result);
  } catch (err) {
    if (err instanceof ParticipationError) return jsonError(err.message, 400);
    console.error("[incidents]", err);
    return jsonError("Erreur serveur", 500);
  }
}
