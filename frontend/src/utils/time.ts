const SECOND_IN_MS = 1_000

export function getElapsedDuration(startTimestamp: number, currentTimestamp = Date.now()) {
  return Math.max(0, currentTimestamp - startTimestamp)
}

export function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(Math.max(0, durationMs) / SECOND_IN_MS)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':')
}

export function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp)
}

export function formatShortDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

export function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}