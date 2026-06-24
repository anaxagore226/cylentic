"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExamComposeRoom } from "@/components/student/exam-compose-room";

function ComposeContent() {
  const params = useSearchParams();
  const examId = params.get("examId") ?? "";
  if (!examId) return null;
  return <ExamComposeRoom examId={examId} />;
}

export default function ComposePage() {
  return (
    <Suspense>
      <ComposeContent />
    </Suspense>
  );
}
