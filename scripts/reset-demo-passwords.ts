import { prisma } from "@/lib/prisma";
import { DEFAULT_PASSWORD, hashPassword } from "@/lib/auth/password";

async function main() {
  const userPasswordHash = await hashPassword(DEFAULT_PASSWORD);
  const superPassword = process.env.SUPER_ADMIN_PASSWORD ?? "Cylentic2026!";
  const superPasswordHash = await hashPassword(superPassword);

  const users = await prisma.user.updateMany({
    data: { passwordHash: userPasswordHash, isActive: true },
  });

  const superAdmin = await prisma.platformAdmin.update({
    where: { identifier: "SADM-0001" },
    data: { passwordHash: superPasswordHash, isActive: true },
  });

  console.log(`✓ ${users.count} compte(s) utilisateur réinitialisé(s) → mot de passe : ${DEFAULT_PASSWORD}`);
  console.log(`✓ Super Admin ${superAdmin.identifier} → mot de passe : ${superPassword}`);
  console.log("");
  console.log("Exemples de connexion :");
  console.log("  Admin     : ADM-DEMO-0001 / 1234");
  console.log("  Prof      : PROF-DEMO-0001 / 1234");
  console.log("  Étudiant  : ETU-DEMO-2026-0001 / 1234 + code d'examen");
  console.log("  Super Admin : SADM-0001 / Cylentic2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
