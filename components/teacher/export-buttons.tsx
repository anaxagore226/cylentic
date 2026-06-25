"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

async function downloadExport(url: string, fallbackName: string) {
  const res = await fetch(url);
  const contentType = res.headers.get("Content-Type") ?? "";

  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const json = await res.json();
      throw new Error(json.error ?? "Export impossible");
    }
    throw new Error("Export impossible");
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackName;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export function ExportResultsButtons({ examId }: { examId: string }) {
  const [loading, setLoading] = useState<"xlsx" | "pdf" | "csv" | null>(null);
  const [error, setError] = useState("");

  async function handleExport(
    format: "xlsx" | "pdf" | "csv",
    url: string,
    fallbackName: string,
  ) {
    setError("");
    setLoading(format);
    try {
      await downloadExport(url, fallbackName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export impossible");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={loading === "xlsx"}
          disabled={loading !== null}
          onClick={() =>
            handleExport(
              "xlsx",
              `/api/exports/results?examId=${examId}&format=xlsx`,
              `resultats-${examId}.xlsx`,
            )
          }
        >
          Export Excel
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={loading === "pdf"}
          disabled={loading !== null}
          onClick={() =>
            handleExport(
              "pdf",
              `/api/exports/results?examId=${examId}&format=pdf`,
              `resultats-${examId}.pdf`,
            )
          }
        >
          Export PDF
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={loading === "csv"}
          disabled={loading !== null}
          onClick={() =>
            handleExport(
              "csv",
              `/api/exports/attendance?examId=${examId}`,
              `presence-${examId}.csv`,
            )
          }
        >
          Présence CSV
        </Button>
      </div>
    </div>
  );
}
