import { prisma } from "@/lib/prisma";
import { DEFAULT_PASSWORD, hashPassword } from "@/lib/auth/password";
import {
  generateAdminId,
  generateStudentId,
  generateTeacherId,
  getNextSequence,
} from "@/lib/utils/identifier";

const ACRONYM = "DEMO";
const YEAR = new Date().getFullYear();

const FIRST_NAMES = [
  "Amadou",
  "Fatou",
  "Moussa",
  "Aïssata",
  "Ibrahima",
  "Mariam",
  "Ousmane",
  "Khadija",
  "Abdoulaye",
  "Aminata",
  "Seydou",
  "Ramatou",
  "Boubacar",
  "Ndeye",
  "Cheikh",
  "Awa",
  "Modibo",
  "Salimata",
  "Mamadou",
  "Fanta",
];

const LAST_NAMES = [
  "Diallo",
  "Traoré",
  "Koné",
  "Sow",
  "Barry",
  "Camara",
  "Keita",
  "Sylla",
  "Bah",
  "Touré",
  "Cissé",
  "Doumbia",
  "Sanogo",
  "Ouattara",
  "Diabaté",
  "Fofana",
  "Coulibaly",
  "Sidibé",
  "Kane",
  "Niang",
];

async function ensureDemoEstablishment() {
  let establishment = await prisma.establishment.findFirst({
    where: { acronym: ACRONYM },
  });

  if (!establishment) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: "starter" },
    });
    if (!plan) {
      throw new Error("Plan « starter » introuvable — lancez d'abord npm run db:seed");
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    establishment = await prisma.$transaction(async (tx) => {
      const created = await tx.establishment.create({
        data: {
          name: "École de démonstration",
          acronym: ACRONYM,
          type: "engineering_school",
          country: "Sénégal",
          city: "Dakar",
          timezone: "Africa/Dakar",
          officialEmail: "contact@demo.cylentic.local",
          phone: "+221000000000",
        },
      });

      await tx.establishmentSubscription.create({
        data: {
          establishmentId: created.id,
          planId: plan.id,
          status: "trial",
          isSimulated: true,
          trialEndsAt,
        },
      });

      const adminId = generateAdminId(ACRONYM, 1);
      const admin = await tx.user.create({
        data: {
          establishmentId: created.id,
          identifier: adminId,
          role: "admin",
          email: "admin@demo.cylentic.local",
          firstName: "Admin",
          lastName: "Démo",
          passwordHash,
          mustChangePassword: false,
        },
      });

      await tx.adminProfile.create({
        data: { userId: admin.id, function: "Directeur" },
      });

      return created;
    });

    console.log(`✓ Établissement ${ACRONYM} créé (admin: ADM-${ACRONYM}-0001)`);
  }

  let academicYear = await prisma.academicYear.findFirst({
    where: { establishmentId: establishment.id, isActive: true },
  });
  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        establishmentId: establishment.id,
        label: `${YEAR}-${YEAR + 1}`,
        isActive: true,
      },
    });
  }

  let classRow = await prisma.class.findFirst({
    where: { establishmentId: establishment.id, isArchived: false },
  });
  if (!classRow) {
    classRow = await prisma.class.create({
      data: {
        establishmentId: establishment.id,
        name: "L3 Informatique",
        track: "Génie logiciel",
        level: "L3",
      },
    });
  }

  return { establishment, academicYear, classRow };
}

async function main() {
  const { establishment, academicYear, classRow } =
    await ensureDemoEstablishment();
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const teachersToCreate = 4;
  const studentsToCreate = 16;
  const created: string[] = [];

  for (let i = 0; i < teachersToCreate; i++) {
    const firstName = FIRST_NAMES[i];
    const lastName = LAST_NAMES[i];
    const email = `prof.${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.cylentic.local`;

    const exists = await prisma.user.findFirst({
      where: { establishmentId: establishment.id, email },
    });
    if (exists) continue;

    const seq = await getNextSequence(establishment.id, "teacher", ACRONYM);
    const identifier = generateTeacherId(ACRONYM, seq);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          establishmentId: establishment.id,
          identifier,
          role: "teacher",
          email,
          firstName,
          lastName,
          passwordHash,
          mustChangePassword: true,
        },
      });
      await tx.teacherProfile.create({
        data: {
          userId: user.id,
          subjects: "Programmation, Algorithmique",
          function: "Enseignant",
        },
      });
    });

    created.push(identifier);
  }

  for (let i = 0; i < studentsToCreate; i++) {
    const idx = teachersToCreate + i;
    const firstName = FIRST_NAMES[idx];
    const lastName = LAST_NAMES[idx];
    const email = `etu.${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.cylentic.local`;
    const matricule = `MAT-${String(i + 1).padStart(4, "0")}`;

    const exists = await prisma.user.findFirst({
      where: { establishmentId: establishment.id, email },
    });
    if (exists) continue;

    const seq = await getNextSequence(
      establishment.id,
      "student",
      ACRONYM,
      YEAR,
    );
    const identifier = generateStudentId(ACRONYM, YEAR, seq);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          establishmentId: establishment.id,
          identifier,
          role: "student",
          email,
          firstName,
          lastName,
          passwordHash,
          mustChangePassword: true,
        },
      });
      await tx.studentProfile.create({
        data: {
          userId: user.id,
          matricule,
          classId: classRow.id,
          academicYearId: academicYear.id,
        },
      });
    });

    created.push(identifier);
  }

  console.log(`✓ ${created.length} utilisateur(s) ajouté(s) (${ACRONYM})`);
  console.log(`  Mot de passe par défaut : ${DEFAULT_PASSWORD}`);
  if (created.length > 0) {
    console.log("  Identifiants :");
    for (const id of created) {
      console.log(`    - ${id}`);
    }
  } else {
    console.log("  (tous existaient déjà — relancez après suppression ou changez les emails)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
