import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateAdminId } from "@/lib/utils/identifier";
import type { CreateEstablishmentInput } from "@/lib/validators/establishment.schema";

export class EstablishmentError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

export const establishmentService = {
  async register(input: CreateEstablishmentInput) {
    const acronym = input.establishment.acronym.toUpperCase();

    const existing = await prisma.establishment.findFirst({
      where: { acronym },
    });
    if (existing) {
      throw new EstablishmentError(
        "Ce sigle est déjà utilisé",
        "ACRONYM_EXISTS",
      );
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: input.planCode },
    });
    if (!plan) {
      throw new EstablishmentError("Plan tarifaire introuvable", "PLAN_NOT_FOUND");
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    const identifier = generateAdminId(acronym, 1);
    const passwordHash = await hashPassword(input.admin.password);

    const result = await prisma.$transaction(async (tx) => {
      const establishment = await tx.establishment.create({
        data: {
          name: input.establishment.name,
          acronym,
          type: input.establishment.type,
          country: input.establishment.country,
          city: input.establishment.city,
          timezone: input.establishment.timezone,
          officialEmail: input.establishment.officialEmail,
          phone: input.establishment.phone,
        },
      });

      await tx.establishmentSubscription.create({
        data: {
          establishmentId: establishment.id,
          planId: plan.id,
          status: "trial",
          isSimulated: true,
          trialEndsAt,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          establishmentId: establishment.id,
          identifier,
          role: "admin",
          email: input.admin.email,
          firstName: input.admin.firstName,
          lastName: input.admin.lastName,
          passwordHash,
          mustChangePassword: false,
        },
      });

      await tx.adminProfile.create({
        data: {
          userId: adminUser.id,
          function: input.admin.function,
        },
      });

      await tx.adminActivityLog.create({
        data: {
          establishmentId: establishment.id,
          actorUserId: adminUser.id,
          action: "establishment.create",
          entityType: "establishment",
          entityId: establishment.id,
          newValue: { name: establishment.name, acronym },
        },
      });

      return { establishment, adminUser };
    });

    return {
      establishment: result.establishment,
      admin: {
        id: result.adminUser.id,
        identifier: result.adminUser.identifier,
        email: result.adminUser.email,
      },
      trialEndsAt,
      simulatedPayment: true,
    };
  },
};
