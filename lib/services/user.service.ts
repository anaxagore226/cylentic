import {
  generateStudentId,
  generateTeacherId,
  getNextSequence,
} from "@/lib/utils/identifier";
import { hashPassword, DEFAULT_PASSWORD } from "@/lib/auth/password";
import { billingService } from "@/lib/services/billing.service";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type {
  CreateStudentInput,
  CreateTeacherInput,
} from "@/lib/validators/user.schema";

export class UserError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

async function logAdminAction(
  establishmentId: string,
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  newValue: Prisma.InputJsonValue,
) {
  await prisma.adminActivityLog.create({
    data: {
      establishmentId,
      actorUserId,
      action,
      entityType,
      entityId,
      newValue,
    },
  });
}

export const userService = {
  async listStudents(establishmentId: string) {
    return prisma.user.findMany({
      where: { establishmentId, role: "student" },
      include: {
        studentProfile: {
          include: { class: true, academicYear: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async listTeachers(establishmentId: string) {
    return prisma.user.findMany({
      where: { establishmentId, role: "teacher" },
      include: { teacherProfile: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async createStudent(
    establishmentId: string,
    actorUserId: string,
    acronym: string,
    input: CreateStudentInput,
  ) {
    const classExists = await prisma.class.findFirst({
      where: {
        id: input.classId,
        establishmentId,
        isArchived: false,
      },
    });
    if (!classExists) {
      throw new UserError("Classe invalide", "INVALID_CLASS");
    }

    const emailTaken = await prisma.user.findFirst({
      where: { establishmentId, email: input.email },
    });
    if (emailTaken) {
      throw new UserError("Email déjà utilisé", "EMAIL_EXISTS");
    }

    await billingService.assertCanAddStudent(establishmentId);

    const year = new Date().getFullYear();
    const seq = await getNextSequence(establishmentId, "student", acronym, year);
    const identifier = generateStudentId(acronym, year, seq);
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          establishmentId,
          identifier,
          role: "student",
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          passwordHash,
          mustChangePassword: true,
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: user.id,
          matricule: input.matricule,
          classId: input.classId,
          academicYearId: input.academicYearId,
        },
      });

      return user;
    });

    await logAdminAction(
      establishmentId,
      actorUserId,
      "user.create",
      "student",
      student.id,
      {
        identifier,
        name: `${input.firstName} ${input.lastName}`,
        class: classExists.name,
      },
    );

    return { ...student, identifier, defaultPassword: DEFAULT_PASSWORD };
  },

  async createTeacher(
    establishmentId: string,
    actorUserId: string,
    acronym: string,
    input: CreateTeacherInput,
  ) {
    const emailTaken = await prisma.user.findFirst({
      where: { establishmentId, email: input.email },
    });
    if (emailTaken) {
      throw new UserError("Email déjà utilisé", "EMAIL_EXISTS");
    }

    await billingService.assertCanAddTeacher(establishmentId);

    const seq = await getNextSequence(establishmentId, "teacher", acronym);
    const identifier = generateTeacherId(acronym, seq);
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          establishmentId,
          identifier,
          role: "teacher",
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          passwordHash,
          mustChangePassword: true,
        },
      });

      await tx.teacherProfile.create({
        data: {
          userId: user.id,
          subjects: input.subjects,
          function: input.function,
        },
      });

      return user;
    });

    await logAdminAction(
      establishmentId,
      actorUserId,
      "user.create",
      "teacher",
      teacher.id,
      { identifier, name: `${input.firstName} ${input.lastName}` },
    );

    return { ...teacher, identifier, defaultPassword: DEFAULT_PASSWORD };
  },

  async toggleActive(
    establishmentId: string,
    actorUserId: string,
    userId: string,
    isActive: boolean,
  ) {
    const user = await prisma.user.findFirst({
      where: { id: userId, establishmentId },
    });
    if (!user) throw new UserError("Utilisateur introuvable", "NOT_FOUND");

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    await logAdminAction(
      establishmentId,
      actorUserId,
      isActive ? "user.reactivate" : "user.deactivate",
      user.role,
      userId,
      { identifier: user.identifier },
    );
  },
};
