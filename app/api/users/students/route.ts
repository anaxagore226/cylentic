import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createStudentSchema } from "@/lib/validators/user.schema";
import { userService, UserError } from "@/lib/services/user.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return jsonError("Accès refusé", 403);
  }

  const students = await userService.listStudents(session.establishmentId);
  return jsonOk(students);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
    }

    const establishment = await prisma.establishment.findUnique({
      where: { id: session.establishmentId },
    });
    if (!establishment) return jsonError("Établissement introuvable", 404);

    const student = await userService.createStudent(
      session.establishmentId,
      session.sub,
      establishment.acronym,
      parsed.data,
    );

    return jsonOk(
      {
        id: student.id,
        identifier: student.identifier,
        defaultPassword: student.defaultPassword,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      201,
    );
  } catch (err) {
    if (err instanceof UserError) {
      return jsonError(err.message, err.code === "EMAIL_EXISTS" ? 409 : 400);
    }
    console.error("[students POST]", err);
    return jsonError("Erreur serveur", 500);
  }
}
