import { useNavigate } from "react-router-dom";
import { HistoryPanel } from "../components/HistoryPanel";
import { TrackerCard } from "../components/TrackerCard";
import TagSummary from "../components/TagSummary";
import PieByTask from "../components/PieByTask";
import TimeByDay from "../components/TimeByDay";
import { useTracker } from "../context/TrackerContext";
import { useLanguage } from "../context/LanguageContext";
import { formatDateTime, formatDuration } from "../lib/time";
import t from "../i18n";

export default function HomePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    taskName,
    setTaskName,
    activeSession,
    history,
    tags,
    setSelectedTagId,
    selectedTagId,
    now,
    dailyGoalHours: _dailyGoalHours,
    workdays,
    elapsedMs,
    totalTrackedMs,
    totalsByTag,
    totalsByTask,
    completedToday,
    latestEntry,
    handleStart,
    handleStop,
    handleExport,
    handleClearHistory,
  } = useTracker();

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.30),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.16),transparent_52%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-36 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute right-[-6rem] top-24 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="surface mb-6 flex flex-col gap-6 px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("eyebrow", language)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="display-face text-4xl font-semibold tracking-[-0.08em] text-slate-950 dark:text-white sm:text-5xl">
                Hookie
              </span>
              <span className="rounded-full border border-slate-300/70 bg-white/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
                {t("cookieState", language)}
              </span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              {t("introParagraph", language)}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="action-button"
              >
                {t("settings", language)}
              </button>
            </div>
            <div className="surface-muted w-full min-w-0 px-4 py-4 text-left lg:max-w-sm">
              <p className="mono-face text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {t("lastCompleted", language)}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {latestEntry
                  ? latestEntry.taskName
                  : t("noCompleted", language)}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {latestEntry
                  ? `${formatDuration(latestEntry.durationMs)} ${t("finishedAt", language)} ${formatDateTime(latestEntry.endTimestamp)}`
                  : t("startFirst", language)}
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <TrackerCard
            taskName={taskName}
            isRunning={Boolean(activeSession)}
            elapsedMs={elapsedMs}
            startTimestamp={activeSession?.startTimestamp}
            onTaskNameChange={setTaskName}
            onStart={handleStart}
            onStop={handleStop}
            tags={tags}
            selectedTagId={selectedTagId}
            onSelectTag={setSelectedTagId}
            language={language}
          />

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1 min-w-0">
            <article className="stat-tile">
              <p className="eyebrow">{t("completedSessions", language)}</p>
              <p className="display-face mt-5 text-4xl font-semibold text-slate-950 dark:text-white">
                {history.length}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t("completedSessionsDesc", language)}
              </p>
            </article>

            <article className="stat-tile">
              <p className="eyebrow">{t("trackedTime", language)}</p>
              <p className="display-face mt-5 text-4xl font-semibold text-slate-950 dark:text-white">
                {formatDuration(totalTrackedMs)}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t("trackedTimeDesc", language)}
              </p>
            </article>

            <article className="stat-tile">
              <p className="eyebrow">{t("closedToday", language)}</p>
              <p className="display-face mt-5 text-4xl font-semibold text-slate-950 dark:text-white">
                {completedToday}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t("closedTodayDesc", language)}
              </p>
            </article>
          </div>

          <div className="xl:col-span-2 min-w-0">
            <TagSummary
              tags={tags}
              totalsByTag={totalsByTag}
              language={language}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:col-span-2 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] min-w-0">
            <PieByTask
              totalsByTask={totalsByTask}
              totalMs={totalTrackedMs + (activeSession ? elapsedMs : 0)}
              language={language}
            />
            <TimeByDay
              history={history}
              now={now}
              language={language}
              activeSession={activeSession}
              elapsedMs={elapsedMs}
              workdays={workdays}
            />
          </div>
        </section>

        <HistoryPanel
          history={history}
          totalTrackedMs={totalTrackedMs}
          tags={tags}
          onExport={handleExport}
          onClear={handleClearHistory}
          language={language}
        />
      </main>
    </div>
  );
}
