import { useState, type FormEvent } from "react";
import { type HistoryEntry, type Tag, type Language } from "../lib/cookies";
import {
  formatDuration,
  formatShortDate,
  formatTime,
  getRoundedDurationMs,
} from "../lib/time";
import { useTracker } from "../context/TrackerContext";
import { ExportMenu } from "./ExportMenu";
import t from "../i18n";

interface HistoryPanelProps {
  readonly history: HistoryEntry[];
  readonly allHistory?: HistoryEntry[];
  readonly tags?: Tag[];
  readonly onUpdateEntry: (
    entryId: string,
    payload: { startTimestamp: number; durationMs: number },
  ) => void;
  readonly language: Language;
  readonly title?: string;
  readonly subtitle?: string;
}

function toDateTimeLocalValue(timestamp: number) {
  const date = new Date(timestamp);
  const local = new Date(timestamp - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

interface TagBadgeProps {
  readonly tagId: string;
  readonly tags: Tag[];
  readonly language: Language;
}

function TagBadge({ tagId, tags, language }: TagBadgeProps) {
  const tag = tags.find((tg) => tg.id === tagId);
  return (
    <span
      className="badge"
      style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
    >
      <span
        style={{ background: tag?.color ?? "transparent" }}
        className="inline-block h-2.5 w-2.5 rounded-full"
      />
      <span className="max-w-[8rem] truncate">
        {tag?.name ?? t("deletedLabel", language)}
      </span>
    </span>
  );
}

export function HistoryPanel({
  history,
  allHistory,
  tags = [],
  onUpdateEntry,
  language,
  title,
  subtitle,
}: HistoryPanelProps) {
  const { roundingConfig } = useTracker();
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editStartInput, setEditStartInput] = useState("");
  const [editDurationInput, setEditDurationInput] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const exportSource = allHistory ?? history;

  const handleStartEdit = (entry: HistoryEntry) => {
    setEditingEntryId(entry.id);
    setEditStartInput(toDateTimeLocalValue(entry.startTimestamp));
    setEditDurationInput(
      String(Math.max(1, Math.round(entry.durationMs / 60_000))),
    );
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditStartInput("");
    setEditDurationInput("");
    setEditError(null);
  };

  const handleSaveEdit = (
    event: FormEvent<HTMLFormElement>,
    entryId: string,
  ) => {
    event.preventDefault();

    const parsedStart = new Date(editStartInput).getTime();
    if (!Number.isFinite(parsedStart)) {
      setEditError(t("invalidDateTimeValidation", language));
      return;
    }

    const parsedMinutes = Number(editDurationInput);
    if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) {
      setEditError(t("durationPositiveValidation", language));
      return;
    }

    onUpdateEntry(entryId, {
      startTimestamp: parsedStart,
      durationMs: Math.round(parsedMinutes * 60_000),
    });
    handleCancelEdit();
  };

  return (
    <section className="surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">{title ?? t("taskHistory", language)}</p>
          {subtitle ? (
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="chip">
            {history.length} {t("entriesLabel", language)}
          </span>
          <ExportMenu history={exportSource} tags={tags} language={language} />
        </div>
      </div>

      {history.length === 0 ? (
        <div
          className="mt-6 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <p
            className="text-base font-semibold"
            style={{ color: "var(--text)" }}
          >
            {t("noEntriesMatch", language)}
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            {t("finishATaskParagraph", language)}
          </p>
        </div>
      ) : (
        <ol className="mt-5 grid gap-2.5">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border p-4"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.7fr))_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate text-sm font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {entry.taskName}
                    </span>
                    {entry.tagId ? (
                      <TagBadge
                        tagId={entry.tagId}
                        tags={tags}
                        language={language}
                      />
                    ) : null}
                  </div>
                  <span
                    className="badge mt-1.5"
                    style={{
                      background: "var(--success-soft)",
                      color: "var(--success)",
                    }}
                  >
                    {t("statusCompleted", language)}
                  </span>
                </div>

                <Detail
                  label={t("detailStarted", language)}
                  value={formatTime(entry.startTimestamp)}
                  helper={formatShortDate(entry.startTimestamp)}
                />
                <Detail
                  label={t("detailStopped", language)}
                  value={formatTime(entry.endTimestamp)}
                  helper={formatShortDate(entry.endTimestamp)}
                />
                <Detail
                  label={t("detailDuration", language)}
                  value={formatDuration(
                    getRoundedDurationMs(
                      entry.durationMs,
                      roundingConfig.enabled,
                      roundingConfig.intervalMinutes,
                    ),
                  )}
                  helper={t("finishedAt", language)}
                />

                {editingEntryId !== entry.id ? (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(entry)}
                    disabled={editingEntryId !== null}
                    className="ghost-button justify-self-start lg:justify-self-end"
                  >
                    {t("editEntry", language)}
                  </button>
                ) : (
                  <span />
                )}
              </div>

              {editingEntryId === entry.id ? (
                <form
                  onSubmit={(event) => handleSaveEdit(event, entry.id)}
                  className="mt-4 grid gap-3 rounded-xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <p className="eyebrow">{t("editEntry", language)}</p>
                  <label className="block">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {t("editStartLabel", language)}
                    </span>
                    <input
                      type="datetime-local"
                      value={editStartInput}
                      onChange={(event) =>
                        setEditStartInput(event.target.value)
                      }
                      autoFocus
                      className="field mt-1.5"
                      required
                    />
                  </label>

                  <label className="block">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {t("editDurationMinutesLabel", language)}
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={editDurationInput}
                      onChange={(event) =>
                        setEditDurationInput(event.target.value)
                      }
                      className="field mt-1.5"
                      required
                    />
                  </label>

                  {editError ? (
                    <p className="text-sm" style={{ color: "var(--danger)" }}>
                      {editError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="primary-button">
                      {t("save", language)}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="action-button"
                    >
                      {t("closeLabel", language)}
                    </button>
                  </div>
                </form>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

interface DetailProps {
  readonly label: string;
  readonly value: string;
  readonly helper: string;
}

function Detail({ label, value, helper }: DetailProps) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p
        className="mono-face mt-1 text-sm font-medium"
        style={{ color: "var(--text)" }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: "var(--text-subtle)" }}>
        {helper}
      </p>
    </div>
  );
}

export default HistoryPanel;
