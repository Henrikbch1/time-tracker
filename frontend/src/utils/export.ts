import { type HistoryEntry } from './cookies'
import { formatDateTime, formatDuration } from './time'

function buildHistoryText(history: HistoryEntry[]) {
  const lines = history.flatMap((entry, index) => [
    `${index + 1}. ${entry.taskName}`,
    `   Started: ${formatDateTime(entry.startTimestamp)}`,
    `   Ended: ${formatDateTime(entry.endTimestamp)}`,
    `   Duration: ${formatDuration(entry.durationMs)}`,
    '',
  ])

  return ['Hookie Time History', '', ...lines].join('\n').trimEnd()
}

export function downloadHistory(history: HistoryEntry[]) {
  const historyText = buildHistoryText(history)
  const blob = new Blob([historyText], { type: 'text/plain;charset=utf-8' })
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dateLabel = new Date().toISOString().slice(0, 10)

  link.href = downloadUrl
  link.download = `hookie-history-${dateLabel}.txt`
  document.body.append(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(downloadUrl)
}