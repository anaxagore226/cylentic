import { prisma } from "@/lib/prisma";

export const superAdminService = {
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
