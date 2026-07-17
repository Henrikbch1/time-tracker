import {
  type HistoryEntry,
  type Tag,
  type Language,
  type ExportConfig,
  type RoundingConfig,
} from "./cookies";
import {
  formatDateTime,
  formatDuration,
  formatDurationFlexible,
  getRoundedDurationMs,
} from "./time";
import { getGroupedTodayTasks } from "./stats";
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
  roundingConfig?: RoundingConfig,
): string[][] {
  return history.map((entry, index) => [
    String(index + 1),
    entry.taskName,
    resolveTagName(entry, tags, language),
    formatDateTime(entry.startTimestamp),
    formatDateTime(entry.endTimestamp),
    formatDuration(
      getRoundedDurationMs(
        entry.durationMs,
        roundingConfig?.enabled ?? false,
        roundingConfig?.intervalMinutes ?? 0,
      ),
    ),
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
  roundingConfig?: RoundingConfig,
) {
  const rows = [
    buildHeader(language),
    ...buildRows(history, tags, language, roundingConfig),
  ];
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  // Prepend BOM so spreadsheet apps detect UTF-8 correctly.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `hookie-history-${fileStamp()}.csv`);
}

export async function exportXlsx(
  history: HistoryEntry[],
  tags: Tag[] = [],
  language: Language = "en",
  roundingConfig?: RoundingConfig,
) {
  const XLSX = await import("xlsx");
  const rows = [
    buildHeader(language),
    ...buildRows(history, tags, language, roundingConfig),
  ];
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
  roundingConfig?: RoundingConfig,
) {
  const header = buildHeader(language);
  const rows = buildRows(history, tags, language, roundingConfig);
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
  roundingConfig?: RoundingConfig,
) {
  if (history.length === 0) return;
  if (format === "csv")
    return exportCsv(history, tags, language, roundingConfig);
  if (format === "xlsx")
    return exportXlsx(history, tags, language, roundingConfig);
  return exportPdf(history, tags, language, roundingConfig);
}

// Backwards-compatible default export (used by TrackerContext.handleExport).
export function downloadHistory(
  history: HistoryEntry[],
  tags: Tag[] = [],
  language: Language = "en",
  roundingConfig?: RoundingConfig,
) {
  exportCsv(history, tags, language, roundingConfig);
}

/**
 * Generate formatted text representation of today's tasks with rounding applied.
 * @param history - History entries
 * @param now - Current timestamp
 * @param tags - Available tags
 * @param roundingConfig - Rounding configuration
 * @param exportConfig - Export format configuration
 * @param language - Language for formatting
 * @returns Formatted text (HTML-safe)
 */
export function exportFormattedToday(
  history: HistoryEntry[],
  now: number,
  tags: Tag[],
  roundingConfig: RoundingConfig,
  exportConfig: ExportConfig,
  language: Language = "en",
): string {
  const grouped = getGroupedTodayTasks(history, now, roundingConfig);

  if (grouped.length === 0) {
    return t("noSessionsSaved", language);
  }

  if (exportConfig.format === "table") {
    return exportFormattedAsTable(grouped, tags, exportConfig, language);
  }

  return exportFormattedAsTextBlock(grouped, tags, exportConfig, language);
}

function resolveTagNameForExport(
  tagId: string | undefined,
  tags: Tag[],
  language: Language,
): string {
  if (!tagId) return "";
  return (
    tags.find((tag) => tag.id === tagId)?.name ?? t("deletedLabel", language)
  );
}

function formatDurationForExport(
  durationMs: number,
  format: "HH:MM" | "H.H" | "minutes",
): string {
  return formatDurationFlexible(durationMs, format);
}

interface GroupedTask {
  taskName: string;
  tagId?: string;
  totalDurationMs: number;
  roundedDurationMs: number;
  entries: HistoryEntry[];
}

function exportFormattedAsTextBlock(
  grouped: GroupedTask[],
  tags: Tag[],
  exportConfig: ExportConfig,
  language: Language,
): string {
  const lines: string[] = [];

  for (const group of grouped) {
    let line = "";

    if (exportConfig.includeTaskName) {
      line += group.taskName;
    }

    if (exportConfig.includeTag && group.tagId) {
      const tagName = resolveTagNameForExport(group.tagId, tags, language);
      if (line) line += " | ";
      line += tagName;
    }

    const duration = formatDurationForExport(
      group.roundedDurationMs,
      exportConfig.timeFormat,
    );
    if (line) line += ": ";
    line += duration;

    lines.push(line);
  }

  return lines.join("\n");
}

function exportFormattedAsTable(
  grouped: GroupedTask[],
  tags: Tag[],
  exportConfig: ExportConfig,
  language: Language,
): string {
  const lines: string[] = [];
  const parts: string[] = [];

  if (exportConfig.includeTaskName) {
    parts.push(t("exportColTask", language));
  }
  if (exportConfig.includeTag) {
    parts.push(t("exportColTag", language));
  }
  parts.push(t("exportColDuration", language));

  lines.push(parts.join("\t"));
  lines.push("-".repeat(50));

  for (const group of grouped) {
    const rowParts: string[] = [];

    if (exportConfig.includeTaskName) {
      rowParts.push(group.taskName);
    }
    if (exportConfig.includeTag && group.tagId) {
      const tagName = resolveTagNameForExport(group.tagId, tags, language);
      rowParts.push(tagName);
    }

    const duration = formatDurationForExport(
      group.roundedDurationMs,
      exportConfig.timeFormat,
    );
    rowParts.push(duration);

    lines.push(rowParts.join("\t"));
  }

  return lines.join("\n");
}

/**
 * Calculate total duration for today with rounding applied.
 */
export function getTodayTotalDuration(
  history: HistoryEntry[],
  now: number,
  roundingConfig: RoundingConfig,
): number {
  const grouped = getGroupedTodayTasks(history, now, roundingConfig);
  return grouped.reduce((sum, group) => sum + group.roundedDurationMs, 0);
}
