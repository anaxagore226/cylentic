import { prisma } from "@/lib/prisma";

async function main() {
  const userCount = await prisma.user.count();
  const platformAdminCount = await prisma.platformAdmin.count();
  const establishmentCount = await prisma.establishment.count();

  console.log({ userCount, platformAdminCount, establishmentCount });

  if (userCount === 0 && platformAdminCount === 0) {
    console.log("Base vide — exécutez: npm run db:seed && npm run db:seed-users");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
