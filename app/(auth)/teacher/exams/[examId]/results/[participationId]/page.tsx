import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SubmissionReview } from "@/components/teacher/submission-review";
import { Button } from "@/components/ui/button";
import { resultsService } from "@/lib/services/results.service";
import { TEACHER_NAV } from "@/lib/teacher/nav";

export default async function ParticipationDetailPage({
  params,
}: {
  params: Promise<{ examId: string; participationId: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const { examId, participationId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });

  let data;
  try {
    data = await resultsService.getParticipationDetail(
      examId,
      participationId,
      session.sub,
    );
  } catch {
    notFound();
  }

  return (
    <DashboardShell
      nav={TEACHER_NAV}
      title={`Copie — ${data.student.name}`}
      userName={`${user!.firstName} ${user!.lastName}`}
      roleLabel={`Professeur — ${user!.establishment.name}`}
    >
      <div className="mb-4">
        <Link href={`/teacher/exams/${examId}/results`}>
          <Button variant="ghost" size="sm">
            ← Retour aux résultats
          </Button>
        </Link>
      </div>
      <SubmissionReview
        examId={examId}
        participationId={participationId}
        data={data}
      />
    </DashboardShell>
  );
}
