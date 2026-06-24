import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth.schema";
import { authService, AuthError } from "@/lib/services/auth.service";
import { jsonError, jsonOk } from "@/lib/utils/api-response";
import { SESSION_COOKIE } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Données invalides";
      return jsonError(msg, 400);
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;

    const result = await authService.login(parsed.data, ip);

    const response = jsonOk({
      user: result.user,
      redirectTo: result.redirectTo,
      examId: "examId" in result ? result.examId : undefined,
    });

    response.cookies.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (err) {
    if (err instanceof AuthError) {
      const status =
        err.code === "RATE_LIMITED"
          ? 429
          : err.code === "ALREADY_SUBMITTED"
            ? 403
            : 401;
      return jsonError(err.message, status);
    }
    console.error("[auth/login]", err);
    return jsonError("Erreur serveur", 500);
  }
}
