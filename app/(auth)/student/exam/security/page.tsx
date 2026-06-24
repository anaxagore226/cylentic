"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExamSecurityConsent } from "@/components/student/exam-security-consent";

function SecurityContent() {
  const params = useSearchParams();
  const examId = params.get("examId") ?? "";

  if (!examId) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-muted">Identifiant d&apos;examen manquant.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <ExamSecurityConsent examId={examId} />
    </main>
  );
}

export default function SecurityPage() {
  return (
    <Suspense>
      <SecurityContent />
    </Suspense>
  );
}
