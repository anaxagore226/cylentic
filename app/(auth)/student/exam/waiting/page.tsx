"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WaitingRoom } from "@/components/student/waiting-room";

function WaitingContent() {
  const params = useSearchParams();
  const examId = params.get("examId") ?? "";
  if (!examId) return null;
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <WaitingRoom examId={examId} />
    </main>
  );
}

export default function WaitingPage() {
  return (
    <Suspense>
      <WaitingContent />
    </Suspense>
  );
}
