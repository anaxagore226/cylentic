import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/jwt";
import { jsonOk } from "@/lib/utils/api-response";

export async function POST() {
  const response = jsonOk({ message: "Déconnecté" });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
