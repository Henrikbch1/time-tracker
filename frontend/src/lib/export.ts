import { type HistoryEntry, type Tag, type Language } from "./cookies";
import { formatDateTime, formatDuration } from "./time";
import t from "../i18n";

export type ExportFormat = "csv" | "xlsx" | "pdf";

function resolveTagName(
  entry: HistoryEntry,
  tags: Tag[],
  language: Language,
): string {
  if (!entry.tagId) return "";
  return (
    tags.find((tag) => tag.id === entry.tagId)?.name ??
    t("deletedLabel", language)
  );
}

function buildHeader(language: Language): string[] {
  return [
    "#",
    t("exportColTask", language),
    t("exportColTag", language),
    t("exportColStart", language),
    t("exportColEnd", language),
    t("exportColDuration", language),
  ];
}

function buildRows(
  history: HistoryEntry[],
  tags: Tag[],
  language: Language,
): string[][] {
  return history.map((entry, index) => [
    String(index + 1),
    entry.taskName,
    resolveTagName(entry, tags, language),
    formatDateTime(entry.startTimestamp),
    formatDateTime(entry.endTimestamp),
    formatDuration(entry.durationMs),
  ]);
}

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCsv(
  history: HistoryEntry[],
  tags: Tag[] = [],
  language: Language = "en",
) {
  const rows = [buildHeader(language), ...buildRows(history, tags, language)];
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  // Prepend BOM so spreadsheet apps detect UTF-8 correctly.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `hookie-history-${fileStamp()}.csv`);
}

export async function exportXlsx(
  history: HistoryEntry[],
  tags: Tag[] = [],
  language: Language = "en",
) {
  const XLSX = await import("xlsx");
  const rows = [buildHeader(language), ...buildRows(history, tags, language)];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 34 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 12 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    t("exportSheetName", language),
  );
  XLSX.writeFile(workbook, `hookie-history-${fileStamp()}.xlsx`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportPdf(
  history: HistoryEntry[],
  tags: Tag[] = [],
  language: Language = "en",
) {
  const header = buildHeader(language);
  const rows = buildRows(history, tags, language);
  const title = t("exportFileName", language);

  const headHtml = header
    .map((cell) => `<th>${escapeHtml(cell)}</th>`)
    .join("");
  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("");

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  printWindow.document.write(`<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", system-ui, sans-serif; color: #0f172a; padding: 32px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; font-size: 10px; color: #475569; }
  tr:nth-child(even) td { background: #f8fafc; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">${escapeHtml(fileStamp())} · ${history.length}</div>
  <table>
    <thead><tr>${headHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
  <script>window.onload = function () { window.focus(); window.print(); };</script>
</body>
</html>`);
  printWindow.document.close();
}

export function exportHistory(
  format: ExportFormat,
  history: HistoryEntry[],
  tags: Tag[] = [],
  language: Language = "en",
) {
  if (history.length === 0) return;
  if (format === "csv") return exportCsv(history, tags, language);
  if (format === "xlsx") return exportXlsx(history, tags, language);
  return exportPdf(history, tags, language);
}

// Backwards-compatible default export (used by TrackerContext.handleExport).
export function downloadHistory(
  history: HistoryEntry[],
  tags: Tag[] = [],
  language: Language = "en",
) {
  exportCsv(history, tags, language);
}
