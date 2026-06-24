import { getSession } from "@/lib/auth/session";
import { sandboxService } from "@/lib/services/sandbox.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";
import { z } from "zod";

const schema = z.object({
  code: z.string(),
  exerciseId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return jsonError("Accès refusé", 403);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError("Données invalides", 400);

    const result = await sandboxService.executePython(parsed.data.code);

    return jsonOk({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      timeMs: result.timeMs,
      timedOut: result.timedOut,
    });
  } catch (err) {
    console.error("[execute]", err);
    return jsonError("Exécution impossible", 500);
  }
}
