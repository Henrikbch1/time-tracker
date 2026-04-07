import React from 'react'
import { formatDuration, formatShortDate } from '../utils/time'
import type { HistoryEntry, ActiveSession } from '../utils/cookies'

type Props = {
  history: HistoryEntry[]
  days?: number
  now?: number
  language?: string
  activeSession?: ActiveSession | null
  elapsedMs?: number
  workdays?: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', number>
}

export default function TimeByDay({ history, days = 7, now = Date.now(), language, activeSession, elapsedMs = 0, workdays }: Props) {
  const dayMs: Record<string, number> = {}

  for (const entry of history) {
    if (entry.endTimestamp > now) continue

    const d = new Date(entry.endTimestamp)
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10)
    dayMs[key] = (dayMs[key] || 0) + entry.durationMs
  }

  // compute start of week (Monday)
  const today = new Date(now)
  const dayOfWeek = (today.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(today)
  monday.setDate(today.getDate() - dayOfWeek)

  const daysArr = [...Array(7)].map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10)
    return { key, ts: d.getTime(), ms: dayMs[key] || 0 }
  })

  // add active session elapsed time to today's bucket if it exists
  if (activeSession) {
    const activeDateKey = new Date(activeSession.startTimestamp).toISOString().slice(0, 10)
    const todayKey = new Date(daysArr[ (new Date(now).getDay()+6)%7 ].ts).toISOString().slice(0,10)
    // if active session started today (or yesterday but still running) only add to today's bucket
    if (activeDateKey === todayKey) {
      daysArr[ (new Date(now).getDay()+6)%7 ].ms += elapsedMs || 0
    }
  }

  const maxMs = Math.max(...daysArr.map((d) => d.ms), 1)
  const labelsDe = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const labelsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const labels = language === 'de' ? labelsDe : labelsEn

  return (
    <article className="stat-tile">
      <p className="eyebrow">{language === 'de' ? 'Zeit pro Tag (Woche)' : 'Time per day (week)'}</p>
      <div className="mt-3 flex gap-3 items-end" style={{ alignItems: 'flex-end' }}>
        {daysArr.map((d, idx) => {
          const height = Math.round((d.ms / maxMs) * 80) // max bar height px
          const dayKey = ['mon','tue','wed','thu','fri','sat','sun'][idx]
          const targetHours = (workdays && (workdays as any)[dayKey]) ?? 0
          const targetMs = targetHours * 3_600_000
          const targetPos = Math.round((targetMs / maxMs) * 80)

          return (
            <div key={d.key} className="flex flex-col items-center" style={{ width: 40 }}>
              <div title={`${formatDuration(d.ms)}`} style={{ height: 80, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                <div style={{ width: 28, height: `${height}px`, background: 'linear-gradient(180deg, #7c3aed, #06b6d4)', borderRadius: 4 }} />
                {/* target line */}
                {targetMs > 0 ? (
                  <div style={{ position: 'absolute', bottom: `${targetPos}px`, left: 6, width: 28, height: 2, background: 'rgba(255,255,255,0.9)', borderTop: '2px dashed rgba(0,0,0,0.6)' }} aria-hidden />
                ) : null}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">{labels[idx]}</div>
              <div className="text-[10px] text-slate-700 dark:text-slate-200 mt-1">{formatDuration(d.ms)}</div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">{language === 'de' ? 'Mon–So' : 'Mon–Sun'}</div>
    </article>
  )
}
