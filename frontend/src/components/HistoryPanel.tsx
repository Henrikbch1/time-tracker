import { useState, type FormEvent } from "react";
import { type HistoryEntry, type Tag, type Language } from "../lib/cookies";
import {
  formatDateTime,
  formatDuration,
  formatShortDate,
  formatTime,
} from "../lib/time";
import t from "../i18n";

interface HistoryPanelProps {
  readonly history: HistoryEntry[];
  readonly totalTrackedMs: number;
  readonly tags?: Tag[];
  readonly onExport: () => void;
  readonly onUpdateEntry: (
    entryId: string,
    payload: { startTimestamp: number; durationMs: number },
  ) => void;
  readonly language: Language;
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
      className="ml-2 inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium"
      style={{ border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          background: tag?.color ?? "transparent",
        }}
        className="inline-block rounded-full"
      />
      <span className="truncate max-w-[8rem] block">
        {tag?.name ?? t("deletedLabel", language)}
      </span>
    </span>
  );
}

export function HistoryPanel({
  history,
  totalTrackedMs,
  tags = [],
  onExport,
  onUpdateEntry,
  language,
}: HistoryPanelProps) {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editStartInput, setEditStartInput] = useState("");
  const [editDurationInput, setEditDurationInput] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleStartEdit = (entry: HistoryEntry) => {
    setEditingEntryId(entry.id);
    setEditStartInput(toDateTimeLocalValue(entry.startTimestamp));
    setEditDurationInput(String(Math.max(1, Math.round(entry.durationMs / 60_000))));
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditStartInput("");
    setEditDurationInput("");
    setEditError(null);
  };

  const handleSaveEdit = (event: FormEvent<HTMLFormElement>, entryId: string) => {
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
    <section className="surface mt-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{t("taskHistory", language)}</p>
          <h2 className="display-face mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-white">
            {t("exportableCompact", language)}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            {t("completedSessionsParagraph", language)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="surface-muted px-4 py-3 text-left">
            <p className="eyebrow">{t("storedTotal", language)}</p>
            <p className="mono-face mt-2 text-lg font-medium text-slate-950 dark:text-white">
              {formatDuration(totalTrackedMs)}
            </p>
          </div>
          <button
            type="button"
            onClick={onExport}
            disabled={history.length === 0}
            className="action-button disabled:cursor-not-allowed disabled:opacity-55"
          >
            {t("exportHistory", language)}
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="surface-muted mt-8 flex min-h-56 items-center justify-center px-6 py-10 text-center">
          <div className="max-w-md">
            <p className="display-face text-2xl font-semibold text-slate-950 dark:text-white">
              {t("noSessionsSaved", language)}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {t("finishATaskParagraph", language)}
            </p>
          </div>
        </div>
      ) : (
        <ol className="mt-8 grid gap-4">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="surface-muted grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.8fr))] lg:items-center"
            >
              <div>
                <p className="display-face text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-3">
                  <span className="min-w-0 truncate">{entry.taskName}</span>
                  {entry.tagId ? (
                    <TagBadge tagId={entry.tagId} tags={tags} language={language} />
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {t("finishedAt", language)}{" "}
                  {formatDateTime(entry.endTimestamp)}
                </p>
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
                value={formatDuration(entry.durationMs)}
                helper={t("savedToCookieHistory", language)}
              />

              {editingEntryId !== entry.id ? (
                <div className="lg:col-span-4 flex justify-start">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(entry)}
                    disabled={editingEntryId !== null}
                    className="action-button disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {t("editEntry", language)}
                  </button>
                </div>
              ) : null}

              {editingEntryId === entry.id ? (
                <form
                  onSubmit={(event) => handleSaveEdit(event, entry.id)}
                  className="surface lg:col-span-4 grid gap-3 rounded-2xl border border-slate-300/70 px-4 py-4 dark:border-white/10"
                >
                  <p className="eyebrow">{t("editEntry", language)}</p>
                  <label className="block">
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {t("editStartLabel", language)}
                    </span>
                    <input
                      type="datetime-local"
                      value={editStartInput}
                      onChange={(event) => setEditStartInput(event.target.value)}
                      autoFocus
                      className="mt-2 w-full rounded-xl border border-slate-300/70 bg-white/85 px-3 py-2 text-slate-900 outline-none dark:border-white/20 dark:bg-slate-800 dark:text-slate-100"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {t("editDurationMinutesLabel", language)}
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={editDurationInput}
                      onChange={(event) => setEditDurationInput(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300/70 bg-white/85 px-3 py-2 text-slate-900 outline-none dark:border-white/20 dark:bg-slate-800 dark:text-slate-100"
                      required
                    />
                  </label>

                  {editError ? (
                    <p className="text-sm text-rose-600 dark:text-rose-400">{editError}</p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
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
      <p className="mono-face mt-2 text-lg font-medium text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {helper}
      </p>
    </div>
  );
}
