import { getSession } from "@/lib/auth/session";
import { billingService, BillingError } from "@/lib/services/billing.service";
import { changePlanSchema } from "@/lib/validators/billing.schema";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return jsonError("Accès refusé", 403);
    }

    const overview = await billingService.getOverview(session.establishmentId);
    return jsonOk(overview);
  } catch (err) {
    if (err instanceof BillingError) {
      return jsonError(err.message, err.code === "NOT_FOUND" ? 404 : 400);
    }
    console.error("[billing/subscription GET]", err);
    return jsonError("Erreur serveur", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = changePlanSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const result = await billingService.changePlan(
      session.establishmentId,
      session.sub,
      parsed.data.planCode,
    );

    const overview = await billingService.getOverview(session.establishmentId);
    return jsonOk({ ...result, overview });
  } catch (err) {
    if (err instanceof BillingError) {
      const status =
        err.code === "LIMIT_EXCEEDED"
          ? 409
          : err.code === "NOT_FOUND"
            ? 404
            : 400;
      return jsonError(err.message, status);
    }
    console.error("[billing/subscription PATCH]", err);
    return jsonError("Erreur serveur", 500);
  }
}
