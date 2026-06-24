import { getSession } from "@/lib/auth/session";
import { superAdminService } from "@/lib/services/super-admin.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return jsonError("Accès refusé", 403);
  }

  const establishments = await superAdminService.listEstablishments();
  return jsonOk(establishments);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return jsonError("Accès refusé", 403);
  }

  const body = await request.json();
  const { establishmentId, isActive } = body;
  if (!establishmentId || typeof isActive !== "boolean") {
    return jsonError("Données invalides", 400);
  }

  const updated = await superAdminService.toggleEstablishment(
    establishmentId,
    isActive,
  );
  return jsonOk(updated);
}
