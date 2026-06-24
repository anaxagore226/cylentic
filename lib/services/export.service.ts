import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { resultsService } from "@/lib/services/results.service";

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function fetchResultsData(examId: string, teacherId: string) {
  const data = await resultsService.getResults(examId, teacherId);
  if (!data.participations.length) {
    throw new ExportError("Aucun résultat à exporter");
  }
  return data;
}

export const exportService = {
  async generateExcel(examId: string, teacherId: string): Promise<Buffer> {
    const data = await fetchResultsData(examId, teacherId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Résultats");

    sheet.columns = [
      { header: "Identifiant", key: "identifier", width: 22 },
      { header: "Nom", key: "name", width: 28 },
      { header: "Classe", key: "className", width: 16 },
      { header: "Statut", key: "status", width: 16 },
      { header: "Connexion", key: "connectedAt", width: 20 },
      { header: "Soumission", key: "submittedAt", width: 20 },
      { header: "Score auto", key: "autoScore", width: 12 },
      { header: "Score final", key: "finalScore", width: 12 },
      { header: "Incidents", key: "incidents", width: 10 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const p of data.participations) {
      sheet.addRow({
        identifier: p.student.identifier,
        name: p.student.name,
        className: p.student.className,
        status: p.statusLabel,
        connectedAt: p.connectedAt
          ? new Date(p.connectedAt).toLocaleString("fr-FR")
          : "",
        submittedAt: p.submittedAt
          ? new Date(p.submittedAt).toLocaleString("fr-FR")
          : "",
        autoScore: p.autoScore ?? "",
        finalScore: p.finalScore ?? "",
        incidents: p.incidentCount,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  async generatePdf(examId: string, teacherId: string): Promise<Buffer> {
    const data = await fetchResultsData(examId, teacherId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(18).text(`Résultats — ${data.exam.name}`, { align: "center" });
      doc.moveDown();
      doc.fontSize(10).text(`Généré le ${new Date().toLocaleString("fr-FR")}`);
      doc.moveDown();

      const headers = ["Étudiant", "Classe", "Statut", "Score final", "Inc."];
      const colX = [50, 200, 280, 380, 480];
      doc.font("Helvetica-Bold");
      headers.forEach((h, i) => doc.text(h, colX[i], doc.y, { continued: false }));
      doc.moveDown(0.5);
      doc.font("Helvetica");

      for (const p of data.participations) {
        const y = doc.y;
        if (y > 750) {
          doc.addPage();
        }
        doc.text(p.student.name, colX[0], doc.y);
        doc.text(p.student.className, colX[1], y);
        doc.text(p.statusLabel, colX[2], y);
        doc.text(p.finalScore?.toFixed(2) ?? "—", colX[3], y);
        doc.text(String(p.incidentCount), colX[4], y);
        doc.moveDown();
      }

      doc.end();
    });
  },

  async generateAttendanceCsv(examId: string, teacherId: string): Promise<string> {
    const live = await resultsService.getLiveStatus(examId, teacherId);
    const lines = [
      "identifiant,nom,classe,statut,connexion,soumission,incidents",
    ];
    for (const row of live.rows) {
      lines.push(
        [
          row.identifier,
          `"${row.name}"`,
          row.className,
          row.statusLabel,
          row.connectedAt ?? "",
          row.submittedAt ?? "",
          row.incidentCount,
        ].join(","),
      );
    }
    return lines.join("\n");
  },
};
