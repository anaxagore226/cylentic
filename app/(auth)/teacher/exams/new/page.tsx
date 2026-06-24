import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ExamForm } from "@/components/teacher/exam-form";

const TEACHER_NAV = [
  { href: "/teacher/dashboard", label: "Tableau de bord" },
  { href: "/teacher/exams", label: "Mes examens" },
  { href: "/teacher/exams/new", label: "Créer un examen" },
];

export default async function NewExamPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });
  if (!user) redirect("/login");

  return (
    <DashboardShell
      nav={TEACHER_NAV}
      title="Créer un examen"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
    >
      <ExamForm />
    </DashboardShell>
  );
}
