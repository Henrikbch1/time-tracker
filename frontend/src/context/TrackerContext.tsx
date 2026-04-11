import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearActiveSession,
  limitHistoryEntries,
  readActiveSession,
  readHistory,
  readTags,
  readDailyGoal,
  readWorkdays,
  type ActiveSession,
  type HistoryEntry,
  type Tag,
  writeActiveSession,
  writeHistory,
  writeTags,
} from "../lib/cookies";
import { useLanguage } from "./LanguageContext";
import { useInterval } from "../hooks/useInterval";
import { downloadHistory } from "../lib/export";
import { getElapsedDuration } from "../lib/time";
import { formatLocalYMD } from "../lib/date";
import t from "../i18n";

type WorkdaysMap = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  number
>;

interface TrackerContextValue {
  taskName: string;
  setTaskName: (name: string) => void;
  activeSession: ActiveSession | null;
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
  elapsedMs: number;
  totalTrackedMs: number;
  totalsByTag: Record<string, number>;
  totalsByTask: Record<string, number>;
  completedToday: number;
  latestEntry: HistoryEntry | null;
  handleStart: () => void;
  handleStop: () => void;
  handleExport: () => void;
  handleClearHistory: () => void;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

function getInitialState() {
  const restoredSession = readActiveSession();
  return {
    taskName: restoredSession?.taskName ?? "",
    activeSession: restoredSession,
    history: readHistory(),
    tags: readTags() ?? [],
    dailyGoalHours: readDailyGoal() ?? 8,
    workdays: readWorkdays(),
    now: Date.now(),
  };
}

export function TrackerProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [initial] = useState(getInitialState);
  const [taskName, setTaskName] = useState(initial.taskName);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    initial.activeSession,
  );
  const [history, setHistory] = useState<HistoryEntry[]>(initial.history);
  const [tags, setTags] = useState<Tag[]>(initial.tags);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [now, setNow] = useState(initial.now);
  const [dailyGoalHours, setDailyGoalHours] = useState(initial.dailyGoalHours);
  const [workdays, setWorkdays] = useState<WorkdaysMap>(initial.workdays);

  useEffect(() => {
    if (activeSession) {
      writeActiveSession(activeSession);
    } else {
      clearActiveSession();
    }
  }, [activeSession]);

  useEffect(() => {
    writeTags(tags);
  }, [tags]);
  useEffect(() => {
    writeHistory(history);
  }, [history]);

  useInterval(
    () => {
      setNow(Date.now());
    },
    activeSession ? 250 : null,
  );

  const elapsedMs = activeSession
    ? getElapsedDuration(activeSession.startTimestamp, now)
    : 0;
  const totalTrackedMs = history.reduce(
    (total, entry) => total + entry.durationMs,
    0,
  );

  const totalsByTag = history.reduce((map: Record<string, number>, entry) => {
    if (entry.tagId)
      map[entry.tagId] = (map[entry.tagId] || 0) + entry.durationMs;
    return map;
  }, {});

  const totalsByTask = history.reduce(
    (map: Record<string, number>, entry) => {
      map[entry.taskName] = (map[entry.taskName] || 0) + entry.durationMs;
      return map;
    },
    {} as Record<string, number>,
  );

  if (activeSession) {
    totalsByTask[activeSession.taskName] =
      (totalsByTask[activeSession.taskName] || 0) + elapsedMs;
  }

  const todayKey = formatLocalYMD(now);
  const completedToday = history.filter(
    (e) => formatLocalYMD(e.endTimestamp) === todayKey,
  ).length;
  const latestEntry = history[0] ?? null;

  const handleStart = () => {
    const normalized = taskName.trim();
    if (!normalized) return;
    const startTimestamp = Date.now();
    setTaskName(normalized);
    setNow(startTimestamp);
    setActiveSession({
      taskName: normalized,
      startTimestamp,
      tagId: selectedTagId ?? undefined,
    });
  };

  const handleStop = () => {
    if (!activeSession) return;
    const endTimestamp = Date.now();
    const nextEntry: HistoryEntry = {
      id: `${activeSession.startTimestamp}-${endTimestamp}`,
      taskName: activeSession.taskName,
      startTimestamp: activeSession.startTimestamp,
      endTimestamp,
      durationMs: getElapsedDuration(
        activeSession.startTimestamp,
        endTimestamp,
      ),
      tagId: activeSession.tagId,
    };
    setHistory((h) => limitHistoryEntries([nextEntry, ...h]));
    setActiveSession(null);
    setTaskName("");
    setNow(endTimestamp);
  };

  const handleExport = () => {
    if (history.length === 0) return;
    downloadHistory(history, tags, language);
  };

  const handleClearHistory = () => {
    if (history.length === 0) return;
    if (!window.confirm(t("confirmDeleteHistory", language))) return;
    setHistory([]);
  };

  return (
    <TrackerContext.Provider
      value={{
        taskName,
        setTaskName,
        activeSession,
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
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used within TrackerProvider");
  return ctx;
}
