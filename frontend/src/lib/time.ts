const SECOND_IN_MS = 1_000;

export function getElapsedDuration(
  startTimestamp: number,
  currentTimestamp = Date.now(),
) {
  return Math.max(0, currentTimestamp - startTimestamp);
}

export function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(Math.max(0, durationMs) / SECOND_IN_MS);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export function formatShortDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

export function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

/**
 * Round a duration in milliseconds up to the nearest interval.
 * @param durationMs - Duration in milliseconds
 * @param intervalMinutes - Rounding interval in minutes (e.g., 5, 10, 15)
 * @returns Rounded duration in milliseconds
 */
export function roundDurationMs(
  durationMs: number,
  intervalMinutes: number,
): number {
  if (intervalMinutes <= 0) {
    return Math.max(0, durationMs);
  }

  const intervalMs = intervalMinutes * 60 * 1_000;
  return Math.ceil(Math.max(0, durationMs) / intervalMs) * intervalMs;
}

export function getRoundedDurationMs(
  durationMs: number,
  enabled: boolean,
  intervalMinutes: number,
): number {
  if (!enabled) {
    return Math.max(0, durationMs);
  }

  return roundDurationMs(durationMs, intervalMinutes);
}

/**
 * Format duration in flexible formats.
 * @param durationMs - Duration in milliseconds
 * @param format - Format type: 'HH:MM' (hours:minutes), 'H.H' (decimal hours), or 'minutes' (total minutes)
 * @returns Formatted duration string
 */
export function formatDurationFlexible(
  durationMs: number,
  format: "HH:MM" | "H.H" | "minutes",
): string {
  const totalSeconds = Math.floor(Math.max(0, durationMs) / SECOND_IN_MS);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalMinutes = Math.floor(totalSeconds / 60);

  switch (format) {
    case "HH:MM":
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    case "H.H": {
      const decimalHours = (totalSeconds / 3600).toFixed(2);
      return decimalHours;
    }
    case "minutes":
      return String(totalMinutes);
    default:
      return formatDuration(durationMs);
  }
}
