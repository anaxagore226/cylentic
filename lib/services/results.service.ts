import { prisma } from "@/lib/prisma";

export class ResultsError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

async function assertTeacherExam(examId: string, teacherId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, teacherId },
    include: {
      examClasses: { select: { classId: true } },
    },
  });
  if (!exam) throw new ResultsError("Examen introuvable", "NOT_FOUND");
  return exam;
}

const STATUS_LABELS: Record<string, string> = {
  connected: "Connecté",
  waiting: "En attente",
  in_progress: "En cours",
  submitted: "Soumis",
  excluded: "Exclu — incident",
  absent: "Absent",
};

export const resultsService = {
  async getLiveStatus(examId: string, teacherId: string) {
    const exam = await assertTeacherExam(examId, teacherId);
    const classIds = exam.examClasses.map((ec) => ec.classId);

    const students = await prisma.user.findMany({
      where: {
        establishmentId: exam.establishmentId,
        role: "student",
        isActive: true,
        studentProfile: { classId: { in: classIds } },
      },
      include: {
        studentProfile: { include: { class: true } },
      },
      orderBy: { lastName: "asc" },
    });

    const participations = await prisma.examParticipation.findMany({
      where: { examId },
      include: {
        incidents: { orderBy: { occurredAt: "asc" } },
        student: {
          select: {
            id: true,
            identifier: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const byStudent = new Map(participations.map((p) => [p.studentId, p]));

    const rows = students.map((student) => {
      const p = byStudent.get(student.id);
      const status = p ? p.status : "absent";
      return {
        studentId: student.id,
        identifier: student.identifier,
        name: `${student.firstName} ${student.lastName}`,
        className: student.studentProfile?.class?.name ?? "—",
        participationId: p?.id ?? null,
        status,
        statusLabel: STATUS_LABELS[status] ?? status,
        connectedAt: p?.connectedAt?.toISOString() ?? null,
        submittedAt: p?.submittedAt?.toISOString() ?? null,
        incidentCount: p?.incidents.length ?? 0,
        isCompleted: p?.isCompleted ?? false,
      };
    });

    const summary = {
      total: rows.length,
      waiting: rows.filter((r) => r.status === "waiting" || r.status === "connected").length,
      inProgress: rows.filter((r) => r.status === "in_progress").length,
      submitted: rows.filter((r) => r.status === "submitted").length,
      excluded: rows.filter((r) => r.status === "excluded").length,
      absent: rows.filter((r) => r.status === "absent").length,
    };

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        status: exam.status,
        startAt: exam.startAt?.toISOString(),
        durationMinutes: exam.durationMinutes,
      },
      summary,
      rows,
      updatedAt: new Date().toISOString(),
    };
  },

  async getResults(examId: string, teacherId: string) {
    const exam = await assertTeacherExam(examId, teacherId);

    const participations = await prisma.examParticipation.findMany({
      where: { examId },
      include: {
        student: {
          select: {
            id: true,
            identifier: true,
            firstName: true,
            lastName: true,
            studentProfile: { include: { class: true } },
          },
        },
        incidents: true,
        submissions: {
          include: {
            exercise: { select: { title: true, points: true } },
          },
        },
      },
      orderBy: { student: { lastName: "asc" } },
    });

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        status: exam.status,
      },
      participations: participations.map((p) => ({
        id: p.id,
        student: {
          identifier: p.student.identifier,
          name: `${p.student.firstName} ${p.student.lastName}`,
          className: p.student.studentProfile?.class?.name ?? "—",
        },
        status: p.status,
        statusLabel: STATUS_LABELS[p.status] ?? p.status,
        connectedAt: p.connectedAt?.toISOString(),
        submittedAt: p.submittedAt?.toISOString(),
        ipAddress: p.ipAddress,
        autoScore: p.autoScore != null ? Number(p.autoScore) : null,
        manualScore: p.manualScore != null ? Number(p.manualScore) : null,
        finalScore: p.finalScore != null ? Number(p.finalScore) : null,
        incidentCount: p.incidents.length,
        exerciseCount: p.submissions.length,
      })),
    };
  },

  async getParticipationDetail(
    examId: string,
    participationId: string,
    teacherId: string,
  ) {
    await assertTeacherExam(examId, teacherId);

    const participation = await prisma.examParticipation.findFirst({
      where: { id: participationId, examId },
      include: {
        student: {
          include: {
            studentProfile: { include: { class: true } },
          },
        },
        incidents: { orderBy: { occurredAt: "asc" } },
        submissions: {
          include: {
            exercise: true,
            testResults: {
              include: { unitTest: true },
            },
          },
        },
      },
    });

    if (!participation) {
      throw new ResultsError("Copie introuvable", "NOT_FOUND");
    }

    return {
      participation: {
        id: participation.id,
        status: participation.status,
        connectedAt: participation.connectedAt?.toISOString(),
        waitingRoomEnteredAt: participation.waitingRoomEnteredAt?.toISOString(),
        startedAt: participation.startedAt?.toISOString(),
        submittedAt: participation.submittedAt?.toISOString(),
        submissionReason: participation.submissionReason,
        ipAddress: participation.ipAddress,
        autoScore: participation.autoScore != null ? Number(participation.autoScore) : null,
        manualScore: participation.manualScore != null ? Number(participation.manualScore) : null,
        finalScore: participation.finalScore != null ? Number(participation.finalScore) : null,
        comment: null,
      },
      student: {
        identifier: participation.student.identifier,
        name: `${participation.student.firstName} ${participation.student.lastName}`,
        email: participation.student.email,
        className: participation.student.studentProfile?.class?.name ?? "—",
        matricule: participation.student.studentProfile?.matricule ?? "—",
      },
      incidents: participation.incidents.map((i) => ({
        id: i.id,
        type: i.type,
        occurredAt: i.occurredAt.toISOString(),
        durationSeconds: i.durationSeconds,
        payload: i.payload,
      })),
      submissions: participation.submissions.map((s) => ({
        id: s.id,
        exerciseId: s.exerciseId,
        title: s.exercise.title,
        sourceCode: s.sourceCode,
        language: s.language,
        autoScore: s.autoScore != null ? Number(s.autoScore) : null,
        manualScore: s.manualScore != null ? Number(s.manualScore) : null,
        finalScore: s.finalScore != null ? Number(s.finalScore) : null,
        comment: s.comment,
        maxPoints: Number(s.exercise.points),
        testResults: s.testResults.map((tr) => ({
          id: tr.id,
          passed: tr.passed,
          input: tr.unitTest.input,
          expectedOutput: tr.unitTest.expectedOutput,
          actualOutput: tr.actualOutput,
          stderr: tr.stderr,
          status: tr.status,
          timeMs: tr.timeMs,
        })),
      })),
    };
  },

  async updateManualScore(
    examId: string,
    participationId: string,
    teacherId: string,
    data: {
      manualScore?: number;
      comment?: string;
      submissionScores?: { submissionId: string; manualScore: number; comment?: string }[];
    },
  ) {
    await assertTeacherExam(examId, teacherId);

    const participation = await prisma.examParticipation.findFirst({
      where: { id: participationId, examId },
      include: { submissions: true },
    });
    if (!participation) {
      throw new ResultsError("Copie introuvable", "NOT_FOUND");
    }

    if (data.submissionScores?.length) {
      for (const item of data.submissionScores) {
        const sub = participation.submissions.find((s) => s.id === item.submissionId);
        if (!sub) continue;
        const finalScore = item.manualScore;
        await prisma.submission.update({
          where: { id: item.submissionId },
          data: {
            manualScore: item.manualScore,
            finalScore,
            comment: item.comment,
          },
        });
      }
    }

    let totalFinal = 0;
    const updatedSubs = await prisma.submission.findMany({
      where: { participationId },
    });
    for (const s of updatedSubs) {
      totalFinal += Number(s.finalScore ?? s.manualScore ?? s.autoScore ?? 0);
    }

    const participationManual =
      data.manualScore ?? (data.submissionScores ? undefined : participation.manualScore);

    return prisma.examParticipation.update({
      where: { id: participationId },
      data: {
        manualScore: participationManual != null ? participationManual : undefined,
        finalScore:
          participationManual != null ? Number(participationManual) : totalFinal,
      },
    });
  },
};
