import { type HistoryEntry, type Tag } from './cookies'
import { formatDateTime, formatDuration } from './time'

function buildHistoryText(history: HistoryEntry[], tags: Tag[]) {
  const lines = history.flatMap((entry, index) => {
    const tagName = entry.tagId ? tags.find((t) => t.id === entry.tagId)?.name ?? '(deleted)' : null

    const block = [
      `${index + 1}. ${entry.taskName}${tagName ? ` — ${tagName}` : ''}`,
      `   Started: ${formatDateTime(entry.startTimestamp)}`,
      `   Ended: ${formatDateTime(entry.endTimestamp)}`,
      `   Duration: ${formatDuration(entry.durationMs)}`,
    ]

    return [...block, '']
  })

  return ['Hookie Time History', '', ...lines].join('\n').trimEnd()
}

export function downloadHistory(history: HistoryEntry[], tags: Tag[] = []) {
  const historyText = buildHistoryText(history.map((e) => ({ ...e } as HistoryEntry)), tags)
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