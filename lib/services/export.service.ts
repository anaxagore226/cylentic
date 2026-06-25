import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { resultsService, ResultsError } from "@/lib/services/results.service";

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR");
}

function formatScore(value: number | null | undefined) {
  if (value == null) return "";
  return value.toFixed(2);
}

function safeFilename(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "examen"
  );
}

async function fetchExportData(examId: string, teacherId: string) {
  try {
    return await resultsService.getExportData(examId, teacherId);
  } catch (err) {
    if (err instanceof ResultsError && err.code === "EMPTY") {
      throw new ExportError(err.message);
    }
    throw err;
  }
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { bold: true };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10B981" },
  };
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
}

export const exportService = {
  async generateExcel(
    examId: string,
    teacherId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const data = await fetchExportData(examId, teacherId);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Cylentic";
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet("Synthèse");
    summarySheet.columns = [
      { header: "Champ", key: "field", width: 28 },
      { header: "Valeur", key: "value", width: 40 },
    ];
    styleHeaderRow(summarySheet.getRow(1));
    summarySheet.addRows([
      { field: "Examen", value: data.exam.name },
      { field: "Statut", value: data.exam.status },
      {
        field: "Début prévu",
        value: data.exam.startAt ? formatDate(data.exam.startAt) : "—",
      },
      {
        field: "Durée (min)",
        value: data.exam.durationMinutes ?? "—",
      },
      { field: "Étudiants inscrits", value: data.summary.total },
      { field: "Soumis", value: data.summary.submitted },
      { field: "En cours", value: data.summary.inProgress },
      { field: "Absents", value: data.summary.absent },
      { field: "Exclus", value: data.summary.excluded },
      {
        field: "Export généré le",
        value: new Date().toLocaleString("fr-FR"),
      },
    ]);

    const resultsSheet = workbook.addWorksheet("Résultats");
    resultsSheet.columns = [
      { header: "Identifiant", key: "identifier", width: 22 },
      { header: "Nom", key: "name", width: 28 },
      { header: "Classe", key: "className", width: 18 },
      { header: "Statut", key: "statusLabel", width: 18 },
      { header: "Connexion", key: "connectedAt", width: 20 },
      { header: "Soumission", key: "submittedAt", width: 20 },
      { header: "Score auto", key: "autoScore", width: 12 },
      { header: "Score manuel", key: "manualScore", width: 14 },
      { header: "Score final", key: "finalScore", width: 12 },
      { header: "Incidents", key: "incidents", width: 10 },
    ];
    styleHeaderRow(resultsSheet.getRow(1));

    for (const row of data.rows) {
      resultsSheet.addRow({
        identifier: row.identifier,
        name: row.name,
        className: row.className,
        statusLabel: row.statusLabel,
        connectedAt: formatDate(row.connectedAt),
        submittedAt: formatDate(row.submittedAt),
        autoScore: formatScore(row.autoScore),
        manualScore: formatScore(row.manualScore),
        finalScore: formatScore(row.finalScore),
        incidents: row.incidentCount,
      });
    }

    const hasExerciseDetail = data.participations.some(
      (p) => p.submissions.length > 0,
    );
    if (hasExerciseDetail) {
      const detailSheet = workbook.addWorksheet("Détail exercices");
      detailSheet.columns = [
        { header: "Étudiant", key: "student", width: 28 },
        { header: "Identifiant", key: "identifier", width: 22 },
        { header: "Exercice", key: "exercise", width: 30 },
        { header: "Score auto", key: "autoScore", width: 12 },
        { header: "Score manuel", key: "manualScore", width: 14 },
        { header: "Score final", key: "finalScore", width: 12 },
        { header: "Points max", key: "maxPoints", width: 12 },
      ];
      styleHeaderRow(detailSheet.getRow(1));

      for (const p of data.participations) {
        for (const s of p.submissions) {
          detailSheet.addRow({
            student: p.student.name,
            identifier: p.student.identifier,
            exercise: s.exerciseTitle,
            autoScore: formatScore(s.autoScore),
            manualScore: formatScore(s.manualScore),
            finalScore: formatScore(s.finalScore),
            maxPoints: s.maxPoints.toFixed(2),
          });
        }
      }
    }

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return {
      buffer,
      filename: `resultats-${safeFilename(data.exam.name)}.xlsx`,
    };
  },

  async generatePdf(
    examId: string,
    teacherId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const data = await fetchExportData(examId, teacherId);

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const colWidths = [0.28, 0.14, 0.18, 0.12, 0.12, 0.08].map(
        (r) => r * pageWidth,
      );
      const headers = [
        "Étudiant",
        "Classe",
        "Statut",
        "Auto",
        "Final",
        "Inc.",
      ];

      function drawTableHeader() {
        const y = doc.y;
        let x = doc.page.margins.left;
        doc.font("Helvetica-Bold").fontSize(9);
        for (let i = 0; i < headers.length; i++) {
          doc.text(headers[i], x, y, {
            width: colWidths[i],
            align: i >= 3 ? "right" : "left",
          });
          x += colWidths[i];
        }
        doc
          .moveTo(doc.page.margins.left, y + 14)
          .lineTo(doc.page.width - doc.page.margins.right, y + 14)
          .strokeColor("#cccccc")
          .stroke();
        doc.y = y + 18;
        doc.font("Helvetica").fontSize(9);
      }

      doc.fontSize(16).text(`Résultats — ${data.exam.name}`, { align: "center" });
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .fillColor("#555555")
        .text(
          `Généré le ${new Date().toLocaleString("fr-FR")} · ${data.summary.total} étudiant(s) · ${data.summary.submitted} soumission(s)`,
          { align: "center" },
        );
      doc.fillColor("#000000");
      doc.moveDown(1.2);

      drawTableHeader();

      for (const row of data.rows) {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 30) {
          doc.addPage();
          drawTableHeader();
        }

        const y = doc.y;
        let x = doc.page.margins.left;
        const cells = [
          `${row.name}\n${row.identifier}`,
          row.className,
          row.statusLabel,
          formatScore(row.autoScore) || "—",
          formatScore(row.finalScore) || "—",
          String(row.incidentCount),
        ];

        let rowHeight = 0;
        for (let i = 0; i < cells.length; i++) {
          const h = doc.heightOfString(cells[i], {
            width: colWidths[i],
            align: i >= 3 ? "right" : "left",
          });
          rowHeight = Math.max(rowHeight, h);
        }

        for (let i = 0; i < cells.length; i++) {
          doc.text(cells[i], x, y, {
            width: colWidths[i],
            align: i >= 3 ? "right" : "left",
            lineBreak: true,
          });
          x += colWidths[i];
        }

        doc.y = y + rowHeight + 6;
      }

      doc.end();
    });

    return {
      buffer,
      filename: `resultats-${safeFilename(data.exam.name)}.pdf`,
    };
  },

  async generateAttendanceCsv(examId: string, teacherId: string): Promise<string> {
    const data = await resultsService.getExportData(examId, teacherId);
    const lines = [
      "identifiant,nom,classe,statut,connexion,soumission,score_final,incidents",
    ];
    for (const row of data.rows) {
      lines.push(
        [
          row.identifier,
          `"${row.name.replace(/"/g, '""')}"`,
          `"${row.className.replace(/"/g, '""')}"`,
          row.statusLabel,
          row.connectedAt ?? "",
          row.submittedAt ?? "",
          row.finalScore != null ? row.finalScore.toFixed(2) : "",
          row.incidentCount,
        ].join(","),
      );
    }
    return lines.join("\n");
  },
};
