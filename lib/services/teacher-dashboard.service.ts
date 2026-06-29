import { prisma } from "@/lib/prisma";

export type TeacherDashboardStats = Awaited<
  ReturnType<typeof teacherDashboardService.getStats>
>;

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillons",
  published: "Publiés",
  in_progress: "En cours",
  finished: "Terminés",
  archived: "Archivés",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#6b7280",
  published: "#10b981",
  in_progress: "#f59e0b",
  finished: "#3b82f6",
  archived: "#8b5cf6",
};

function formatShortDay(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("fr-FR", { month: "short" });
}

export const teacherDashboardService = {
  async getStats(teacherId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      statusGroups,
      totalExams,
      totalParticipations,
      completedParticipations,
      scoreAggregate,
      uniqueStudents,
      incidentCount,
      exerciseCount,
      recentParticipations,
      monthlyExams,
      recentExams,
      liveExams,
      recentSubmissions,
    ] = await Promise.all([
      prisma.exam.groupBy({
        by: ["status"],
        where: { teacherId },
        _count: true,
      }),
      prisma.exam.count({ where: { teacherId } }),
      prisma.examParticipation.count({
        where: { exam: { teacherId } },
      }),
      prisma.examParticipation.count({
        where: { exam: { teacherId }, isCompleted: true },
      }),
      prisma.examParticipation.aggregate({
        where: { exam: { teacherId }, finalScore: { not: null } },
        _avg: { finalScore: true },
        _count: true,
      }),
      prisma.examParticipation.groupBy({
        by: ["studentId"],
        where: { exam: { teacherId } },
      }),
      prisma.incident.count({
        where: { participation: { exam: { teacherId } } },
      }),
      prisma.exercise.count({
        where: { exam: { teacherId } },
      }),
      prisma.examParticipation.findMany({
        where: {
          exam: { teacherId },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
      }),
      prisma.exam.findMany({
        where: { teacherId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.exam.findMany({
        where: { teacherId },
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: {
          _count: { select: { participations: true, exercises: true } },
        },
      }),
      prisma.exam.findMany({
        where: { teacherId, status: { in: ["published", "in_progress"] } },
        orderBy: { startAt: "asc" },
        take: 5,
        include: {
          _count: { select: { participations: true } },
        },
      }),
      prisma.examParticipation.findMany({
        where: { exam: { teacherId }, submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        take: 6,
        select: {
          id: true,
          submittedAt: true,
          finalScore: true,
          isCompleted: true,
          exam: { select: { id: true, name: true } },
          student: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    const statusCounts = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count]),
    ) as Record<string, number>;

    const participationTrend = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(thirtyDaysAgo);
      day.setDate(thirtyDaysAgo.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      const count = recentParticipations.filter(
        (p) => p.createdAt.toISOString().slice(0, 10) === key,
      ).length;
      return {
        date: key,
        label: formatShortDay(day),
        count,
      };
    });

    const examsByMonth = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const count = monthlyExams.filter((e) => {
        const d = e.createdAt;
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      }).length;
      return {
        label: formatMonth(month),
        count,
      };
    });

    const examStatusChart = Object.entries(STATUS_LABELS).map(([status, label]) => ({
      status,
      label,
      count: statusCounts[status] ?? 0,
      fill: STATUS_COLORS[status] ?? "#6b7280",
    }));

    const completionRate =
      totalParticipations > 0
        ? Math.round((completedParticipations / totalParticipations) * 100)
        : 0;

    const averageScore = scoreAggregate._avg.finalScore
      ? Math.round(Number(scoreAggregate._avg.finalScore) * 10) / 10
      : null;

    const prevPeriodStart = new Date(thirtyDaysAgo);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - 30);

    const [currentPeriodParticipations, previousPeriodParticipations] =
      await Promise.all([
        prisma.examParticipation.count({
          where: {
            exam: { teacherId },
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        prisma.examParticipation.count({
          where: {
            exam: { teacherId },
            createdAt: { gte: prevPeriodStart, lt: thirtyDaysAgo },
          },
        }),
      ]);

    const participationTrendDelta =
      previousPeriodParticipations > 0
        ? Math.round(
            ((currentPeriodParticipations - previousPeriodParticipations) /
              previousPeriodParticipations) *
              100,
          )
        : currentPeriodParticipations > 0
          ? 100
          : 0;

    return {
      kpis: {
        totalExams,
        totalParticipations,
        uniqueStudents: uniqueStudents.length,
        averageScore,
        completionRate,
        incidentCount,
        exerciseCount,
        inProgressExams: statusCounts.in_progress ?? 0,
        participationTrendDelta,
        currentPeriodParticipations,
      },
      participationTrend,
      examsByMonth,
      examStatusChart,
      recentExams: recentExams.map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        startAt: e.startAt?.toISOString() ?? null,
        updatedAt: e.updatedAt.toISOString(),
        participations: e._count.participations,
        exercises: e._count.exercises,
      })),
      liveExams: liveExams.map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        startAt: e.startAt?.toISOString() ?? null,
        participations: e._count.participations,
      })),
      recentSubmissions: recentSubmissions.map((s) => ({
        participationId: s.id,
        examId: s.exam.id,
        examName: s.exam.name,
        studentName: `${s.student.firstName} ${s.student.lastName}`,
        submittedAt: s.submittedAt?.toISOString() ?? null,
        finalScore: s.finalScore != null ? Number(s.finalScore) : null,
        isCompleted: s.isCompleted,
      })),
      statusCounts,
    };
  },
};
