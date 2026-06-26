import { getSession } from "@/lib/auth/session";
import {
  onboardingService,
  OnboardingError,
} from "@/lib/services/onboarding.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin" || !session.establishmentId) {
      return jsonError("Non authentifié", 401);
    }

    const status = await onboardingService.getStatus(session.establishmentId);
    return jsonOk(status);
  } catch (err) {
    if (err instanceof OnboardingError) {
      return jsonError(err.message, 404);
    }
    console.error("[onboarding/GET]", err);
    return jsonError("Erreur serveur", 500);
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin" || !session.establishmentId) {
      return jsonError("Non authentifié", 401);
    }

    const status = await onboardingService.complete(
      session.establishmentId,
      session.sub,
    );
    return jsonOk(status);
  } catch (err) {
    if (err instanceof OnboardingError) {
      const status = err.code === "INCOMPLETE" ? 400 : 404;
      return jsonError(err.message, status);
    }
    console.error("[onboarding/POST]", err);
    return jsonError("Erreur serveur", 500);
  }
}
