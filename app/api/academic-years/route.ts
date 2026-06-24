import { getSession } from "@/lib/auth/session";
import { createAcademicYearSchema } from "@/lib/validators/user.schema";
import { academicYearService, ClassError } from "@/lib/services/class.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Non authentifié", 401);

  const years = await academicYearService.list(session.establishmentId);
  return jsonOk(years);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = createAcademicYearSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const year = await academicYearService.create(
      session.establishmentId,
      session.sub,
      parsed.data,
    );

    return jsonOk(year, 201);
  } catch (err) {
    if (err instanceof ClassError) return jsonError(err.message, 409);
    console.error("[academic-years POST]", err);
    return jsonError("Erreur serveur", 500);
  }
}
