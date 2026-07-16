import type { HistoryEntry, Tag } from "./cookies";
import { formatLocalYMD } from "./date";

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
): TrendPoint[] {
  const perDay: Record<string, number> = {};
  for (const entry of history) {
    const key = formatLocalYMD(entry.endTimestamp);
    perDay[key] = (perDay[key] ?? 0) + entry.durationMs;
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
