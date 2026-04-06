import { type HistoryEntry } from '../utils/cookies'
import { formatDateTime, formatDuration, formatShortDate, formatTime } from '../utils/time'

interface HistoryPanelProps {
  history: HistoryEntry[]
  totalTrackedMs: number
  onExport: () => void
  onClear: () => void
}

export function HistoryPanel({ history, totalTrackedMs, onExport, onClear }: HistoryPanelProps) {
  return (
    <section className="surface mt-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Task history</p>
          <h2 className="display-face mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-white">
            Exportable, compact, and local-first.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Completed sessions are serialized into a cookie-backed JSON array. Hookie keeps the newest entries when space gets tight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="surface-muted px-4 py-3 text-left">
            <p className="eyebrow">Stored total</p>
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
            Export history
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={history.length === 0}
            className="action-button disabled:cursor-not-allowed disabled:opacity-55"
          >
            Delete all
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="surface-muted mt-8 flex min-h-56 items-center justify-center px-6 py-10 text-center">
          <div className="max-w-md">
            <p className="display-face text-2xl font-semibold text-slate-950 dark:text-white">
              No sessions saved yet.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Finish a task and it will land here with start time, end time, and duration, ready for export.
            </p>
          </div>
        </div>
      ) : (
        <ol className="mt-8 grid gap-4">
          {history.map((entry) => (
            <li key={entry.id} className="surface-muted grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.8fr))] lg:items-center">
              <div>
                <p className="display-face text-xl font-semibold text-slate-950 dark:text-white">
                  {entry.taskName}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Finished {formatDateTime(entry.endTimestamp)}
                </p>
              </div>

              <Detail label="Started" value={formatTime(entry.startTimestamp)} helper={formatShortDate(entry.startTimestamp)} />
              <Detail label="Stopped" value={formatTime(entry.endTimestamp)} helper={formatShortDate(entry.endTimestamp)} />
              <Detail label="Duration" value={formatDuration(entry.durationMs)} helper="Saved to cookie history" />
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