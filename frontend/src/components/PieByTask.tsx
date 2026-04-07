import { formatDuration } from '../utils/time'

type Props = {
  totalsByTask: Record<string, number>
  totalMs: number
  size?: number
  language?: string
}

function deg2rad(deg: number) {
  return (deg * Math.PI) / 180
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = {
    x: cx + r * Math.cos(deg2rad(startAngle)),
    y: cy + r * Math.sin(deg2rad(startAngle)),
  }
  const end = {
    x: cx + r * Math.cos(deg2rad(endAngle)),
    y: cy + r * Math.sin(deg2rad(endAngle)),
  }

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

function stringToHslColor(str: string, s = 65, l = 55) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    // keep in 32bit
    hash |= 0
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h} ${s}% ${l}%)`
}

export default function PieByTask({ totalsByTask, totalMs, size = 220, language }: Props) {
  const entries = Object.entries(totalsByTask).filter(([, ms]) => ms > 0)
  if (entries.length === 0 || totalMs === 0) {
    return (
      <article className="stat-tile">
        <p className="eyebrow">{language ? 'Statistik' : 'Statistics'}</p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Keine Daten zum Anzeigen</p>
      </article>
    )
  }

  const cx = size / 2
  const cy = size / 2
  const r = Math.min(cx, cy) - 6

  let angle = -90

  const slices = entries.map(([taskName, ms]) => {
    const portion = ms / totalMs
    const sweep = portion * 360
    const slice = {
      taskName,
      ms,
      startAngle: angle,
      endAngle: angle + sweep,
      color: stringToHslColor(taskName),
      portion,
    }
    angle += sweep
    return slice
  })

  return (
    <article className="stat-tile">
      <p className="eyebrow text-center">{language ? 'Zeit pro Task' : 'Time per task'}</p>
      <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          {slices.map((s, i) => (
            <path key={s.taskName + i} d={describeArc(cx, cy, r, s.startAngle, s.endAngle)} fill={s.color} />
          ))}
          <circle cx={cx} cy={cy} r={r - 36} fill="var(--surface)" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-sm" style={{ fontSize: 12, fill: 'var(--text)' }}>
            {formatDuration(totalMs)}
          </text>
        </svg>

        <div className="flex flex-col gap-2">
          {slices.slice(0, 8).map((s) => (
            <div key={s.taskName} className="flex items-center gap-3">
              <span style={{ width: 12, height: 12, background: s.color, borderRadius: 3, display: 'inline-block' }} />
              <div className="text-sm">
                <div className="font-medium text-slate-900 dark:text-white">{s.taskName}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{formatDuration(s.ms)} ({Math.round(s.portion * 100)}%)</div>
              </div>
            </div>
          ))}
          {slices.length > 8 ? <div className="text-xs text-slate-600 dark:text-slate-300">...and more</div> : null}
        </div>
      </div>
    </article>
  )
}
