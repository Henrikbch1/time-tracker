import React from 'react'
import { formatDuration, formatShortDate } from '../utils/time'
import type { HistoryEntry, ActiveSession } from '../utils/cookies'

function progressGradient(percent: number) {
  if (percent <= 0) return 'linear-gradient(180deg,#7c3aed,#06b6d4)'
  if (percent >= 100) return 'linear-gradient(180deg,#10b981,#059669)'
  if (percent >= 75) return 'linear-gradient(180deg,#84cc16,#f59e0b)'
  if (percent >= 50) return 'linear-gradient(180deg,#f59e0b,#fb923c)'
  return 'linear-gradient(180deg,#ef4444,#f87171)'
}

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
    const dayKey = ['mon','tue','wed','thu','fri','sat','sun'][i] as 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'
    const workHours = (workdays && (workdays as any)[dayKey]) ?? 0
    return { key, ts: d.getTime(), ms: dayMs[key] || 0, dayKey, workHours }
  })

  // add active session elapsed time to today's bucket if it exists
  if (activeSession) {
    const activeDateKey = new Date(activeSession.startTimestamp).toISOString().slice(0, 10)
    const todayIndex = (new Date(now).getDay() + 6) % 7
    const todayKey = new Date(daysArr[todayIndex].ts).toISOString().slice(0, 10)
    // if active session started today only add to today's bucket
    if (activeDateKey === todayKey) {
      daysArr[todayIndex].ms += elapsedMs || 0
    }
  }

  // filter to only workdays with > 0 hours
  const displayedDays = daysArr.filter((d) => (d.workHours ?? 0) > 0)
  const maxMs = Math.max(...displayedDays.map((d) => d.ms), 1)
  // compute max target ms across week to have consistent scaling
  const maxTargetMs = Math.max(...['mon','tue','wed','thu','fri','sat','sun'].map((k, i) => {
    const dayKey = k as 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'
    const hrs = (workdays && (workdays as any)[dayKey]) ?? 0
    return hrs * 3_600_000
  }), 0)
  const scaleMax = Math.max(maxMs, maxTargetMs, 1)
  const labelsDe = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const labelsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const labels = language === 'de' ? labelsDe : labelsEn

  return (
    <article className="stat-tile">
      <p className="eyebrow">{language === 'de' ? 'Zeit pro Tag (Woche)' : 'Time per day (week)'}</p>
      <div className="mt-3 flex gap-3 items-end" style={{ alignItems: 'flex-end' }}>
        {displayedDays.map((d, idx) => {
          const dayKey = d.dayKey
          const targetHours = d.workHours ?? 0
          const targetMs = targetHours * 3_600_000
          const achievedHeight = Math.round((d.ms / scaleMax) * 80)
          const targetHeight = Math.round((targetMs / scaleMax) * 80)
          const percent = targetMs > 0 ? Math.round((d.ms / targetMs) * 100) : 0

          return (
            <div key={d.key} className="flex flex-col items-center" style={{ width: 40 }}>
              <div title={`${formatDuration(d.ms)}`} style={{ height: 80, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                {/* target background bar */}
                <div style={{ width: 28, height: `${targetHeight}px`, background: 'rgba(148,163,184,0.12)', borderRadius: 4, position: 'absolute', bottom: 0 }} aria-hidden />
                {/* achieved fill */}
                <div style={{ width: 28, height: `${achievedHeight}px`, background: progressGradient(percent), borderRadius: 4, position: 'relative' }} />
                {/* small target line indicator */}
                {targetMs > 0 ? (
                  <div style={{ position: 'absolute', bottom: `${targetHeight}px`, left: 6, width: 28, height: 2, background: 'rgba(255,255,255,0.9)', opacity: 0.9 }} aria-hidden />
                ) : null}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">{labels[idx]}</div>
              <div className="text-[10px] text-slate-700 dark:text-slate-200 mt-1">{formatDuration(d.ms)}{targetMs>0 ? ` • ${percent}%` : ''}</div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">{language === 'de' ? 'Mon–So' : 'Mon–Sun'}</div>
    </article>
  )
}
