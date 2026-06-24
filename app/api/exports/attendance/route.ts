import { getSession } from "@/lib/auth/session";
import { exportService } from "@/lib/services/export.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    const examId = new URL(request.url).searchParams.get("examId");
    if (!examId) {
      return NextResponse.json({ success: false, error: "examId requis" }, { status: 400 });
    }

    const csv = await exportService.generateAttendanceCsv(examId, session.sub);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="presence-${examId}.csv"`,
      },
    });
  } catch (err) {
    console.error("[export attendance]", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
