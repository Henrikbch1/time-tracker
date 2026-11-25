import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTracker } from "../context/TrackerContext";
import { formatLocalYMD } from "../lib/date";
import { exportFormattedToday, formatDurationForExport } from "../lib/export";
import { deltaColor, formatHM, formatSignedHM } from "../lib/overtime";
import { groupRoundedDurationsByTaskDay, startOfDay } from "../lib/stats";
import t from "../i18n";
import { CheckIcon, CopyIcon } from "./icons";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

export default function TodaySummary() {
  const { language } = useLanguage();
  const {
    history,
    tags,
    now,
    activeSession,
    pausedSessions,
    elapsedMs,
    roundingConfig,
    exportConfig,
    overtime,
  } = useTracker();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const todayKey = formatLocalYMD(now);
  const todayStart = startOfDay(now);

  const rows = useMemo(() => {
    const segments = history
      .filter((entry) => formatLocalYMD(entry.endTimestamp) === todayKey)
      .map((entry) => ({
        taskName: entry.taskName,
        tagId: entry.tagId,
        durationMs: entry.durationMs,
        dayKey: todayKey,
        dayTimestamp: todayStart,
      }));
    const openSessions = [
      ...pausedSessions.map((s) => ({ s, ms: s.accumulatedMs })),
      ...(activeSession ? [{ s: activeSession, ms: elapsedMs }] : []),
    ].filter(({ s }) => formatLocalYMD(s.createdTimestamp) === todayKey);
    for (const { s, ms } of openSessions) {
      segments.push({
        taskName: s.taskName,
        tagId: s.tagId,
        durationMs: ms,
        dayKey: todayKey,
        dayTimestamp: todayStart,
      });
    }
    const runningKey = activeSession
      ? `${activeSession.taskName}|${activeSession.tagId ?? ""}`
      : null;
    return groupRoundedDurationsByTaskDay(segments, roundingConfig)
      .map((group) => ({
        ...group,
        key: `${group.taskName}|${group.tagId ?? ""}`,
      }))
      .map((group) => ({ ...group, running: group.key === runningKey }))
      .sort((a, b) => b.roundedDurationMs - a.roundedDurationMs);
  }, [
    history,
    pausedSessions,
    activeSession,
    elapsedMs,
    roundingConfig,
    todayKey,
    todayStart,
  ]);

  const { trackedMs, targetMs, deltaMs } = overtime.today;
  const progress = targetMs > 0 ? Math.min(1, trackedMs / targetMs) : 1;

  const flash = (key: string) => {
    setCopiedKey(key);
    window.setTimeout(
      () => setCopiedKey((current) => (current === key ? null : current)),
      1600,
    );
  };

  const handleCopyAll = async () => {
    await copyText(
      exportFormattedToday(
        history,
        now,
        tags,
        roundingConfig,
        exportConfig,
        language,
      ),
    );
    flash("__all");
  };

  let statusText: string;
  if (targetMs === 0) statusText = t("noTargetToday", language);
  else if (deltaMs >= 0)
    statusText =
      deltaMs < 60_000
        ? t("targetReached", language)
        : `${formatSignedHM(deltaMs)} ${t("overTarget", language)}`;
  else statusText = `${formatHM(-deltaMs)} ${t("leftToTarget", language)}`;

  const hasHistoryToday = history.some(
    (entry) => formatLocalYMD(entry.endTimestamp) === todayKey,
  );

  return (
    <section className="surface flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t("todayTitle", language)}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span
              className="mono-face text-3xl font-semibold"
              style={{ color: "var(--text)" }}
            >
              {formatHM(trackedMs)}
            </span>
            {targetMs > 0 ? (
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                / {formatHM(targetMs)} {t("targetLabel", language)}
              </span>
            ) : null}
          </p>
        </div>
        <span
          className="badge mt-1 whitespace-nowrap"
          style={{
            background: `color-mix(in srgb, ${deltaColor(deltaMs)} 14%, transparent)`,
            color: deltaColor(deltaMs),
          }}
        >
          {formatSignedHM(deltaMs)}
        </span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full"
        style={{ background: "var(--surface-3)" }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${progress * 100}%`,
            background: deltaMs >= 0 ? "var(--success)" : "var(--primary)",
          }}
        />
      </div>
      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        {statusText}
      </p>

      <div
        className="mt-5 flex items-center justify-between gap-2 border-t pt-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {t("todaySummaryTitle", language)}
          </p>
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            {t("todaySummaryHint", language)}
          </p>
        </div>
        {hasHistoryToday ? (
          <button
            type="button"
            onClick={handleCopyAll}
            className="action-button shrink-0"
          >
            {copiedKey === "__all" ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
            {copiedKey === "__all"
              ? t("copied", language)
              : t("copyAll", language)}
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("noEntriesToday", language)}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {rows.map((row) => {
            const tag = row.tagId
              ? tags.find((item) => item.id === row.tagId)
              : undefined;
            const value = formatDurationForExport(
              row.roundedDurationMs,
              exportConfig.timeFormat,
              language,
            );
            return (
              <li
                key={row.key}
                className="flex items-center gap-3 border-b py-2.5 last:border-b-0"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: tag?.color ?? "var(--border-strong)" }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {row.taskName}
                  </p>
                  {tag || row.running ? (
                    <p
                      className="truncate text-xs"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {tag?.name}
                      {tag && row.running ? " · " : ""}
                      {row.running ? (
                        <span style={{ color: "var(--success)" }}>
                          {t("running", language)}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await copyText(value);
                    flash(row.key);
                  }}
                  className="mono-face flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--text)" }}
                  aria-label={`${t("copyValue", language)}: ${value}`}
                  title={t("copyValue", language)}
                >
                  {value}
                  {copiedKey === row.key ? (
                    <CheckIcon
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--success)" }}
                    />
                  ) : (
                    <CopyIcon
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--text-subtle)" }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
