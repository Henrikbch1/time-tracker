import { useEffect, useState } from 'react'
import { HistoryPanel } from './components/HistoryPanel'
// Theme and language toggles moved to Settings
import { TrackerCard } from './components/TrackerCard'
import TagSummary from './components/TagSummary'
import PieByTask from './components/PieByTask'
import TimeByDay from './components/TimeByDay'
import Settings from './components/Settings'
import { useInterval } from './hooks/useInterval'
import {
  clearActiveSession,
  limitHistoryEntries,
  readActiveSession,
  readHistory,
  readTags,
  readTheme,
  type ActiveSession,
  type HistoryEntry,
  type Tag,
  type ThemeMode,
  writeActiveSession,
  writeHistory,
  writeTheme,
  writeTags,
  readLanguage,
  readDailyGoal,
  readWorkdays,
  writeLanguage,
} from './utils/cookies'
import t from './i18n'
import { downloadHistory } from './utils/export'
import { formatDateTime, formatDuration, getElapsedDuration } from './utils/time'

const DAY_IN_MS = 86_400_000

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialState() {
  const restoredSession = readActiveSession()

  return {
    theme: readTheme() ?? getSystemTheme(),
    language: readLanguage() ?? 'en',
    taskName: restoredSession?.taskName ?? '',
    activeSession: restoredSession,
    history: readHistory(),
    tags: readTags(),
    dailyGoalHours: readDailyGoal() ?? 8,
    workdays: readWorkdays(),
    now: Date.now(),
  }
}

