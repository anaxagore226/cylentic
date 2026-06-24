import { prisma } from "@/lib/prisma";

export async function getNextSequence(
  establishmentId: string,
  role: "student" | "teacher" | "admin",
  acronym: string,
  year?: number,
): Promise<number> {
  const prefix =
    role === "student"
      ? `ETU-${acronym}-${year ?? new Date().getFullYear()}-`
      : role === "teacher"
        ? `PROF-${acronym}-`
        : `ADM-${acronym}-`;

  const users = await prisma.user.findMany({
    where: {
      establishmentId,
      identifier: { startsWith: prefix },
    },
    select: { identifier: true },
  });

  if (users.length === 0) return 1;

  const numbers = users.map((u) => {
    const parts = u.identifier.split("-");
    const last = parts[parts.length - 1];
    return parseInt(last, 10) || 0;
  });

  return Math.max(...numbers) + 1;
}

export function generateStudentId(acronym: string, year: number, seq: number) {
  return `ETU-${acronym}-${year}-${String(seq).padStart(4, "0")}`;
}

export function generateTeacherId(acronym: string, seq: number) {
  return `PROF-${acronym}-${String(seq).padStart(4, "0")}`;
}

export function generateAdminId(acronym: string, seq: number) {
  return `ADM-${acronym}-${String(seq).padStart(4, "0")}`;
}
