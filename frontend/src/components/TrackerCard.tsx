import { formatDateTime, formatDuration } from '../utils/time'
import t from '../i18n'
import type { Language, Tag } from '../utils/cookies'

interface TrackerCardProps {
  taskName: string
  isRunning: boolean
  elapsedMs: number
  startTimestamp?: number
  onTaskNameChange: (value: string) => void
  onStart: () => void
  onStop: () => void
  tags: Tag[]
  selectedTagId: string | null
  onSelectTag: (tagId: string | null) => void
  language: Language
}

export function TrackerCard({
  taskName,
  isRunning,
  elapsedMs,
  startTimestamp,
  onTaskNameChange,
  onStart,
  onStop,
  tags,
  selectedTagId,
  onSelectTag,
  language,
}: TrackerCardProps) {
  return (
    <section className="surface px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{t('activeTracking', language)}</p>
          <h1 className="display-face mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-white sm:text-4xl">
            {t('keepOneTask', language)}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            {t('storesRunningTask', language)}
          </p>
        </div>

        <div className="surface-muted min-w-0 w-full lg:min-w-56 px-4 py-4 text-left">
          <p className="eyebrow">{t('currentDuration', language)}</p>
          <p className="mono-face mt-3 text-4xl font-medium text-slate-950 dark:text-white sm:text-5xl">
            {formatDuration(elapsedMs)}
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {isRunning && startTimestamp
              ? `${t('startedAt', language)} ${formatDateTime(startTimestamp)}`
              : t('readyToBegin', language)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block text-left">
          <span className="eyebrow">{t('taskName', language)}</span>
          <input
            value={taskName}
            onChange={(event) => onTaskNameChange(event.target.value)}
            disabled={isRunning}
            placeholder={t('placeholderTask', language)}
            className="mt-3 w-full rounded-[1.5rem] border border-slate-300/70 bg-white/85 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-white/25 dark:focus:ring-white/10"
          />
        </label>

        <label className="block text-left">
          <span className="eyebrow mt-4 block">{t('tagLabel', language)}</span>
          <select
            value={selectedTagId ?? ''}
            onChange={(e) => onSelectTag(e.target.value === '' ? null : e.target.value)}
            disabled={isRunning}
            className="mt-3 w-full rounded-[1.5rem] border border-slate-300/70 bg-white/85 px-4 py-3 text-base text-slate-900 outline-none dark:border-white/20 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">{t('noTag', language)}</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <button
            type="button"
            onClick={onStart}
            disabled={isRunning || taskName.trim().length === 0}
            className="primary-button w-full sm:w-auto"
          >
            {t('startTimer', language)}
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={!isRunning}
            className="action-button w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-55"
          >
            {t('stopAndSave', language)}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="surface-muted px-4 py-4 text-left">
          <p className="eyebrow">{t('persistenceTitle', language)}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{t('persistenceDesc', language)}</p>
        </div>
        <div className="surface-muted px-4 py-4 text-left">
          <p className="eyebrow">{t('accuracyTitle', language)}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{t('accuracyDesc', language)}</p>
        </div>
        <div className="surface-muted px-4 py-4 text-left">
          <p className="eyebrow">{t('workflowTitle', language)}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{t('workflowDesc', language)}</p>
        </div>
      </div>
    </section>
  )
}