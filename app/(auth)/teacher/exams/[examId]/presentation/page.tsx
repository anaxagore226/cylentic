import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AccessCodeDisplay } from "@/components/teacher/access-code-display";

export default async function PresentationPage({
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

  if (!exam?.accessCode) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <p className="mb-4 text-lg text-muted">{exam.name}</p>
      <AccessCodeDisplay code={exam.accessCode} />
      <p className="mt-8 text-sm text-muted">
        Code à dicter aux étudiants avant le début de l&apos;examen
      </p>
    </main>
  );
}
