import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const plans = [
    {
      code: "free",
      name: "Gratuit",
      maxTeachers: 1,
      maxStudents: 10,
      maxExamsPerMonth: 3,
      priceMin: 0,
      priceMax: 0,
    },
    {
      code: "starter",
      name: "Starter",
      maxTeachers: 5,
      maxStudents: 100,
      maxExamsPerMonth: null,
      priceMin: 15000,
      priceMax: 25000,
    },
    {
      code: "pro",
      name: "Pro",
      maxTeachers: 20,
      maxStudents: 500,
      maxExamsPerMonth: null,
      priceMin: 50000,
      priceMax: 80000,
    },
    {
      code: "enterprise",
      name: "Enterprise",
      maxTeachers: null,
      maxStudents: null,
      maxExamsPerMonth: null,
      priceMin: null,
      priceMax: null,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        maxTeachers: plan.maxTeachers,
        maxStudents: plan.maxStudents,
        maxExamsPerMonth: plan.maxExamsPerMonth,
        priceMin: plan.priceMin,
        priceMax: plan.priceMax,
      },
      create: {
        ...plan,
        features: {},
      },
    });
  }

  console.log("✓ Plans tarifaires initialisés");

  const superPassword = process.env.SUPER_ADMIN_PASSWORD ?? "Cylentic2026!";
  await prisma.platformAdmin.upsert({
    where: { identifier: "SADM-0001" },
    update: {
      passwordHash: await hashPassword(superPassword),
      isActive: true,
    },
    create: {
      identifier: "SADM-0001",
      email: "superadmin@cylentic.local",
      firstName: "Super",
      lastName: "Admin",
      passwordHash: await hashPassword(superPassword),
    },
  });
  console.log("✓ Super Admin initialisé (SADM-0001)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
