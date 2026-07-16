import type { HistoryEntry, Tag, RoundingConfig } from "./cookies";
import { formatLocalYMD } from "./date";
import { getRoundedDurationMs, roundDurationMs } from "./time";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

export function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Monday 00:00 of the week containing `timestamp`. */
export function startOfWeek(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dayOfWeek);
  return d.getTime();
}

export function startOfMonth(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}

/** Sum durations of completed entries whose end falls within [startTs, endTs). */
export function sumDurationInRange(
  history: HistoryEntry[],
  startTs: number,
  endTs: number,
): number {
  return history.reduce((total, entry) => {
    if (entry.endTimestamp >= startTs && entry.endTimestamp < endTs) {
      return total + entry.durationMs;
    }
    return total;
  }, 0);
}

export interface TrendPoint {
  key: string;
  label: string;
  ms: number;
  hours: number;
}

/** Tracked ms per day for the last `days` days (oldest → newest, ending today). */
export function dailyTrend(
  history: HistoryEntry[],
  now: number,
  days = 14,
  roundingConfig?: RoundingConfig,
): TrendPoint[] {
  const perDay: Record<string, number> = {};
  for (const entry of history) {
    const key = formatLocalYMD(entry.endTimestamp);
    perDay[key] =
      (perDay[key] ?? 0) +
      getRoundedDurationMs(
        entry.durationMs,
        roundingConfig?.enabled ?? false,
        roundingConfig?.intervalMinutes ?? 0,
      );
  }

  const today = startOfDay(now);
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const ts = today - i * DAY_MS;
    const key = formatLocalYMD(ts);
    const ms = perDay[key] ?? 0;
    points.push({
      key,
      label: new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }).format(ts),
      ms,
      hours: Number((ms / HOUR_MS).toFixed(2)),
    });
  }
  return points;
}

export interface CategorySlice {
  id: string;
  name: string;
  ms: number;
  hours: number;
  color?: string;
}
export interface GroupedTask {
  taskName: string;
  tagId?: string;
  totalDurationMs: number; // Original duration (sum of all entries for this task+tag today)
  roundedDurationMs: number; // Rounded duration (if rounding enabled)
  entries: HistoryEntry[];
}
/**
 * Group today's history entries by taskName + tagId and optionally apply rounding.
 * Prevents double-rounding: all segments for a task are summed first, then rounded once.
 */
export function getGroupedTodayTasks(
  history: HistoryEntry[],
  now: number,
  roundingConfig: RoundingConfig,
): GroupedTask[] {
  const today = startOfDay(now);
  const tomorrow = today + DAY_MS;

  // Filter entries for today
  const todayEntries = history.filter(
    (entry) => entry.endTimestamp >= today && entry.endTimestamp < tomorrow,
  );

  // Group by taskName + tagId
  const grouped: Record<string, GroupedTask> = {};

  for (const entry of todayEntries) {
    const key = `${entry.taskName}|${entry.tagId ?? ""}`;

    if (!grouped[key]) {
      grouped[key] = {
        taskName: entry.taskName,
        tagId: entry.tagId,
        totalDurationMs: 0,
        roundedDurationMs: 0,
        entries: [],
      };
    }

    grouped[key].totalDurationMs += entry.durationMs;
    grouped[key].entries.push(entry);
  }

  // Apply rounding once per group (not per segment)
  const result = Object.values(grouped).map((group) => ({
    ...group,
    roundedDurationMs: roundingConfig.enabled
      ? roundDurationMs(group.totalDurationMs, roundingConfig.intervalMinutes)
      : group.totalDurationMs,
  }));

  // Sort by task name for consistent ordering
  return result.sort((a, b) => a.taskName.localeCompare(b.taskName));
}

/** Aggregate totals-by-key into a sorted, colored series (descending). */
export function toCategorySeries(
  totals: Record<string, number>,
  resolveName: (key: string) => string,
  resolveColor: (key: string, index: number) => string,
): CategorySlice[] {
  return Object.entries(totals)
    .filter(([, ms]) => ms > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, ms], index) => ({
      id: key,
      name: resolveName(key),
      ms,
      hours: Number((ms / HOUR_MS).toFixed(2)),
      color: resolveColor(key, index),
    }));
}

/** Deterministic palette using the golden angle for pleasant hue spacing. */
export function colorByIndex(index: number): string {
  const hue = Math.round((index * 137.508) % 360);
  const saturation = index % 2 === 0 ? 68 : 60;
  const lightness = index % 3 === 0 ? 54 : 60;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function resolveTagName(
  tagId: string,
  tags: Tag[],
  fallback: string,
): string {
  return tags.find((tag) => tag.id === tagId)?.name ?? fallback;
}