function App() {
  const [initialState] = useState(getInitialState)
  const [theme, setTheme] = useState<ThemeMode>(initialState.theme)
  const [language, setLanguage] = useState(initialState.language)
  const [taskName, setTaskName] = useState(initialState.taskName)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(initialState.activeSession)
  const [history, setHistory] = useState<HistoryEntry[]>(initialState.history)
  const [tags, setTags] = useState<Tag[]>(initialState.tags ?? [])
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [now, setNow] = useState(initialState.now)
  const [route, setRoute] = useState<string>(typeof window !== 'undefined' && window.location.pathname === '/settings' ? 'settings' : 'home')
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(initialState.dailyGoalHours)
  const [workdays, setWorkdays] = useState(initialState.workdays)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme

    writeTheme(theme)
  }, [theme])

  useEffect(() => {
    if (language) {
      document.documentElement.lang = language
      // persist selection in cookies
      writeLanguage(language)
    }
  }, [language])

  useEffect(() => {
    if (activeSession) {
      writeActiveSession(activeSession)
      return
    }

    clearActiveSession()
  }, [activeSession])

  useEffect(() => {
    writeTags(tags)
  }, [tags])

  useEffect(() => {
    writeHistory(history)
  }, [history])

  useInterval(
    () => {
      setNow(Date.now())
    },
    activeSession ? 250 : null,
  )

  // Navigation handlers: support /settings deep-link
  const openSettings = () => {
    setRoute('settings')
    try {
      window.history.pushState({}, '', '/settings')
    } catch (e) {
      /* ignore */
    }
  }

  const closeSettings = () => {
    setRoute('home')
    try {
      window.history.pushState({}, '', '/')
    } catch (e) {
      /* ignore */
    }
  }

  // handle browser back/forward
  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname === '/settings' ? 'settings' : 'home')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const elapsedMs = activeSession ? getElapsedDuration(activeSession.startTimestamp, now) : 0
  const totalTrackedMs = history.reduce((total, entry) => total + entry.durationMs, 0)
  const totalsByTag = history.reduce((map: Record<string, number>, entry) => {
    if (entry.tagId) {
      map[entry.tagId] = (map[entry.tagId] || 0) + entry.durationMs
    }

    return map
  }, {})
  const totalsByTask = history.reduce((map: Record<string, number>, entry) => {
    map[entry.taskName] = (map[entry.taskName] || 0) + entry.durationMs
    return map
  }, {} as Record<string, number>)

  // include currently running session time in the totals
  if (activeSession) {
    totalsByTask[activeSession.taskName] = (totalsByTask[activeSession.taskName] || 0) + elapsedMs
  }
  const completedToday = history.filter(
    (entry) => now - entry.endTimestamp >= 0 && now - entry.endTimestamp < DAY_IN_MS,
  ).length
  const latestEntry = history[0] ?? null

  const handleStart = () => {
    const normalizedTaskName = taskName.trim()

    if (!normalizedTaskName) {
      return
    }

    const startTimestamp = Date.now()
    setTaskName(normalizedTaskName)
    setNow(startTimestamp)
    setActiveSession({
      taskName: normalizedTaskName,
      startTimestamp,
      tagId: selectedTagId ?? undefined,
    })
  }

  const handleStop = () => {
    if (!activeSession) {
      return
    }

    const endTimestamp = Date.now()
    const nextEntry: HistoryEntry = {
      id: `${activeSession.startTimestamp}-${endTimestamp}`,
      taskName: activeSession.taskName,
      startTimestamp: activeSession.startTimestamp,
      endTimestamp,
      durationMs: getElapsedDuration(activeSession.startTimestamp, endTimestamp),
      tagId: activeSession.tagId,
    }

    setHistory((currentHistory) => limitHistoryEntries([nextEntry, ...currentHistory]))
    setActiveSession(null)
    setTaskName('')
    setNow(endTimestamp)
  }

  const handleExport = () => {
    if (history.length === 0) {
      return
    }

    downloadHistory(history, tags, language)
  }

  const handleClearHistory = () => {
    if (history.length === 0) {
      return
    }

    const confirmed = window.confirm(t('confirmDeleteHistory', language))

    if (!confirmed) {
      return
    }

    setHistory([])
  }

  if (route === 'settings') {
    return (
      <div className="relative isolate overflow-hidden">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <Settings
            theme={theme}
            setTheme={(m) => setTheme(m)}
            language={language}
            setLanguage={(l) => setLanguage(l)}
            tags={tags}
            setTags={setTags}
            onClose={closeSettings}
            dailyGoalHours={dailyGoalHours}
            setDailyGoalHours={setDailyGoalHours}
            workdays={workdays}
            setWorkdays={setWorkdays}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.30),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.16),transparent_52%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-36 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute right-[-6rem] top-24 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="surface mb-6 flex flex-col gap-6 px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
            <p className="eyebrow">{t('eyebrow', language)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="display-face text-4xl font-semibold tracking-[-0.08em] text-slate-950 dark:text-white sm:text-5xl">
                Hookie
              </span>
              <span className="rounded-full border border-slate-300/70 bg-white/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
                {t('cookieState', language)}
              </span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              {t('introParagraph', language)}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <div className="flex gap-3">
              <button type="button" onClick={openSettings} className="action-button">
                {t('settings', language)}
              </button>
            </div>
            <div className="surface-muted w-full min-w-72 px-4 py-4 text-left lg:max-w-sm">
              <p className="mono-face text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {t('lastCompleted', language)}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {latestEntry ? latestEntry.taskName : t('noCompleted', language)}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {latestEntry
                  ? `${formatDuration(latestEntry.durationMs)} ${t('finishedAt', language)} ${formatDateTime(latestEntry.endTimestamp)}`
                  : t('startFirst', language)}
              </p>
            </div>
          </div>
        </header>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
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

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <article className="stat-tile">
              <p className="eyebrow">{t('completedSessions', language)}</p>
              <p className="display-face mt-5 text-4xl font-semibold text-slate-950 dark:text-white">
                {history.length}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t('completedSessionsDesc', language)}
              </p>
            </article>

            <article className="stat-tile">
              <p className="eyebrow">{t('trackedTime', language)}</p>
              <p className="display-face mt-5 text-4xl font-semibold text-slate-950 dark:text-white">
                {formatDuration(totalTrackedMs)}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t('trackedTimeDesc', language)}
              </p>
            </article>

            <article className="stat-tile">
              <p className="eyebrow">{t('closedToday', language)}</p>
              <p className="display-face mt-5 text-4xl font-semibold text-slate-950 dark:text-white">
                {completedToday}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t('closedTodayDesc', language)}
              </p>
            </article>
          </div>
          <div className="xl:col-span-2">
            <TagSummary tags={tags} totalsByTag={totalsByTag} language={language} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:col-span-2 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <PieByTask totalsByTask={totalsByTask} totalMs={totalTrackedMs + (activeSession ? elapsedMs : 0)} language={language} />
            <TimeByDay history={history} now={now} language={language} activeSession={activeSession} elapsedMs={elapsedMs} workdays={workdays} />
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
  )
}

export default App
