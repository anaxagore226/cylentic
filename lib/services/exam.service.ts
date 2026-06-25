import { prisma } from "@/lib/prisma";
import { generateExamAccessCode } from "@/lib/utils/exam-code";
import { billingService } from "@/lib/services/billing.service";
import type { CreateExamInput } from "@/lib/validators/exam.schema";

export class ExamError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

export const examService = {
  async create(teacherId: string, establishmentId: string, input: CreateExamInput) {
    await billingService.assertCanCreateExam(establishmentId);

    const classes = await prisma.class.findMany({
      where: {
        id: { in: input.classIds },
        establishmentId,
        isArchived: false,
      },
    });

    if (classes.length !== input.classIds.length) {
      throw new ExamError("Une ou plusieurs classes sont invalides", "INVALID_CLASSES");
    }

    const exam = await prisma.exam.create({
      data: {
        establishmentId,
        teacherId,
        name: input.name,
        status: "draft",
        startAt: new Date(input.startAt),
        durationMinutes: input.durationMinutes,
        accessDelayMinutes: input.accessDelayMinutes,
        correctionMode: input.correctionMode,
        examClasses: {
          create: input.classIds.map((classId) => ({ classId })),
        },
      },
      include: { examClasses: true },
    });

    return exam;
  },

  async publish(examId: string, teacherId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, teacherId },
      include: { exercises: true },
    });

    if (!exam) throw new ExamError("Examen introuvable", "NOT_FOUND");
    if (exam.status !== "draft" && exam.status !== "published") {
      throw new ExamError("Examen non modifiable", "LOCKED");
    }
    if (exam.exercises.length === 0) {
      throw new ExamError("Ajoutez au moins un exercice", "NO_EXERCISES");
    }

    let accessCode = exam.accessCode;
    if (!accessCode) {
      accessCode = generateExamAccessCode();
    }

    return prisma.exam.update({
      where: { id: examId },
      data: {
        status: "published",
        accessCode,
        publishedAt: new Date(),
      },
    });
  },

  async listByTeacher(teacherId: string) {
    return prisma.exam.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
  },

  async delete(examId: string, teacherId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, teacherId },
    });

    if (!exam) {
      throw new ExamError("Examen introuvable", "NOT_FOUND");
    }

    await prisma.$transaction(async (tx) => {
      await tx.examParticipation.deleteMany({ where: { examId } });
      await tx.examCodeAttempt.deleteMany({ where: { examId } });
      await tx.exam.delete({ where: { id: examId } });
    });
  },
};
