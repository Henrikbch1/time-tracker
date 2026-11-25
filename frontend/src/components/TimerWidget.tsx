import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTracker } from "../context/TrackerContext";
import { formatDuration, formatTime, getRoundedDurationMs } from "../lib/time";
import { formatHM } from "../lib/overtime";
import t from "../i18n";
import { PauseIcon, PlayIcon, StarIcon, StopIcon } from "./icons";

interface TimerWidgetProps {
  showFavorites?: boolean;
  showPaused?: boolean;
}

interface QuickTask {
  name: string;
  tagId?: string;
  favorite: boolean;
}

export function TimerWidget({
  showFavorites = true,
  showPaused = true,
}: TimerWidgetProps) {
  const { language } = useLanguage();
  const {
    taskName,
    setTaskName,
    activeSession,
    pausedSessions,
    history,
    elapsedMs,
    roundingConfig,
    tags,
    selectedTagId,
    setSelectedTagId,
    favorites,
    isFavorite,
    toggleFavorite,
    handleStart,
    handleQuickStart,
    handlePause,
    handleStop,
    handleResumePaused,
    handleStopPaused,
    lastStoppedEntry,
    undoLastStop,
    dismissLastStop,
  } = useTracker();

  const isRunning = Boolean(activeSession);
  const [formExpanded, setFormExpanded] = useState(false);
  const showForm = !isRunning || formExpanded || taskName.length > 0;
  const activeTag = activeSession?.tagId
    ? tags.find((tag) => tag.id === activeSession.tagId)
    : undefined;

  // Auto-hide the undo toast after a few seconds.
  useEffect(() => {
    if (!lastStoppedEntry) return;
    const id = window.setTimeout(dismissLastStop, 8000);
    return () => window.clearTimeout(id);
  }, [lastStoppedEntry, dismissLastStop]);

  // Favorites first, then the most recently used tasks (with their tag).
  const quickTasks = useMemo<QuickTask[]>(() => {
    const seen = new Set<string>();
    const list: QuickTask[] = [];
    const lastTagFor = (name: string) =>
      history.find((entry) => entry.taskName === name)?.tagId;
    for (const name of favorites) {
      seen.add(name);
      list.push({ name, tagId: lastTagFor(name), favorite: true });
    }
    for (const entry of history) {
      if (list.length >= 8) break;
      if (seen.has(entry.taskName)) continue;
      if (activeSession?.taskName === entry.taskName) continue;
      seen.add(entry.taskName);
      list.push({ name: entry.taskName, tagId: entry.tagId, favorite: false });
    }
    return list;
  }, [favorites, history, activeSession]);

  const knownTaskNames = useMemo(
    () => [...new Set(history.map((entry) => entry.taskName))].slice(0, 50),
    [history],
  );

  const roundedElapsed = getRoundedDurationMs(
    elapsedMs,
    roundingConfig.enabled,
    roundingConfig.intervalMinutes,
  );

  const handleTaskNameChange = (value: string) => {
    setTaskName(value);
    // Picking a known task from the suggestions pre-selects its last tag.
    const match = history.find((entry) => entry.taskName === value);
    if (match?.tagId && !selectedTagId) setSelectedTagId(match.tagId);
  };

  return (
    <section className="surface flex flex-col gap-5 p-5 sm:p-6">
      {/* Running timer */}
      {isRunning && activeSession ? (
        <div
          className="rounded-2xl border p-5"
          style={{
            borderColor: "color-mix(in srgb, var(--success) 35%, transparent)",
            background: "var(--success-soft)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 animate-pulse rounded-full"
              style={{ background: "var(--success)" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--success)" }}
            >
              {t("statusRunning", language)} · {t("startedAt", language)}{" "}
              {formatTime(activeSession.createdTimestamp)}
            </span>
          </div>
          <p
            className="mt-2 truncate text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {activeSession.taskName}
          </p>
          {activeTag ? (
            <p
              className="mt-0.5 flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: activeTag.color ?? "var(--border-strong)",
                }}
              />
              {activeTag.name}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="mono-face text-4xl font-semibold tabular-nums sm:text-5xl"
                style={{ color: "var(--text)" }}
              >
                {formatDuration(elapsedMs)}
              </p>
              {roundingConfig.enabled ? (
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("roundedLabel", language)}: {formatHM(roundedElapsed)}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={handlePause}
                className="action-button py-3 sm:py-2.5"
              >
                <PauseIcon className="h-4 w-4" />
                {t("pauseShort", language)}
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="danger-button py-3 sm:py-2.5"
              >
                <StopIcon className="h-4 w-4" />
                {t("stopShort", language)}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Undo after stopping */}
      {lastStoppedEntry ? (
        <div
          className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
          role="status"
        >
          <span className="min-w-0 truncate" style={{ color: "var(--text)" }}>
            ✓ {t("savedEntry", language)}:{" "}
            <strong className="font-semibold">
              {lastStoppedEntry.taskName}
            </strong>{" "}
            <span className="mono-face" style={{ color: "var(--text-muted)" }}>
              (
              {formatHM(
                getRoundedDurationMs(
                  lastStoppedEntry.durationMs,
                  roundingConfig.enabled,
                  roundingConfig.intervalMinutes,
                ),
              )}
              )
            </span>
          </span>
          <button
            type="button"
            onClick={undoLastStop}
            className="shrink-0 text-sm font-semibold"
            style={{ color: "var(--primary)" }}
          >
            {t("undo", language)}
          </button>
        </div>
      ) : null}

      {/* Start form (collapsed while a timer runs to keep focus on it) */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setFormExpanded(true)}
          className="action-button self-start"
        >
          <PlayIcon className="h-3.5 w-3.5" />
          {t("startOtherTask", language)}
        </button>
      ) : null}
      {showForm ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (taskName.trim()) handleStart();
          }}
        >
          {!isRunning ? (
            <p
              className="display-face text-lg font-semibold"
              style={{ color: "var(--text)" }}
            >
              {t("whatWorkingOn", language)}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className="eyebrow">{t("taskName", language)}</span>
              <div className="relative mt-1.5">
                <input
                  value={taskName}
                  onChange={(event) => handleTaskNameChange(event.target.value)}
                  placeholder={t("placeholderTask", language)}
                  className="field pr-11"
                  list="known-task-names"
                  enterKeyHint="go"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => toggleFavorite(taskName)}
                  disabled={taskName.trim().length === 0}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 transition disabled:opacity-30"
                  aria-label={
                    isFavorite(taskName)
                      ? t("removeFromFavorites", language)
                      : t("addToFavorites", language)
                  }
                  title={
                    isFavorite(taskName)
                      ? t("removeFromFavorites", language)
                      : t("addToFavorites", language)
                  }
                >
                  <StarIcon
                    className="h-4 w-4"
                    filled={isFavorite(taskName)}
                    style={{
                      color: isFavorite(taskName)
                        ? "var(--warning)"
                        : "var(--text-subtle)",
                    }}
                  />
                </button>
              </div>
              <datalist id="known-task-names">
                {knownTaskNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
            <label className="block sm:w-44">
              <span className="eyebrow">{t("tagLabel", language)}</span>
              <select
                value={selectedTagId ?? ""}
                onChange={(event) =>
                  setSelectedTagId(
                    event.target.value === "" ? null : event.target.value,
                  )
                }
                className="field mt-1.5"
              >
                <option value="">{t("noTag", language)}</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={taskName.trim().length === 0}
              className="primary-button py-3 sm:py-2.5"
            >
              <PlayIcon className="h-4 w-4" />
              {t("startTimer", language)}
            </button>
          </div>
          {isRunning ? (
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
              {t("switchTaskHint", language)}
            </p>
          ) : null}
        </form>
      ) : null}

      {/* Quick start: favorites + recent tasks */}
      {showFavorites && quickTasks.length > 0 ? (
        <div>
          <p className="eyebrow mb-2">{t("quickStart", language)}</p>
          <div className="flex flex-wrap gap-2">
            {quickTasks.map((task) => {
              const tag = task.tagId
                ? tags.find((item) => item.id === task.tagId)
                : undefined;
              return (
                <button
                  key={task.name}
                  type="button"
                  onClick={() =>
                    handleQuickStart(
                      task.name,
                      task.tagId ?? selectedTagId ?? undefined,
                    )
                  }
                  className="chip py-1.5 transition hover:border-[var(--border-strong)]"
                  style={{ color: "var(--text)" }}
                >
                  {task.favorite ? (
                    <StarIcon
                      className="h-3.5 w-3.5"
                      filled
                      style={{ color: "var(--warning)" }}
                    />
                  ) : (
                    <PlayIcon
                      className="h-3 w-3"
                      style={{ color: "var(--text-subtle)" }}
                    />
                  )}
                  <span className="max-w-[12rem] truncate">{task.name}</span>
                  {tag ? (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: tag.color ?? "var(--border-strong)",
                      }}
                      title={tag.name}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Paused sessions */}
      {showPaused && pausedSessions.length > 0 ? (
        <div>
          <p className="eyebrow mb-2">{t("pausedTasksTitle", language)}</p>
          <div className="grid gap-2">
            {pausedSessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {session.taskName}
                  </p>
                  <p
                    className="mono-face text-xs"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {formatHM(
                      getRoundedDurationMs(
                        session.accumulatedMs,
                        roundingConfig.enabled,
                        roundingConfig.intervalMinutes,
                      ),
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleResumePaused(session.sessionId)}
                    className="action-button"
                  >
                    <PlayIcon className="h-3.5 w-3.5" />
                    {t("resumeTimer", language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStopPaused(session.sessionId)}
                    className="ghost-button"
                  >
                    <StopIcon className="h-3.5 w-3.5" />
                    {t("stopShort", language)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TimerWidget;
