import { prisma } from "@/lib/prisma";

function formatShortDay(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("fr-FR", { month: "short" });
}

const PLAN_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export const superAdminService = {
  async getDashboardStats() {
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
      establishmentCount,
      activeEstablishments,
      userCount,
      studentCount,
      teacherCount,
      adminCount,
      examCount,
      incidentCount,
      totalParticipations,
      completedParticipations,
      recentEstablishmentsRaw,
      recentParticipations,
      monthlyEstablishments,
      monthlyExams,
      subscriptions,
      currentPeriodEstablishments,
      previousPeriodEstablishments,
      newEstablishmentsInPeriod,
    ] = await Promise.all([
      prisma.establishment.count(),
      prisma.establishment.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "student", isActive: true } }),
      prisma.user.count({ where: { role: "teacher", isActive: true } }),
      prisma.user.count({ where: { role: "admin", isActive: true } }),
      prisma.exam.count(),
      prisma.incident.count(),
      prisma.examParticipation.count(),
      prisma.examParticipation.count({ where: { isCompleted: true } }),
      prisma.establishment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: { select: { users: true, exams: true } },
        },
      }),
      prisma.examParticipation.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.establishment.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.exam.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.establishmentSubscription.groupBy({
        by: ["planId"],
        _count: true,
      }),
      prisma.establishment.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.establishment.count({
        where: { createdAt: { gte: prevPeriodStart, lt: thirtyDaysAgo } },
      }),
      prisma.establishment.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    const planUsage = await Promise.all(
      subscriptions.map(async (s, i) => {
        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: s.planId },
        });
        return {
          label: plan?.name ?? "Inconnu",
          count: s._count,
          fill: PLAN_COLORS[i % PLAN_COLORS.length],
        };
      }),
    );

    const establishmentGrowthTrend = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(thirtyDaysAgo);
      day.setDate(thirtyDaysAgo.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      const count = newEstablishmentsInPeriod.filter(
        (e) => e.createdAt.toISOString().slice(0, 10) === key,
      ).length;
      return { date: key, label: formatShortDay(day), count };
    });

    const participationTrend = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(thirtyDaysAgo);
      day.setDate(thirtyDaysAgo.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      const count = recentParticipations.filter(
        (p) => p.createdAt.toISOString().slice(0, 10) === key,
      ).length;
      return { date: key, label: formatShortDay(day), count };
    });

    const establishmentsByMonth = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const count = monthlyEstablishments.filter((e) => {
        const d = e.createdAt;
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      }).length;
      return { label: formatMonth(month), count };
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

    const establishmentGrowthDelta =
      previousPeriodEstablishments > 0
        ? Math.round(
            ((currentPeriodEstablishments - previousPeriodEstablishments) /
              previousPeriodEstablishments) *
              100,
          )
        : currentPeriodEstablishments > 0
          ? 100
          : 0;

    const completionRate =
      totalParticipations > 0
        ? Math.round((completedParticipations / totalParticipations) * 100)
        : 0;

    const userRoleChart = [
      { label: "Étudiants", count: studentCount, fill: "#10b981" },
      { label: "Professeurs", count: teacherCount, fill: "#3b82f6" },
      { label: "Admins", count: adminCount, fill: "#8b5cf6" },
    ];

    return {
      kpis: {
        establishmentCount,
        activeEstablishments,
        userCount,
        examCount,
        incidentCount,
        totalParticipations,
        completionRate,
        establishmentGrowthDelta,
        currentPeriodEstablishments,
      },
      establishmentGrowthTrend,
      participationTrend,
      establishmentsByMonth,
      examsByMonth,
      planUsage,
      userRoleChart,
      recentEstablishments: recentEstablishmentsRaw.map((e) => ({
        id: e.id,
        name: e.name,
        acronym: e.acronym,
        isActive: e.isActive,
        userCount: e._count.users,
        examCount: e._count.exams,
        planName: e.subscriptions[0]?.plan.name ?? "—",
        createdAt: e.createdAt.toISOString(),
      })),
    };
  },

  async getGlobalStats() {
    const [
      establishmentCount,
      activeEstablishments,
      userCount,
      examCount,
      incidentCount,
      plans,
    ] = await Promise.all([
      prisma.establishment.count(),
      prisma.establishment.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.exam.count(),
      prisma.incident.count(),
      prisma.subscriptionPlan.findMany({ orderBy: { code: "asc" } }),
    ]);

    const subscriptions = await prisma.establishmentSubscription.groupBy({
      by: ["planId"],
      _count: true,
    });

    const planUsage = await Promise.all(
      subscriptions.map(async (s) => {
        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: s.planId },
        });
        return { plan: plan?.name ?? "?", count: s._count };
      }),
    );

    const recentEstablishments = await prisma.establishment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { users: true, exams: true } },
      },
    });

    return {
      establishmentCount,
      activeEstablishments,
      userCount,
      examCount,
      incidentCount,
      planUsage,
      plans,
      recentEstablishments,
    };
  },

  async listEstablishments() {
    return prisma.establishment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { users: true, exams: true, classes: true } },
      },
    });
  },

  async toggleEstablishment(establishmentId: string, isActive: boolean) {
    return prisma.establishment.update({
      where: { id: establishmentId },
      data: { isActive },
    });
  },

  async listPlans() {
    return prisma.subscriptionPlan.findMany({ orderBy: { code: "asc" } });
  },

  async updatePlan(
    planId: string,
    data: {
      name?: string;
      maxTeachers?: number | null;
      maxStudents?: number | null;
      maxExamsPerMonth?: number | null;
      priceMin?: number | null;
      priceMax?: number | null;
      isActive?: boolean;
    },
  ) {
    return prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });
  },
};

export type SuperAdminDashboardStats = Awaited<
  ReturnType<typeof superAdminService.getDashboardStats>
>;
