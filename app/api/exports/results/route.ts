import { getSession } from "@/lib/auth/session";
import { exportService, ExportError } from "@/lib/services/export.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const format = searchParams.get("format") ?? "xlsx";

    if (!examId) {
      return NextResponse.json({ success: false, error: "examId requis" }, { status: 400 });
    }

    if (format === "xlsx") {
      const { buffer, filename } = await exportService.generateExcel(examId, session.sub);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "pdf") {
      const { buffer, filename } = await exportService.generatePdf(examId, session.sub);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Format invalide" }, { status: 400 });
  } catch (err) {
    if (err instanceof ExportError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    console.error("[export results]", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
