import { prisma } from "@/lib/prisma";

export type AdminDashboardStats = Awaited<
  ReturnType<typeof adminDashboardService.getStats>
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

export const adminDashboardService = {
  async getStats(establishmentId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const prevPeriodStart = new Date(thirtyDaysAgo);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - 30);

    const [
      studentCount,
      teacherCount,
      adminCount,
      classCount,
      statusGroups,
      totalExams,
      totalParticipations,
      completedParticipations,
      incidentCount,
      recentParticipations,
      monthlyExams,
      recentExams,
      liveExams,
      recentLogs,
      currentPeriodParticipations,
      previousPeriodParticipations,
    ] = await Promise.all([
      prisma.user.count({
        where: { establishmentId, role: "student", isActive: true },
      }),
      prisma.user.count({
        where: { establishmentId, role: "teacher", isActive: true },
      }),
      prisma.user.count({
        where: { establishmentId, role: "admin", isActive: true },
      }),
      prisma.class.count({
        where: { establishmentId, isArchived: false },
      }),
      prisma.exam.groupBy({
        by: ["status"],
        where: { establishmentId },
        _count: true,
      }),
      prisma.exam.count({ where: { establishmentId } }),
      prisma.examParticipation.count({
        where: { exam: { establishmentId } },
      }),
      prisma.examParticipation.count({
        where: { exam: { establishmentId }, isCompleted: true },
      }),
      prisma.incident.count({
        where: { participation: { exam: { establishmentId } } },
      }),
      prisma.examParticipation.findMany({
        where: {
          exam: { establishmentId },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
      }),
      prisma.exam.findMany({
        where: { establishmentId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.exam.findMany({
        where: { establishmentId },
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: {
          teacher: { select: { firstName: true, lastName: true } },
          _count: { select: { participations: true, exercises: true } },
        },
      }),
      prisma.exam.findMany({
        where: {
          establishmentId,
          status: { in: ["published", "in_progress"] },
        },
        orderBy: { startAt: "asc" },
        take: 5,
        include: {
          teacher: { select: { firstName: true, lastName: true } },
          _count: { select: { participations: true } },
        },
      }),
      prisma.adminActivityLog.findMany({
        where: { establishmentId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          actor: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.examParticipation.count({
        where: {
          exam: { establishmentId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.examParticipation.count({
        where: {
          exam: { establishmentId },
          createdAt: { gte: prevPeriodStart, lt: thirtyDaysAgo },
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
      return { date: key, label: formatShortDay(day), count };
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
      return { label: formatMonth(month), count };
    });

    const examStatusChart = Object.entries(STATUS_LABELS).map(
      ([status, label]) => ({
        status,
        label,
        count: statusCounts[status] ?? 0,
        fill: STATUS_COLORS[status] ?? "#6b7280",
      }),
    );

    const completionRate =
      totalParticipations > 0
        ? Math.round((completedParticipations / totalParticipations) * 100)
        : 0;

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
        studentCount,
        teacherCount,
        adminCount,
        classCount,
        totalExams,
        totalParticipations,
        incidentCount,
        completionRate,
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
        teacherName: `${e.teacher.firstName} ${e.teacher.lastName}`,
        updatedAt: e.updatedAt.toISOString(),
        participations: e._count.participations,
        exercises: e._count.exercises,
      })),
      liveExams: liveExams.map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        teacherName: `${e.teacher.firstName} ${e.teacher.lastName}`,
        startAt: e.startAt?.toISOString() ?? null,
        participations: e._count.participations,
      })),
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        action: log.action,
        createdAt: log.createdAt.toISOString(),
        actorName: log.actor
          ? `${log.actor.firstName} ${log.actor.lastName}`
          : "Système",
      })),
    };
  },
};
