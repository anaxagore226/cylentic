import { prisma } from "@/lib/prisma";
import {
  ONBOARDING_STEP_IDS,
  ONBOARDING_STEP_META,
  type OnboardingStepId,
} from "@/lib/constants/onboarding";
import type { OnboardingStatus, OnboardingStepStatus } from "@/lib/types/onboarding";

export class OnboardingError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

async function getCounts(establishmentId: string) {
  const [academicYears, classes, teachers, students] = await Promise.all([
    prisma.academicYear.count({ where: { establishmentId, isArchived: false } }),
    prisma.class.count({ where: { establishmentId } }),
    prisma.user.count({
      where: { establishmentId, role: "teacher", isActive: true },
    }),
    prisma.user.count({
      where: { establishmentId, role: "student", isActive: true },
    }),
  ]);

  return { academicYears, classes, teachers, students };
}

function buildSteps(counts: {
  academicYears: number;
  classes: number;
  teachers: number;
  students: number;
}): OnboardingStepStatus[] {
  const completionMap: Record<OnboardingStepId, boolean> = {
    welcome: true,
    academic_year: counts.academicYears > 0,
    classes: counts.classes > 0,
    teachers: counts.teachers > 0,
    students: counts.students > 0,
    complete: false,
  };

  const countMap: Partial<Record<OnboardingStepId, number>> = {
    academic_year: counts.academicYears,
    classes: counts.classes,
    teachers: counts.teachers,
    students: counts.students,
  };

  return ONBOARDING_STEP_IDS.map((id) => ({
    id,
    title: ONBOARDING_STEP_META[id].title,
    description: ONBOARDING_STEP_META[id].description,
    required: ONBOARDING_STEP_META[id].required,
    completed: completionMap[id],
    count: countMap[id],
  }));
}

function computeProgress(steps: OnboardingStepStatus[]) {
  const required = steps.filter(
    (s) => s.required && s.id !== "complete",
  );
  if (!required.length) return 100;
  const done = required.filter((s) => s.completed).length;
  return Math.round((done / required.length) * 100);
}

export const onboardingService = {
  async getStatus(establishmentId: string): Promise<OnboardingStatus> {
    const [establishment, subscription, counts] = await Promise.all([
      prisma.establishment.findUnique({
        where: { id: establishmentId },
        select: {
          id: true,
          name: true,
          acronym: true,
          onboardingCompletedAt: true,
        },
      }),
      prisma.establishmentSubscription.findFirst({
        where: { establishmentId },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      }),
      getCounts(establishmentId),
    ]);

    if (!establishment) {
      throw new OnboardingError("Établissement introuvable", "NOT_FOUND");
    }

    const isComplete = establishment.onboardingCompletedAt != null;
    const steps = buildSteps(counts);

    if (isComplete) {
      steps[steps.length - 1].completed = true;
    }

    const canFinish =
      counts.academicYears > 0 && counts.classes > 0 && counts.teachers > 0;

    return {
      establishment: {
        id: establishment.id,
        name: establishment.name,
        acronym: establishment.acronym,
      },
      subscription: subscription
        ? {
            planName: subscription.plan.name,
            trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
            isSimulated: subscription.isSimulated,
          }
        : null,
      isComplete,
      completedAt: establishment.onboardingCompletedAt?.toISOString() ?? null,
      progress: isComplete ? 100 : computeProgress(steps),
      canFinish,
      steps,
    };
  },

  async complete(establishmentId: string, actorUserId: string) {
    const status = await this.getStatus(establishmentId);

    if (status.isComplete) {
      return status;
    }

    if (!status.canFinish) {
      throw new OnboardingError(
        "Complétez l'année académique, au moins une classe et un professeur avant de terminer.",
        "INCOMPLETE",
      );
    }

    await prisma.$transaction([
      prisma.establishment.update({
        where: { id: establishmentId },
        data: { onboardingCompletedAt: new Date() },
      }),
      prisma.adminActivityLog.create({
        data: {
          establishmentId,
          actorUserId,
          action: "onboarding.complete",
          entityType: "establishment",
          entityId: establishmentId,
        },
      }),
    ]);

    return this.getStatus(establishmentId);
  },
};
