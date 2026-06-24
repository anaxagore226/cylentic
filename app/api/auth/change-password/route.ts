import { getSession } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validators/auth.schema";
import { authService, AuthError } from "@/lib/services/auth.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Non authentifié", 401);

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    await authService.changePassword(
      session.sub,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );

    return jsonOk({ message: "Mot de passe mis à jour" });
  } catch (err) {
    if (err instanceof AuthError) {
      return jsonError(err.message, 400);
    }
    console.error("[auth/change-password]", err);
    return jsonError("Erreur serveur", 500);
  }
}
