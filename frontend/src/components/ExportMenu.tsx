import { useState } from "react";
import { type HistoryEntry, type Tag, type Language } from "../lib/cookies";
import { exportHistory, type ExportFormat } from "../lib/export";
import { DownloadIcon } from "./icons";
import t from "../i18n";

interface ExportMenuProps {
  readonly history: HistoryEntry[];
  readonly tags: Tag[];
  readonly language: Language;
}

export function ExportMenu({ history, tags, language }: ExportMenuProps) {
  const [open, setOpen] = useState(false);

  const run = (format: ExportFormat) => {
    setOpen(false);
    exportHistory(format, history, tags, language);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={history.length === 0}
        className="action-button"
      >
        <DownloadIcon className="h-4 w-4" />
        {t("exportData", language)}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-11 z-40 w-48 overflow-hidden rounded-xl border py-1 shadow-[var(--shadow-pop)]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {(
              [
                ["csv", "exportCsvLabel"],
                ["xlsx", "exportExcelLabel"],
                ["pdf", "exportPdfLabel"],
              ] as const
            ).map(([format, labelKey]) => (
              <button
                key={format}
                type="button"
                onClick={() => run(format)}
                className="block w-full px-4 py-2 text-left text-sm transition hover:bg-[var(--surface-2)]"
                style={{ color: "var(--text)" }}
              >
                {t(labelKey, language)}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default ExportMenu;
