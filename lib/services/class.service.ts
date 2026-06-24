import { prisma } from "@/lib/prisma";
import type { CreateClassInput } from "@/lib/validators/user.schema";
import type { CreateAcademicYearInput } from "@/lib/validators/user.schema";

export class ClassError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

export const classService = {
  async list(establishmentId: string, includeArchived = false) {
    return prisma.class.findMany({
      where: {
        establishmentId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { studentProfiles: true } },
      },
    });
  },

  async create(
    establishmentId: string,
    actorUserId: string,
    input: CreateClassInput,
  ) {
    try {
      const cls = await prisma.class.create({
        data: {
          establishmentId,
          name: input.name,
          track: input.track,
          level: input.level,
        },
      });

      await prisma.adminActivityLog.create({
        data: {
          establishmentId,
          actorUserId,
          action: "class.create",
          entityType: "class",
          entityId: cls.id,
          newValue: { name: cls.name },
        },
      });

      return cls;
    } catch {
      throw new ClassError("Cette classe existe déjà", "DUPLICATE");
    }
  },

  async archive(establishmentId: string, classId: string) {
    const cls = await prisma.class.findFirst({
      where: { id: classId, establishmentId },
    });
    if (!cls) throw new ClassError("Classe introuvable", "NOT_FOUND");

    return prisma.class.update({
      where: { id: classId },
      data: { isArchived: true },
    });
  },
};

export const academicYearService = {
  async list(establishmentId: string) {
    return prisma.academicYear.findMany({
      where: { establishmentId },
      orderBy: { label: "desc" },
    });
  },

  async create(
    establishmentId: string,
    actorUserId: string,
    input: CreateAcademicYearInput,
  ) {
    if (input.isActive) {
      await prisma.academicYear.updateMany({
        where: { establishmentId, isActive: true },
        data: { isActive: false },
      });
    }

    try {
      const year = await prisma.academicYear.create({
        data: {
          establishmentId,
          label: input.label,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          isActive: input.isActive,
        },
      });

      await prisma.adminActivityLog.create({
        data: {
          establishmentId,
          actorUserId,
          action: "academic_year.create",
          entityType: "academic_year",
          entityId: year.id,
          newValue: { label: year.label },
        },
      });

      return year;
    } catch {
      throw new ClassError("Cette année existe déjà", "DUPLICATE");
    }
  },
};
