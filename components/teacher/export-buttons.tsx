"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ExportResultsButtons({ examId }: { examId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/api/exports/results?examId=${examId}&format=xlsx`}>
        <Button variant="secondary" size="sm">
          Export Excel
        </Button>
      </Link>
      <Link href={`/api/exports/results?examId=${examId}&format=pdf`}>
        <Button variant="secondary" size="sm">
          Export PDF
        </Button>
      </Link>
      <Link href={`/api/exports/attendance?examId=${examId}`}>
        <Button variant="ghost" size="sm">
          Présence CSV
        </Button>
      </Link>
    </div>
  );
}
