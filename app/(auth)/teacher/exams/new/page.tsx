import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ExamForm } from "@/components/teacher/exam-form";
import { TEACHER_NAV_GROUPS } from "@/lib/teacher/nav";

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
      nav={TEACHER_NAV_GROUPS}
      title="Créer un examen"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Professeur — ${user.establishment.name}`}
    >
      <ExamForm />
    </DashboardShell>
  );
}
