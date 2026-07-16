import { useLanguage } from "../context/LanguageContext";
import { useTracker } from "../context/TrackerContext";
import {
  formatDateTime,
  formatDuration,
  getRoundedDurationMs,
} from "../lib/time";
import t from "../i18n";
import { PauseIcon, PlayIcon, StarIcon, StopIcon } from "./icons";

interface TimerWidgetProps {
  showFavorites?: boolean;
  showPaused?: boolean;
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
  } = useTracker();

  const isRunning = Boolean(activeSession);

  return (
    <section className="surface p-5 sm:p-6">
      {/* Active timer display */}
      <div
        className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "var(--border)",
          background: isRunning ? "var(--primary-soft)" : "var(--surface-2)",
        }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{
                background: isRunning
                  ? "var(--success-soft)"
                  : "var(--surface-3)",
                color: isRunning ? "var(--success)" : "var(--text-muted)",
              }}
            >
              <span
                className={`h-2 w-2 rounded-full ${isRunning ? "animate-pulse" : ""}`}
                style={{
                  background: isRunning
                    ? "var(--success)"
                    : "var(--text-subtle)",
                }}
              />
              {isRunning
                ? t("statusRunning", language)
                : t("nothingRunning", language)}
            </span>
          </div>
          <p
            className="mt-2 truncate text-base font-semibold"
            style={{ color: "var(--text)" }}
          >
            {isRunning ? activeSession?.taskName : t("whatWorkingOn", language)}
          </p>
          {isRunning && activeSession ? (
            <p
              className="mt-0.5 text-xs"
              style={{ color: "var(--text-subtle)" }}
            >
              {t("startedAt", language)}{" "}
              {formatDateTime(activeSession.createdTimestamp)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <span
            className="mono-face text-3xl font-semibold tabular-nums sm:text-4xl"
            style={{ color: "var(--text)" }}
          >
            {formatDuration(
              getRoundedDurationMs(
                elapsedMs,
                roundingConfig.enabled,
                roundingConfig.intervalMinutes,
              ),
            )}
          </span>
          {isRunning ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePause}
                className="action-button"
                aria-label={t("pauseTimer", language)}
              >
                <PauseIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="danger-button"
                aria-label={t("stopAndSave", language)}
              >
                <StopIcon className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Start controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="eyebrow">{t("taskName", language)}</span>
          <input
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && taskName.trim()) handleStart();
            }}
            placeholder={t("placeholderTask", language)}
            className="field mt-1.5"
          />
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleFavorite(taskName)}
            disabled={taskName.trim().length === 0}
            className="action-button"
            aria-label={
              isFavorite(taskName)
                ? t("removeFromFavorites", language)
                : t("addToFavorites", language)
            }
          >
            <StarIcon
              className="h-4 w-4"
              filled={isFavorite(taskName)}
              style={{
                color: isFavorite(taskName) ? "var(--warning)" : undefined,
              }}
            />
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={taskName.trim().length === 0}
            className="primary-button"
          >
            <PlayIcon className="h-4 w-4" />
            {t("startTimer", language)}
          </button>
        </div>
      </div>

      {/* Quick-start favorites */}
      {showFavorites && favorites.length > 0 ? (
        <div className="mt-5">
          <p className="eyebrow mb-2">{t("quickStart", language)}</p>
          <div className="flex flex-wrap gap-2">
            {favorites.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() =>
                  handleQuickStart(name, selectedTagId ?? undefined)
                }
                className="chip transition hover:border-[var(--border-strong)]"
                style={{ color: "var(--text)" }}
              >
                <StarIcon
                  className="h-3.5 w-3.5"
                  filled
                  style={{ color: "var(--warning)" }}
                />
                <span className="max-w-[12rem] truncate">{name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Paused sessions */}
      {showPaused && pausedSessions.length > 0 ? (
        <div className="mt-5">
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
                    {formatDuration(
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
                    {t("stopAndSave", language)}
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
