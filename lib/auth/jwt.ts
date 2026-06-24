import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "./roles";

export const SESSION_COOKIE = "cylentic_session";

export interface SessionPayload {
  sub: string;
  identifier: string;
  role: UserRole;
  establishmentId: string;
  mustChangePassword: boolean;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "8h";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub as string,
      identifier: payload.identifier as string,
      role: payload.role as UserRole,
      establishmentId: payload.establishmentId as string,
      mustChangePassword: Boolean(payload.mustChangePassword),
    };
  } catch {
    return null;
  }
}
