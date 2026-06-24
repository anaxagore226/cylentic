import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ResultsTable } from "@/components/teacher/results-table";
import { Button } from "@/components/ui/button";
import { resultsService } from "@/lib/services/results.service";
import { TEACHER_NAV } from "@/lib/teacher/nav";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const { examId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });

  let data;
  try {
    data = await resultsService.getResults(examId, session.sub);
  } catch {
    notFound();
  }

  return (
    <DashboardShell
      nav={TEACHER_NAV}
      title={`Résultats — ${data.exam.name}`}
      userName={`${user!.firstName} ${user!.lastName}`}
      roleLabel={`Professeur — ${user!.establishment.name}`}
    >
      <div className="mb-4 flex gap-3">
        <Link href={`/teacher/exams/${examId}`}>
          <Button variant="ghost" size="sm">
            ← Retour
          </Button>
        </Link>
        <Link href={`/teacher/exams/${examId}/live`}>
          <Button variant="secondary" size="sm">
            Suivi live
          </Button>
        </Link>
      </div>
      <ResultsTable examId={examId} rows={data.participations} />
    </DashboardShell>
  );
}
