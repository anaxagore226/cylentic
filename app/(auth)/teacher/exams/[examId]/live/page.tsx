import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LiveMonitor } from "@/components/teacher/live-monitor";
import { Button } from "@/components/ui/button";
import { TEACHER_NAV } from "@/lib/teacher/nav";

export default async function LivePage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const { examId } = await params;
  const exam = await prisma.exam.findFirst({
    where: { id: examId, teacherId: session.sub },
  });
  if (!exam) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });

  return (
    <DashboardShell
      nav={TEACHER_NAV}
      title={`Suivi live — ${exam.name}`}
      userName={`${user!.firstName} ${user!.lastName}`}
      roleLabel={`Professeur — ${user!.establishment.name}`}
    >
      <div className="mb-4 flex gap-3">
        <Link href={`/teacher/exams/${examId}`}>
          <Button variant="ghost" size="sm">
            ← Retour à l&apos;examen
          </Button>
        </Link>
        <Link href={`/teacher/exams/${examId}/results`}>
          <Button variant="secondary" size="sm">
            Résultats
          </Button>
        </Link>
      </div>
      <LiveMonitor examId={examId} />
    </DashboardShell>
  );
}
