import { createEstablishmentSchema } from "@/lib/validators/establishment.schema";
import {
  establishmentService,
  EstablishmentError,
} from "@/lib/services/establishment.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createEstablishmentSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Données invalides";
      return jsonError(msg, 400);
    }

    const result = await establishmentService.register(parsed.data);

    return jsonOk(
      {
        establishment: {
          id: result.establishment.id,
          name: result.establishment.name,
          acronym: result.establishment.acronym,
        },
        admin: result.admin,
        trialEndsAt: result.trialEndsAt.toISOString(),
        simulatedPayment: result.simulatedPayment,
      },
      201,
    );
  } catch (err) {
    if (err instanceof EstablishmentError) {
      return jsonError(err.message, 409);
    }
    console.error("[establishments]", err);
    return jsonError("Erreur serveur", 500);
  }
}
