import { useState } from "react";
import { type HistoryEntry, type Tag, type Language } from "../lib/cookies";
import { type RoundingConfig, type ExportConfig } from "../lib/cookies";
import { exportFormattedToday, getTodayTotalDuration } from "../lib/export";
import { formatDurationFlexible } from "../lib/time";
import t from "../i18n";

interface QuickExportTodayProps {
  history: HistoryEntry[];
  now: number;
  tags: Tag[];
  roundingConfig: RoundingConfig;
  exportConfig: ExportConfig;
  language: Language;
}

export function QuickExportToday({
  history,
  now,
  tags,
  roundingConfig,
  exportConfig,
  language,
}: QuickExportTodayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedText = exportFormattedToday(
    history,
    now,
    tags,
    roundingConfig,
    exportConfig,
    language,
  );

  const totalDuration = getTodayTotalDuration(history, now, roundingConfig);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
      const textarea = document.createElement("textarea");
      textarea.value = formattedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className="primary-button"
        onClick={() => setIsOpen(true)}
        title={t("quickExportTodayHelp", language)}
      >
        {t("quickExportToday", language)}
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="surface w-full max-w-2xl rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b p-4"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {t("quickExportToday", language)}
          </h2>
          <button
            type="button"
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {formattedText === t("noSessionsSaved", language) ? (
            <p style={{ color: "var(--text-muted)" }}>
              {t("noSessionsSaved", language)}
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {t("trackedTime", language)}
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    {formatDurationFlexible(totalDuration, "HH:MM")}
                  </p>
                </div>
              </div>

              <div
                className="mb-4 rounded-lg border p-3"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <pre
                  className="whitespace-pre-wrap break-words text-xs font-mono"
                  style={{ color: "var(--text)" }}
                >
                  {formattedText}
                </pre>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="primary-button flex-1"
                  onClick={handleCopy}
                  aria-live="polite"
                >
                  {copied ? "✓ " + t("saved", language) : "Copy"}
                </button>
                <button
                  type="button"
                  className="secondary-button flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  {t("closeLabel", language)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
