import { getSession } from "@/lib/auth/session";
import { superAdminService } from "@/lib/services/super-admin.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return jsonError("Accès refusé", 403);
  }

  const plans = await superAdminService.listPlans();
  return jsonOk(plans);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return jsonError("Accès refusé", 403);
  }

  const body = await request.json();
  const { planId, ...data } = body;
  if (!planId) return jsonError("planId requis", 400);

  const updated = await superAdminService.updatePlan(planId, data);
  return jsonOk(updated);
}
