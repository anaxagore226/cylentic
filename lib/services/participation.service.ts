import { prisma } from "@/lib/prisma";
import type { IncidentType, ParticipationStatus, SubmissionReason } from "@/app/generated/prisma/client";

export class ParticipationError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

function getExamEndTime(startAt: Date, durationMinutes: number) {
  return new Date(startAt.getTime() + durationMinutes * 60 * 1000);
}

export const participationService = {
  async getExamForStudent(examId: string, studentId: string, establishmentId: string) {
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        establishmentId,
        status: { in: ["published", "in_progress", "finished"] },
      },
      include: {
        exercises: {
          orderBy: { orderIndex: "asc" },
          include: {
            qcmQuestions: {
              orderBy: { orderIndex: "asc" },
              include: {
                choices: {
                  select: { id: true, text: true, orderIndex: true },
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new ParticipationError("Examen introuvable", "NOT_FOUND");
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    });

    const allowed = await prisma.examClass.findFirst({
      where: {
        examId,
        classId: student?.classId ?? undefined,
      },
    });

    if (!student?.classId || !allowed) {
      throw new ParticipationError(
        "Votre classe n'est pas autorisée pour cet examen",
        "CLASS_NOT_ALLOWED",
      );
    }

    return exam;
  },

  async joinExam(
    examId: string,
    studentId: string,
    establishmentId: string,
    ip?: string,
  ) {
    const exam = await this.getExamForStudent(examId, studentId, establishmentId);

    if (!exam.startAt || !exam.durationMinutes) {
      throw new ParticipationError("Examen mal configuré", "INVALID_EXAM");
    }

    const now = new Date();
    const accessDeadline = new Date(
      exam.startAt.getTime() + exam.accessDelayMinutes * 60 * 1000,
    );

    if (now > accessDeadline && exam.status !== "in_progress") {
      throw new ParticipationError(
        "Le délai d'accès à cet examen est expiré",
        "ACCESS_EXPIRED",
      );
    }

    const existing = await prisma.examParticipation.findUnique({
      where: { examId_studentId: { examId, studentId } },
    });

    if (existing?.isCompleted) {
      throw new ParticipationError(
        "Vous avez déjà soumis cet examen",
        "ALREADY_SUBMITTED",
      );
    }

    const participation = await prisma.examParticipation.upsert({
      where: { examId_studentId: { examId, studentId } },
      create: {
        examId,
        studentId,
        status: "connected",
        connectedAt: now,
        ipAddress: ip,
        waitingRoomEnteredAt: now,
      },
      update: {
        status: "waiting",
        waitingRoomEnteredAt: now,
        ipAddress: ip ?? undefined,
      },
    });

    return { exam, participation };
  },

  async getSessionState(examId: string, studentId: string, establishmentId: string) {
    const exam = await this.getExamForStudent(examId, studentId, establishmentId);

    const participation = await prisma.examParticipation.findUnique({
      where: { examId_studentId: { examId, studentId } },
      include: {
        autosaves: true,
        incidents: { orderBy: { occurredAt: "asc" } },
      },
    });

    if (!participation) {
      return { exam, participation: null, phase: "not_joined" as const };
    }

    if (participation.isCompleted) {
      return { exam, participation, phase: "submitted" as const };
    }

    const now = new Date();
    const startAt = exam.startAt!;
    const endAt = getExamEndTime(startAt, exam.durationMinutes!);

    let phase: "waiting" | "compose" | "ended" = "waiting";
    if (now >= startAt && now < endAt) phase = "compose";
    if (now >= endAt) phase = "ended";

    if (phase === "compose" && participation.status !== "in_progress") {
      await this.enterComposition(examId, studentId);
    }

    if (phase === "ended" && !participation.isCompleted) {
      await this.submitExam(participation.id, studentId, "timer");
      return {
        exam,
        participation: { ...participation, isCompleted: true },
        phase: "submitted" as const,
        serverTime: now.toISOString(),
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        incidentCount: participation.incidents.length,
        maxIncidents: exam.maxIncidentsBeforeClose,
      };
    }

    const securityIncidents = participation.incidents.filter(
      (i) => i.type === "fullscreen_exit" || i.type === "tab_switch",
    ).length;

    return {
      exam,
      participation,
      phase,
      serverTime: now.toISOString(),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      incidentCount: securityIncidents,
      maxIncidents: exam.maxIncidentsBeforeClose,
    };
  },

  async enterComposition(examId: string, studentId: string) {
    const participation = await prisma.examParticipation.findUnique({
      where: { examId_studentId: { examId, studentId } },
    });
    if (!participation || participation.isCompleted) {
      throw new ParticipationError("Participation invalide", "INVALID");
    }

    return prisma.examParticipation.update({
      where: { id: participation.id },
      data: {
        status: "in_progress",
        startedAt: participation.startedAt ?? new Date(),
      },
    });
  },

  async autosave(
    participationId: string,
    studentId: string,
    exerciseId: string,
    content: string,
  ) {
    const participation = await prisma.examParticipation.findFirst({
      where: { id: participationId, studentId, isCompleted: false },
    });
    if (!participation) {
      throw new ParticipationError("Session invalide", "INVALID");
    }

    return prisma.codeAutosave.upsert({
      where: {
        participationId_exerciseId: { participationId, exerciseId },
      },
      create: { participationId, exerciseId, content },
      update: { content, savedAt: new Date() },
    });
  },

  async recordIncident(
    participationId: string,
    studentId: string,
    type: IncidentType,
    payload?: string,
    durationSeconds?: number,
  ) {
    const participation = await prisma.examParticipation.findFirst({
      where: { id: participationId, studentId },
      include: { exam: true, incidents: true },
    });
    if (!participation || participation.isCompleted) return null;

    const incident = await prisma.incident.create({
      data: {
        participationId,
        type,
        payload,
        durationSeconds,
      },
    });

    const tabIncidents = participation.incidents.filter(
      (i) => i.type === "fullscreen_exit" || i.type === "tab_switch",
    ).length + (type === "fullscreen_exit" || type === "tab_switch" ? 1 : 0);

    if (tabIncidents >= participation.exam.maxIncidentsBeforeClose) {
      await this.submitExam(
        participationId,
        studentId,
        "excluded",
      );
      return { incident, excluded: true };
    }

    return { incident, excluded: false };
  },

  async submitExam(
    participationId: string,
    studentId: string,
    reason: SubmissionReason = "manual",
    qcmAnswers?: {
      exerciseId: string;
      answers: { questionId: string; choiceIds: string[] }[];
    }[],
  ) {
    const participation = await prisma.examParticipation.findFirst({
      where: { id: participationId, studentId },
      include: {
        exam: { include: { exercises: true } },
        autosaves: true,
      },
    });

    if (!participation) {
      throw new ParticipationError("Participation introuvable", "NOT_FOUND");
    }
    if (participation.isCompleted) {
      return participation;
    }

    const now = new Date();

    for (const exercise of participation.exam.exercises) {
      if (exercise.type === "code") {
        const autosave = participation.autosaves.find(
          (a) => a.exerciseId === exercise.id,
        );

        await prisma.submission.upsert({
          where: {
            participationId_exerciseId: {
              participationId,
              exerciseId: exercise.id,
            },
          },
          create: {
            participationId,
            exerciseId: exercise.id,
            sourceCode: autosave?.content ?? "",
            language: exercise.language ?? "python",
            submittedAt: now,
          },
          update: {
            sourceCode: autosave?.content ?? "",
            submittedAt: now,
          },
        });
      }

      if (exercise.type === "qcm") {
        const exerciseAnswers = qcmAnswers?.find(
          (a) => a.exerciseId === exercise.id,
        );

        const submission = await prisma.submission.upsert({
          where: {
            participationId_exerciseId: {
              participationId,
              exerciseId: exercise.id,
            },
          },
          create: {
            participationId,
            exerciseId: exercise.id,
            submittedAt: now,
          },
          update: { submittedAt: now },
        });

        if (exerciseAnswers?.answers.length) {
          await prisma.qcmAnswer.deleteMany({
            where: { submissionId: submission.id },
          });
          for (const ans of exerciseAnswers.answers) {
            for (const choiceId of ans.choiceIds) {
              await prisma.qcmAnswer.create({
                data: {
                  submissionId: submission.id,
                  questionId: ans.questionId,
                  choiceId,
                },
              });
            }
          }
        }
      }
    }

    const updated = await prisma.examParticipation.update({
      where: { id: participationId },
      data: {
        isCompleted: true,
        status: reason === "excluded" ? "excluded" : "submitted",
        submittedAt: now,
        submissionReason: reason,
      },
    });

    const { gradingService } = await import("@/lib/services/grading.service");
    await gradingService.gradeParticipation(participationId);

    return updated;
  },
};
