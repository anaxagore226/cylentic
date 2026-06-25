import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth/jwt";
import type { UserRole } from "@/lib/auth/roles";
import { getDashboardPath } from "@/lib/auth/roles";

const PUBLIC_PATHS = ["/", "/login", "/register/establishment"];
const AUTH_API_PUBLIC = ["/api/auth/login", "/api/auth/logout", "/api/establishments"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (AUTH_API_PUBLIC.some((p) => pathname.startsWith(p))) return true;
  return false;
}

function requiredRole(pathname: string): UserRole | null {
  if (pathname.startsWith("/super-admin") || pathname.startsWith("/api/super-admin")) {
    return "super_admin";
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/billing")) {
    return "admin";
  }
  if (pathname.startsWith("/teacher") || pathname.startsWith("/api/exports")) {
    return "teacher";
  }
  if (pathname.startsWith("/student")) return "student";
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needed = requiredRole(pathname);
  if (needed && session.role !== needed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    return NextResponse.redirect(new URL(getDashboardPath(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
