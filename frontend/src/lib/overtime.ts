import { formatLocalYMD } from "./date";
import { startOfDay, startOfMonth, startOfWeek } from "./stats";

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type WorkdaysMap = Record<WeekdayKey, number>;

const HOUR_MS = 3_600_000;
const WEEKDAY_KEYS: WeekdayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export function weekdayKeyOf(timestamp: number): WeekdayKey {
  return WEEKDAY_KEYS[new Date(timestamp).getDay()];
}

/** Target working time (ms) for the day containing `timestamp`. */
export function targetMsFor(timestamp: number, workdays: WorkdaysMap): number {
  return (workdays[weekdayKeyOf(timestamp)] ?? 0) * HOUR_MS;
}

export interface OvertimeDay {
  dayKey: string;
  dayTimestamp: number;
  trackedMs: number;
  targetMs: number;
  deltaMs: number;
}

export interface OvertimeSummary {
  /** Days with tracked time, newest first. */
  days: OvertimeDay[];
  /** Balance over all tracked days incl. today + manual carry-over. */
  totalMs: number;
  /**
   * Balance over all completed days (before today) + carry-over. This is the
   * headline number: today is still in progress and would otherwise show a
   * large minus every morning.
   */
  untilYesterdayMs: number;
  /** Week / month balance of completed days (today excluded, see above). */
  weekMs: number;
  monthMs: number;
  today: OvertimeDay;
}

/**
 * Overtime is only counted on days that actually contain tracked time.
 * Days without any entries (vacation, sick leave, weekend) don't produce
 * a negative balance – that's how most people use a personal tracker.
 */
export function computeOvertime(
  trackedByDay: Record<string, { ms: number; dayTimestamp: number }>,
  workdays: WorkdaysMap,
  now: number,
  carryOverMs = 0,
): OvertimeSummary {
  const todayKey = formatLocalYMD(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const days: OvertimeDay[] = Object.entries(trackedByDay)
    .filter(([, value]) => value.ms > 0)
    .map(([dayKey, value]) => {
      const targetMs = targetMsFor(value.dayTimestamp, workdays);
      return {
        dayKey,
        dayTimestamp: value.dayTimestamp,
        trackedMs: value.ms,
        targetMs,
        deltaMs: value.ms - targetMs,
      };
    })
    .sort((a, b) => b.dayTimestamp - a.dayTimestamp);

  let totalMs = carryOverMs;
  let untilYesterdayMs = carryOverMs;
  let weekMs = 0;
  let monthMs = 0;

  for (const day of days) {
    totalMs += day.deltaMs;
    if (day.dayKey === todayKey) continue;
    untilYesterdayMs += day.deltaMs;
    if (day.dayTimestamp >= weekStart) weekMs += day.deltaMs;
    if (day.dayTimestamp >= monthStart) monthMs += day.deltaMs;
  }

  const todayTracked = trackedByDay[todayKey]?.ms ?? 0;
  const todayTarget = targetMsFor(now, workdays);

  return {
    days,
    totalMs,
    untilYesterdayMs,
    weekMs,
    monthMs,
    today: {
      dayKey: todayKey,
      dayTimestamp: startOfDay(now),
      trackedMs: todayTracked,
      targetMs: todayTarget,
      deltaMs: todayTracked - todayTarget,
    },
  };
}

/** "+1:15 h" / "−0:30 h" / "±0:00 h" */
export function formatSignedHM(ms: number, unit = true): string {
  const totalMinutes = Math.round(Math.abs(ms) / 60_000);
  const sign = totalMinutes === 0 ? "±" : ms > 0 ? "+" : "−";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${sign}${h}:${String(m).padStart(2, "0")}${unit ? " h" : ""}`;
}

/** "7:45 h" */
export function formatHM(ms: number, unit = true): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}${unit ? " h" : ""}`;
}

export function deltaColor(ms: number): string {
  if (Math.abs(ms) < 60_000) return "var(--text-muted)";
  return ms > 0 ? "var(--success)" : "var(--danger)";
}
