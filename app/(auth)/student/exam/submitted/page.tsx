import { Suspense } from "react";
import { SubmittedMessage } from "@/components/student/submitted-message";

export default function SubmittedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Suspense>
        <SubmittedMessage />
      </Suspense>
    </main>
  );
}
