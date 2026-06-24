import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { inferRoleFromIdentifier } from "@/lib/auth/roles";
import { signToken } from "@/lib/auth/jwt";
import type { LoginInput } from "@/lib/validators/auth.schema";
import type { SessionUser } from "@/lib/types/auth";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

async function checkLoginRateLimit(identifier: string, ip?: string) {
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);
  const failed = await prisma.loginAttempt.count({
    where: {
      identifier: identifier.toUpperCase(),
      success: false,
      attemptedAt: { gte: since },
      ...(ip ? { ipAddress: ip } : {}),
    },
  });
  if (failed >= MAX_LOGIN_ATTEMPTS) {
    throw new AuthError(
      "Trop de tentatives. Réessayez dans quelques minutes.",
      "RATE_LIMITED",
    );
  }
}

async function logLoginAttempt(
  identifier: string,
  success: boolean,
  establishmentId?: string,
  ip?: string,
) {
  await prisma.loginAttempt.create({
    data: {
      identifier: identifier.toUpperCase(),
      success,
      establishmentId,
      ipAddress: ip,
    },
  });
}

function normalizeExamCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s/g, "");
}

export const authService = {
  async login(input: LoginInput, ip?: string) {
    const identifier = input.identifier.trim().toUpperCase();
    const role = inferRoleFromIdentifier(identifier);

    if (!role) {
      throw new AuthError("Identifiant invalide", "INVALID_IDENTIFIER");
    }

    await checkLoginRateLimit(identifier, ip);

    if (role === "super_admin") {
      const platformAdmin = await prisma.platformAdmin.findUnique({
        where: { identifier },
      });

      if (!platformAdmin || !platformAdmin.isActive) {
        await logLoginAttempt(identifier, false, undefined, ip);
        throw new AuthError("Identifiant ou mot de passe incorrect", "INVALID_CREDENTIALS");
      }

      const valid = await verifyPassword(input.password, platformAdmin.passwordHash);
      if (!valid) {
        await logLoginAttempt(identifier, false, undefined, ip);
        throw new AuthError("Identifiant ou mot de passe incorrect", "INVALID_CREDENTIALS");
      }

      await logLoginAttempt(identifier, true, undefined, ip);
      await prisma.platformAdmin.update({
        where: { id: platformAdmin.id },
        data: { lastLoginAt: new Date() },
      });

      const token = await signToken({
        sub: platformAdmin.id,
        identifier: platformAdmin.identifier,
        role: "super_admin",
        establishmentId: "",
        mustChangePassword: false,
      });

      return {
        token,
        user: {
          id: platformAdmin.id,
          identifier: platformAdmin.identifier,
          role: "super_admin" as const,
          establishmentId: "",
          mustChangePassword: false,
          firstName: platformAdmin.firstName,
          lastName: platformAdmin.lastName,
          email: platformAdmin.email,
        },
        redirectTo: "/super-admin/dashboard",
      };
    }

    const user = await prisma.user.findUnique({
      where: { identifier },
    });

    if (!user || !user.isActive) {
      await logLoginAttempt(identifier, false, undefined, ip);
      throw new AuthError("Identifiant ou mot de passe incorrect", "INVALID_CREDENTIALS");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      await logLoginAttempt(identifier, false, user.establishmentId, ip);
      throw new AuthError("Identifiant ou mot de passe incorrect", "INVALID_CREDENTIALS");
    }

    if (role === "student" && input.examCode) {
      const examCode = normalizeExamCode(input.examCode);
      const exam = await prisma.exam.findFirst({
        where: {
          accessCode: examCode,
          establishmentId: user.establishmentId,
        },
      });

      if (!exam) {
        await prisma.examCodeAttempt.create({
          data: {
            identifier,
            ipAddress: ip,
            success: false,
          },
        });
        throw new AuthError("Code d'examen invalide", "INVALID_EXAM_CODE");
      }

      const participation = await prisma.examParticipation.findUnique({
        where: {
          examId_studentId: { examId: exam.id, studentId: user.id },
        },
      });

      if (participation?.isCompleted) {
        throw new AuthError(
          "Vous avez déjà soumis cet examen. Votre copie a bien été enregistrée.",
          "ALREADY_SUBMITTED",
        );
      }

      await prisma.examCodeAttempt.create({
        data: {
          examId: exam.id,
          identifier,
          ipAddress: ip,
          success: true,
        },
      });

      await logLoginAttempt(identifier, true, user.establishmentId, ip);
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const token = await signToken({
        sub: user.id,
        identifier: user.identifier,
        role: user.role as "student",
        establishmentId: user.establishmentId,
        mustChangePassword: user.mustChangePassword,
      });

      const sessionUser: SessionUser = {
        id: user.id,
        identifier: user.identifier,
        role: "student",
        establishmentId: user.establishmentId,
        mustChangePassword: user.mustChangePassword,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      return {
        token,
        user: sessionUser,
        redirectTo: user.mustChangePassword
          ? "/student/change-password"
          : `/student/exam/security?examId=${exam.id}`,
        examId: exam.id,
      };
    }

    await logLoginAttempt(identifier, true, user.establishmentId, ip);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signToken({
      sub: user.id,
      identifier: user.identifier,
      role: user.role as "admin" | "teacher" | "student",
      establishmentId: user.establishmentId,
      mustChangePassword: user.mustChangePassword,
    });

    const sessionUser: SessionUser = {
      id: user.id,
      identifier: user.identifier,
      role: user.role as "admin" | "teacher" | "student",
      establishmentId: user.establishmentId,
      mustChangePassword: user.mustChangePassword,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    let redirectTo = "/";
    if (user.mustChangePassword) {
      redirectTo =
        user.role === "admin"
          ? "/admin/dashboard"
          : user.role === "teacher"
            ? "/teacher/dashboard"
            : "/student/change-password";
    } else if (user.role === "admin") {
      redirectTo = "/admin/dashboard";
    } else if (user.role === "teacher") {
      redirectTo = "/teacher/dashboard";
    }

    return { token, user: sessionUser, redirectTo };
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AuthError("Utilisateur introuvable", "NOT_FOUND");

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AuthError("Mot de passe actuel incorrect", "INVALID_PASSWORD");
    }

    const { hashPassword } = await import("@/lib/auth/password");
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });

    return { success: true };
  },
};
