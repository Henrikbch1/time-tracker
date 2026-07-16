import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearActiveSession,
  readActiveSession,
  readHistory,
  readPausedSessions,
  readTags,
  readDailyGoal,
  readWorkdays,
  readFavorites,
  writeFavorites,
  readRoundingConfig,
  writeRoundingConfig,
  readExportConfig,
  writeExportConfig,
  type ActiveSession,
  type HistoryEntry,
  type Tag,
  type RoundingConfig,
  type ExportConfig,
  writeActiveSession,
  writeHistory,
  writePausedSessions,
  writeTags,
} from "../lib/cookies";
import { useLanguage } from "./LanguageContext";
import { useInterval } from "../hooks/useInterval";
import { downloadHistory } from "../lib/export";
import { getElapsedDuration, getRoundedDurationMs } from "../lib/time";
import { formatLocalYMD } from "../lib/date";
import { startOfMonth, startOfWeek } from "../lib/stats";
import t from "../i18n";

type WorkdaysMap = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  number
>;

interface TrackerContextValue {
  taskName: string;
  setTaskName: (name: string) => void;
  activeSession: ActiveSession | null;
  pausedSessions: ActiveSession[];
  history: HistoryEntry[];
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  selectedTagId: string | null;
  setSelectedTagId: (id: string | null) => void;
  now: number;
  dailyGoalHours: number;
  setDailyGoalHours: (n: number) => void;
  workdays: WorkdaysMap;
  setWorkdays: (m: WorkdaysMap) => void;
  roundingConfig: RoundingConfig;
  setRoundingConfig: (config: RoundingConfig) => void;
  exportConfig: ExportConfig;
  setExportConfig: (config: ExportConfig) => void;
  elapsedMs: number;
  totalTrackedMs: number;
  totalsByTag: Record<string, number>;
  totalsByTask: Record<string, number>;
  todayTrackedMs: number;
  weekTrackedMs: number;
  monthTrackedMs: number;
  totalsByTaskToday: Record<string, number>;
  completedToday: number;
  latestEntry: HistoryEntry | null;
  favorites: string[];
  toggleFavorite: (taskName: string) => void;
  isFavorite: (taskName: string) => boolean;
  handleStart: () => void;
  handleQuickStart: (name: string, tagId?: string) => void;
  handlePause: () => void;
  handleResumePaused: (sessionId: string) => void;
  handleStopPaused: (sessionId: string) => void;
  handleStop: () => void;
  handleExport: () => void;
  handleClearHistory: () => void;
  handleUpdateHistoryEntry: (
    entryId: string,
    payload: { startTimestamp: number; durationMs: number },
  ) => void;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

function getInitialState() {
  const restoredSession = readActiveSession();
  const restoredPaused = readPausedSessions();
  const history = readHistory();

  const alreadyCompleted =
    restoredSession != null &&
    history.some(
      (entry) => entry.startTimestamp === restoredSession.createdTimestamp,
    );

  if (alreadyCompleted) {
    clearActiveSession();
  }

  const activeSession = alreadyCompleted ? null : restoredSession;

  return {
    taskName: activeSession?.taskName ?? "",
    activeSession,
    pausedSessions: restoredPaused,
    history,
    tags: readTags() ?? [],
    favorites: readFavorites(),
    dailyGoalHours: readDailyGoal() ?? 8,
    workdays: readWorkdays(),
    roundingConfig: readRoundingConfig(),
    exportConfig: readExportConfig(),
    now: Date.now(),
  };
}

function getSessionElapsedMs(session: ActiveSession, currentTimestamp: number) {
  const base = Math.max(0, Math.floor(session.accumulatedMs));

  if (session.isPaused) {
    return base;
  }

  const segmentStart =
    session.segmentStartTimestamp ?? session.createdTimestamp;

  return base + getElapsedDuration(segmentStart, currentTimestamp);
}

function toPausedSession(
  session: ActiveSession,
  pausedAtTimestamp: number,
): ActiveSession {
  return {
    ...session,
    accumulatedMs: getSessionElapsedMs(session, pausedAtTimestamp),
    isPaused: true,
    segmentStartTimestamp: undefined,
    pausedAtTimestamp,
  };
}

export function TrackerProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { language } = useLanguage();
  const [initial] = useState(getInitialState);
  const [taskName, setTaskName] = useState(initial.taskName);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    initial.activeSession,
  );
  const [pausedSessions, setPausedSessions] = useState<ActiveSession[]>(
    initial.pausedSessions,
  );
  const [history, setHistory] = useState<HistoryEntry[]>(initial.history);
  const [tags, setTags] = useState<Tag[]>(initial.tags);
  const [favorites, setFavorites] = useState<string[]>(initial.favorites);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [now, setNow] = useState(initial.now);
  const [dailyGoalHours, setDailyGoalHours] = useState(initial.dailyGoalHours);
  const [workdays, setWorkdays] = useState<WorkdaysMap>(initial.workdays);
  const [roundingConfig, setRoundingConfig] = useState<RoundingConfig>(
    initial.roundingConfig,
  );
  const [exportConfig, setExportConfig] = useState<ExportConfig>(
    initial.exportConfig,
  );

  const roundDurationForDisplay = useCallback(
    (durationMs: number) =>
      getRoundedDurationMs(
        durationMs,
        roundingConfig.enabled,
        roundingConfig.intervalMinutes,
      ),
    [roundingConfig.enabled, roundingConfig.intervalMinutes],
  );

  useEffect(() => {
    if (activeSession) {
      writeActiveSession(activeSession);
    } else {
      clearActiveSession();
    }
  }, [activeSession]);

  useEffect(() => {
    writePausedSessions(pausedSessions);
  }, [pausedSessions]);

  useEffect(() => {
    writeTags(tags);
  }, [tags]);
  useEffect(() => {
    writeHistory(history);
  }, [history]);
  useEffect(() => {
    writeFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    writeRoundingConfig(roundingConfig);
  }, [roundingConfig]);

  useEffect(() => {
    writeExportConfig(exportConfig);
  }, [exportConfig]);

  useInterval(
    () => {
      setNow(Date.now());
    },
    activeSession ? 250 : null,
  );

  const elapsedMs = activeSession ? getSessionElapsedMs(activeSession, now) : 0;
  const totalTrackedMs = history.reduce(
    (total, entry) => total + roundDurationForDisplay(entry.durationMs),
    0,
  );
  const todayKey = formatLocalYMD(now);

  const totalsByTag = useMemo(
    () =>
      history.reduce((map: Record<string, number>, entry) => {
        if (entry.tagId)
          map[entry.tagId] =
            (map[entry.tagId] || 0) + roundDurationForDisplay(entry.durationMs);
        return map;
      }, {}),
    [history, roundDurationForDisplay],
  );

  const totalsByTask = useMemo(() => {
    const map = history.reduce((acc: Record<string, number>, entry) => {
      acc[entry.taskName] =
        (acc[entry.taskName] || 0) + roundDurationForDisplay(entry.durationMs);
      return acc;
    }, {});

    for (const paused of pausedSessions) {
      map[paused.taskName] =
        (map[paused.taskName] || 0) +
        roundDurationForDisplay(Math.max(0, Math.floor(paused.accumulatedMs)));
    }

    if (activeSession) {
      map[activeSession.taskName] =
        (map[activeSession.taskName] || 0) + roundDurationForDisplay(elapsedMs);
    }
    return map;
  }, [
    history,
    pausedSessions,
    activeSession,
    elapsedMs,
    roundDurationForDisplay,
  ]);

  const { todayTrackedMs, totalsByTaskToday } = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;

    for (const entry of history) {
      if (formatLocalYMD(entry.endTimestamp) !== todayKey) continue;
      const roundedDuration = roundDurationForDisplay(entry.durationMs);
      map[entry.taskName] = (map[entry.taskName] || 0) + roundedDuration;
      total += roundedDuration;
    }

    if (
      activeSession &&
      formatLocalYMD(activeSession.createdTimestamp) === todayKey
    ) {
      map[activeSession.taskName] =
        (map[activeSession.taskName] || 0) + roundDurationForDisplay(elapsedMs);
      total += roundDurationForDisplay(elapsedMs);
    }

    return { todayTrackedMs: total, totalsByTaskToday: map };
  }, [history, activeSession, elapsedMs, todayKey, roundDurationForDisplay]);

  const completedToday = useMemo(
    () =>
      history.filter((e) => formatLocalYMD(e.endTimestamp) === todayKey).length,
    [history, todayKey],
  );
  const latestEntry = useMemo(() => history[0] ?? null, [history]);

  const weekTrackedMs = useMemo(() => {
    const weekStart = startOfWeek(now);
    let total = history.reduce((acc, entry) => {
      if (entry.endTimestamp < weekStart || entry.endTimestamp >= now + 1) {
        return acc;
      }
      return acc + roundDurationForDisplay(entry.durationMs);
    }, 0);
    if (activeSession && activeSession.createdTimestamp >= weekStart) {
      total += roundDurationForDisplay(elapsedMs);
    }
    return total;
  }, [history, activeSession, elapsedMs, now, roundDurationForDisplay]);

  const monthTrackedMs = useMemo(() => {
    const monthStart = startOfMonth(now);
    let total = history.reduce((acc, entry) => {
      if (entry.endTimestamp < monthStart || entry.endTimestamp >= now + 1) {
        return acc;
      }
      return acc + roundDurationForDisplay(entry.durationMs);
    }, 0);
    if (activeSession && activeSession.createdTimestamp >= monthStart) {
      total += roundDurationForDisplay(elapsedMs);
    }
    return total;
  }, [history, activeSession, elapsedMs, now, roundDurationForDisplay]);

  const toggleFavorite = useCallback((taskName: string) => {
    const normalized = taskName.trim();
    if (!normalized) return;
    setFavorites((prev) =>
      prev.includes(normalized)
        ? prev.filter((name) => name !== normalized)
        : [normalized, ...prev].slice(0, 12),
    );
  }, []);

  const isFavorite = useCallback(
    (taskName: string) => favorites.includes(taskName.trim()),
    [favorites],
  );

  const handleStart = useCallback(() => {
    const normalized = taskName.trim();
    if (!normalized) return;
    const startedAt = Date.now();

    if (activeSession) {
      setPausedSessions((prev) => [
        toPausedSession(activeSession, startedAt),
        ...prev,
      ]);
    }

    setTaskName("");
    setNow(startedAt);
    setActiveSession({
      sessionId: `${startedAt}-${Math.random().toString(36).slice(2, 8)}`,
      taskName: normalized,
      createdTimestamp: startedAt,
      accumulatedMs: 0,
      isPaused: false,
      segmentStartTimestamp: startedAt,
      tagId: selectedTagId ?? undefined,
    });
  }, [taskName, selectedTagId, activeSession]);

  const handleQuickStart = useCallback((name: string, tagId?: string) => {
    const normalized = name.trim();
    if (!normalized) return;
    const startedAt = Date.now();

    setActiveSession((current) => {
      if (current) {
        setPausedSessions((prev) => [
          toPausedSession(current, startedAt),
          ...prev,
        ]);
      }
      return {
        sessionId: `${startedAt}-${Math.random().toString(36).slice(2, 8)}`,
        taskName: normalized,
        createdTimestamp: startedAt,
        accumulatedMs: 0,
        isPaused: false,
        segmentStartTimestamp: startedAt,
        tagId: tagId ?? undefined,
      };
    });
    setTaskName("");
    setNow(startedAt);
  }, []);

  const handlePause = useCallback(() => {
    if (!activeSession) return;

    const pausedAt = Date.now();
    const paused = toPausedSession(activeSession, pausedAt);

    setPausedSessions((prev) => [paused, ...prev]);
    setActiveSession(null);
    setNow(pausedAt);
  }, [activeSession]);

  const handleResumePaused = useCallback(
    (sessionId: string) => {
      const resumedAt = Date.now();
      const target = pausedSessions.find(
        (session) => session.sessionId === sessionId,
      );
      if (!target) return;

      const remainingPaused = pausedSessions.filter(
        (session) => session.sessionId !== sessionId,
      );

      const nextPaused = activeSession
        ? [toPausedSession(activeSession, resumedAt), ...remainingPaused]
        : remainingPaused;

      setPausedSessions(nextPaused);
      setActiveSession({
        ...target,
        isPaused: false,
        pausedAtTimestamp: undefined,
        segmentStartTimestamp: resumedAt,
      });
      setTaskName("");
      setNow(resumedAt);
    },
    [pausedSessions, activeSession],
  );

  const handleStop = useCallback(() => {
    if (!activeSession) return;
    const endTimestamp = Date.now();
    const durationMs = getSessionElapsedMs(activeSession, endTimestamp);
    const nextEntry: HistoryEntry = {
      id: `${activeSession.sessionId}-${endTimestamp}`,
      taskName: activeSession.taskName,
      startTimestamp: activeSession.createdTimestamp,
      endTimestamp,
      durationMs,
      tagId: activeSession.tagId,
    };
    setHistory((h) => [nextEntry, ...h]);
    setActiveSession(null);
    setTaskName("");
    setNow(endTimestamp);
  }, [activeSession]);

  const handleStopPaused = useCallback(
    (sessionId: string) => {
      const target = pausedSessions.find(
        (session) => session.sessionId === sessionId,
      );
      if (!target) return;

      const endTimestamp = Date.now();
      const nextEntry: HistoryEntry = {
        id: `${target.sessionId}-${endTimestamp}`,
        taskName: target.taskName,
        startTimestamp: target.createdTimestamp,
        endTimestamp,
        durationMs: Math.max(0, Math.floor(target.accumulatedMs)),
        tagId: target.tagId,
      };

      setHistory((prev) => [nextEntry, ...prev]);
      setPausedSessions((prev) =>
        prev.filter((session) => session.sessionId !== sessionId),
      );
      setNow(endTimestamp);
    },
    [pausedSessions],
  );

  const handleExport = useCallback(() => {
    if (history.length === 0) return;
    downloadHistory(history, tags, language, roundingConfig);
  }, [history, tags, language, roundingConfig]);

  const handleClearHistory = useCallback(() => {
    if (history.length === 0) return;
    if (!globalThis.confirm(t("confirmDeleteHistory", language))) return;
    setHistory([]);
  }, [history, language]);

  const handleUpdateHistoryEntry = useCallback(
    (
      entryId: string,
      payload: { startTimestamp: number; durationMs: number },
    ) => {
      const durationMs = Math.max(0, Math.floor(payload.durationMs));
      const startTimestamp = Math.floor(payload.startTimestamp);
      const endTimestamp = startTimestamp + durationMs;

      if (!Number.isFinite(startTimestamp) || durationMs <= 0) return;

      setHistory((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                startTimestamp,
                durationMs,
                endTimestamp,
              }
            : entry,
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      taskName,
      setTaskName,
      activeSession,
      pausedSessions,
      history,
      tags,
      setTags,
      selectedTagId,
      setSelectedTagId,
      now,
      dailyGoalHours,
      setDailyGoalHours,
      workdays,
      setWorkdays,
      roundingConfig,
      setRoundingConfig,
      exportConfig,
      setExportConfig,
      elapsedMs,
      totalTrackedMs,
      totalsByTag,
      totalsByTask,
      todayTrackedMs,
      weekTrackedMs,
      monthTrackedMs,
      totalsByTaskToday,
      completedToday,
      latestEntry,
      favorites,
      toggleFavorite,
      isFavorite,
      handleStart,
      handleQuickStart,
      handlePause,
      handleResumePaused,
      handleStopPaused,
      handleStop,
      handleExport,
      handleClearHistory,
      handleUpdateHistoryEntry,
    }),
    [
      taskName,
      activeSession,
      pausedSessions,
      history,
      tags,
      selectedTagId,
      now,
      dailyGoalHours,
      workdays,
      roundingConfig,
      exportConfig,
      elapsedMs,
      totalTrackedMs,
      totalsByTag,
      totalsByTask,
      todayTrackedMs,
      weekTrackedMs,
      monthTrackedMs,
      totalsByTaskToday,
      completedToday,
      latestEntry,
      favorites,
      toggleFavorite,
      isFavorite,
      handleStart,
      handleQuickStart,
      handlePause,
      handleResumePaused,
      handleStopPaused,
      handleStop,
      handleExport,
      handleClearHistory,
      handleUpdateHistoryEntry,
    ],
  );

  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used within TrackerProvider");
  return ctx;
}
