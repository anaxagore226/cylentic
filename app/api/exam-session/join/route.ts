import { getSession } from "@/lib/auth/session";
import {
  participationService,
  ParticipationError,
} from "@/lib/services/participation.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return jsonError("Accès refusé", 403);
    }

    const examId = new URL(request.url).searchParams.get("examId");
    if (!examId) return jsonError("examId requis", 400);

    const state = await participationService.getSessionState(
      examId,
      session.sub,
      session.establishmentId,
    );

    return jsonOk(state);
  } catch (err) {
    if (err instanceof ParticipationError) {
      return jsonError(err.message, 400);
    }
    console.error("[exam-session/join GET]", err);
    return jsonError("Erreur serveur", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const examId = body.examId as string;
    if (!examId) return jsonError("examId requis", 400);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;

    const result = await participationService.joinExam(
      examId,
      session.sub,
      session.establishmentId,
      ip,
    );

    return jsonOk({
      participationId: result.participation.id,
      exam: {
        id: result.exam.id,
        name: result.exam.name,
        startAt: result.exam.startAt?.toISOString(),
        durationMinutes: result.exam.durationMinutes,
      },
    });
  } catch (err) {
    if (err instanceof ParticipationError) {
      return jsonError(err.message, 400);
    }
    console.error("[exam-session/join POST]", err);
    return jsonError("Erreur serveur", 500);
  }
}
