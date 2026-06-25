import { prisma } from "@/lib/prisma";
import { PLAN_DETAILS } from "@/lib/constants/plans";

export class BillingError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatLimit(value: number | null | undefined) {
  return value == null ? null : value;
}

function usagePercent(current: number, max: number | null | undefined) {
  if (max == null || max <= 0) return null;
  return Math.min(100, Math.round((current / max) * 100));
}

function usageLevel(percent: number | null) {
  if (percent == null) return "ok" as const;
  if (percent >= 100) return "exceeded" as const;
  if (percent >= 80) return "warning" as const;
  return "ok" as const;
}

async function logPlanChange(
  establishmentId: string,
  actorUserId: string,
  oldPlanCode: string,
  newPlanCode: string,
) {
  await prisma.adminActivityLog.create({
    data: {
      establishmentId,
      actorUserId,
      action: "subscription.change_plan",
      entityType: "subscription",
      newValue: { from: oldPlanCode, to: newPlanCode },
    },
  });
}

export const billingService = {
  async getUsage(establishmentId: string) {
    const start = monthStart();
    const [activeStudents, activeTeachers, examsThisMonth] = await Promise.all([
      prisma.user.count({
        where: { establishmentId, role: "student", isActive: true },
      }),
      prisma.user.count({
        where: { establishmentId, role: "teacher", isActive: true },
      }),
      prisma.exam.count({
        where: { establishmentId, createdAt: { gte: start } },
      }),
    ]);

    return { activeStudents, activeTeachers, examsThisMonth };
  },

  async getCurrentSubscription(establishmentId: string) {
    return prisma.establishmentSubscription.findFirst({
      where: { establishmentId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getOverview(establishmentId: string) {
    const [subscription, usage, plans] = await Promise.all([
      this.getCurrentSubscription(establishmentId),
      this.getUsage(establishmentId),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: [{ priceMin: "asc" }, { code: "asc" }],
      }),
    ]);

    if (!subscription) {
      throw new BillingError("Aucun abonnement trouvé", "NOT_FOUND");
    }

    const plan = subscription.plan;
    const limits = {
      teachers: formatLimit(plan.maxTeachers),
      students: formatLimit(plan.maxStudents),
      examsPerMonth: formatLimit(plan.maxExamsPerMonth),
    };

    const consumption = {
      teachers: {
        current: usage.activeTeachers,
        max: limits.teachers,
        percent: usagePercent(usage.activeTeachers, limits.teachers),
        level: usageLevel(usagePercent(usage.activeTeachers, limits.teachers)),
      },
      students: {
        current: usage.activeStudents,
        max: limits.students,
        percent: usagePercent(usage.activeStudents, limits.students),
        level: usageLevel(usagePercent(usage.activeStudents, limits.students)),
      },
      examsThisMonth: {
        current: usage.examsThisMonth,
        max: limits.examsPerMonth,
        percent: usagePercent(usage.examsThisMonth, limits.examsPerMonth),
        level: usageLevel(usagePercent(usage.examsThisMonth, limits.examsPerMonth)),
      },
    };

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        isSimulated: subscription.isSimulated,
        trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
        startedAt: subscription.startedAt.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      },
      plan: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        maxTeachers: plan.maxTeachers,
        maxStudents: plan.maxStudents,
        maxExamsPerMonth: plan.maxExamsPerMonth,
        priceMin: plan.priceMin != null ? Number(plan.priceMin) : null,
        priceMax: plan.priceMax != null ? Number(plan.priceMax) : null,
        currency: plan.currency,
        features: plan.features,
      },
      consumption,
      availablePlans: plans.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        maxTeachers: p.maxTeachers,
        maxStudents: p.maxStudents,
        maxExamsPerMonth: p.maxExamsPerMonth,
        priceMin: p.priceMin != null ? Number(p.priceMin) : null,
        priceMax: p.priceMax != null ? Number(p.priceMax) : null,
        currency: p.currency,
        isCurrent: p.id === plan.id,
        details: PLAN_DETAILS[p.code as keyof typeof PLAN_DETAILS] ?? null,
      })),
    };
  },

  async changePlan(
    establishmentId: string,
    actorUserId: string,
    planCode: string,
  ) {
    const targetPlan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode },
    });
    if (!targetPlan?.isActive) {
      throw new BillingError("Plan tarifaire invalide", "INVALID_PLAN");
    }

    const current = await this.getCurrentSubscription(establishmentId);
    if (!current) {
      throw new BillingError("Abonnement introuvable", "NOT_FOUND");
    }
    if (current.planId === targetPlan.id) {
      throw new BillingError("Vous êtes déjà sur ce plan", "SAME_PLAN");
    }

    const usage = await this.getUsage(establishmentId);
    if (
      targetPlan.maxTeachers != null &&
      usage.activeTeachers > targetPlan.maxTeachers
    ) {
      throw new BillingError(
        `Impossible : ${usage.activeTeachers} professeur(s) actif(s) pour une limite de ${targetPlan.maxTeachers}.`,
        "LIMIT_EXCEEDED",
      );
    }
    if (
      targetPlan.maxStudents != null &&
      usage.activeStudents > targetPlan.maxStudents
    ) {
      throw new BillingError(
        `Impossible : ${usage.activeStudents} étudiant(s) actif(s) pour une limite de ${targetPlan.maxStudents}.`,
        "LIMIT_EXCEEDED",
      );
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    const updated = await prisma.establishmentSubscription.update({
      where: { id: current.id },
      data: {
        planId: targetPlan.id,
        status: "trial",
        isSimulated: true,
        trialEndsAt,
        currentPeriodEnd: trialEndsAt,
      },
      include: { plan: true },
    });

    await logPlanChange(
      establishmentId,
      actorUserId,
      current.plan.code,
      targetPlan.code,
    );

    return {
      subscription: updated,
      simulatedPayment: true,
      message:
        "Paiement en cours d'intégration — votre compte est activé en mode essai gratuit pendant 30 jours.",
    };
  },

  async assertCanAddStudent(establishmentId: string) {
    const sub = await this.getCurrentSubscription(establishmentId);
    if (!sub) return;
    const max = sub.plan.maxStudents;
    if (max == null) return;
    const count = await prisma.user.count({
      where: { establishmentId, role: "student", isActive: true },
    });
    if (count >= max) {
      throw new BillingError(
        `Limite du plan atteinte : ${max} étudiant(s) maximum. Passez à un plan supérieur.`,
        "LIMIT_EXCEEDED",
      );
    }
  },

  async assertCanAddTeacher(establishmentId: string) {
    const sub = await this.getCurrentSubscription(establishmentId);
    if (!sub) return;
    const max = sub.plan.maxTeachers;
    if (max == null) return;
    const count = await prisma.user.count({
      where: { establishmentId, role: "teacher", isActive: true },
    });
    if (count >= max) {
      throw new BillingError(
        `Limite du plan atteinte : ${max} professeur(s) maximum. Passez à un plan supérieur.`,
        "LIMIT_EXCEEDED",
      );
    }
  },

  async assertCanCreateExam(establishmentId: string) {
    const sub = await this.getCurrentSubscription(establishmentId);
    if (!sub) return;
    const max = sub.plan.maxExamsPerMonth;
    if (max == null) return;
    const count = await prisma.exam.count({
      where: {
        establishmentId,
        createdAt: { gte: monthStart() },
      },
    });
    if (count >= max) {
      throw new BillingError(
        `Quota mensuel atteint : ${max} examen(s) ce mois-ci. Passez à un plan supérieur.`,
        "LIMIT_EXCEEDED",
      );
    }
  },
};
