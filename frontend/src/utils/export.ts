import { type HistoryEntry, type Tag, type Language } from './cookies'
import { formatDateTime, formatDuration } from './time'
import t from '../i18n'

function buildHistoryText(history: HistoryEntry[], tags: Tag[], language: Language) {
  const lines = history.flatMap((entry, index) => {
    const tagName = entry.tagId ? tags.find((t) => t.id === entry.tagId)?.name ?? t('deletedLabel', language) : null

    const block = [
      `${index + 1}. ${entry.taskName}${tagName ? ` — ${tagName}` : ''}`,
      `   ${t('detailStarted', language)}: ${formatDateTime(entry.startTimestamp)}`,
      `   ${t('finishedAt', language)}: ${formatDateTime(entry.endTimestamp)}`,
      `   ${t('detailDuration', language)}: ${formatDuration(entry.durationMs)}`,
    ]

    return [...block, '']
  })

  return [t('export_fileName', language), '', ...lines].join('\n').trimEnd()
}

export function downloadHistory(history: HistoryEntry[], tags: Tag[] = [], language: Language = 'en') {
  const historyText = buildHistoryText(history.map((e) => ({ ...e } as HistoryEntry)), tags, language)
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