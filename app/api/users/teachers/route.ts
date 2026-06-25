import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createTeacherSchema } from "@/lib/validators/user.schema";
import { userService, UserError } from "@/lib/services/user.service";
import { BillingError } from "@/lib/services/billing.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("Accès refusé", 403);
  }

  const teachers = await userService.listTeachers(session.establishmentId);
  return jsonOk(teachers);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = createTeacherSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const establishment = await prisma.establishment.findUnique({
      where: { id: session.establishmentId },
    });
    if (!establishment) return jsonError("Établissement introuvable", 404);

    const teacher = await userService.createTeacher(
      session.establishmentId,
      session.sub,
      establishment.acronym,
      parsed.data,
    );

    return jsonOk(
      {
        id: teacher.id,
        identifier: teacher.identifier,
        defaultPassword: teacher.defaultPassword,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
      },
      201,
    );
  } catch (err) {
    if (err instanceof UserError) {
      return jsonError(err.message, err.code === "EMAIL_EXISTS" ? 409 : 400);
    }
    if (err instanceof BillingError) {
      return jsonError(err.message, 409);
    }
    console.error("[teachers POST]", err);
    return jsonError("Erreur serveur", 500);
  }
}
