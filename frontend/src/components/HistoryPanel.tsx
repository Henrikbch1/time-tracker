import { type HistoryEntry, type Tag } from '../utils/cookies'
import { formatDateTime, formatDuration, formatShortDate, formatTime } from '../utils/time'
import t from '../i18n'
import type { Language } from '../utils/cookies'

interface HistoryPanelProps {
  history: HistoryEntry[]
  totalTrackedMs: number
  tags?: Tag[]
  onExport: () => void
  onClear: () => void
  language: Language
}

export function HistoryPanel({ history, totalTrackedMs, tags = [], onExport, onClear, language }: HistoryPanelProps) {
  return (
    <section className="surface mt-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{t('taskHistory', language)}</p>
          <h2 className="display-face mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-white">
            {t('exportableCompact', language)}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            {t('completedSessionsParagraph', language)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="surface-muted px-4 py-3 text-left">
            <p className="eyebrow">{t('storedTotal', language)}</p>
            <p className="mono-face mt-2 text-lg font-medium text-slate-950 dark:text-white">
              {formatDuration(totalTrackedMs)}
            </p>
          </div>
          <button
            type="button"
            onClick={onExport}
            disabled={history.length === 0}
            className="action-button disabled:cursor-not-allowed disabled:opacity-55"
          >
            {t('exportHistory', language)}
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={history.length === 0}
            className="action-button disabled:cursor-not-allowed disabled:opacity-55"
          >
            {t('deleteAll', language)}
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="surface-muted mt-8 flex min-h-56 items-center justify-center px-6 py-10 text-center">
          <div className="max-w-md">
            <p className="display-face text-2xl font-semibold text-slate-950 dark:text-white">
              {t('noSessionsSaved', language)}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {t('finishATaskParagraph', language)}
            </p>
          </div>
        </div>
      ) : (
        <ol className="mt-8 grid gap-4">
          {history.map((entry) => (
            <li key={entry.id} className="surface-muted grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.8fr))] lg:items-center">
              <div>
                <p className="display-face text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-3">
                  <span className="min-w-0 truncate">{entry.taskName}</span>
                    {entry.tagId ? (
                      <span className="ml-2 inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                        {(() => {
                          const tag = tags.find((t) => t.id === entry.tagId)
                          return (
                            <>
                              <span style={{ width: 10, height: 10, background: tag?.color ?? 'transparent' }} className="inline-block rounded-full" />
                              <span className="truncate max-w-[8rem] block">{tag?.name ?? t('deletedLabel', language)}</span>
                            </>
                          )
                        })()}
                      </span>
                    ) : null}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {t('finishedAt', language)} {formatDateTime(entry.endTimestamp)}
                </p>
              </div>

              <Detail label={t('detailStarted', language)} value={formatTime(entry.startTimestamp)} helper={formatShortDate(entry.startTimestamp)} />
              <Detail label={t('detailStopped', language)} value={formatTime(entry.endTimestamp)} helper={formatShortDate(entry.endTimestamp)} />
              <Detail label={t('detailDuration', language)} value={formatDuration(entry.durationMs)} helper={t('savedToCookieHistory', language)} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

interface DetailProps {
  label: string
  value: string
  helper: string
}

function Detail({ label, value, helper }: DetailProps) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mono-face mt-2 text-lg font-medium text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  )
}