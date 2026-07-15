import { useState } from "react";
import { formatDuration } from "../lib/time";
import t from "../i18n";
import type { Language } from "../lib/cookies";

type Props = {
  totalsByTask: Record<string, number>;
  totalMs: number;
  todayTotalsByTask: Record<string, number>;
  todayTotalMs: number;
  size?: number;
  language?: Language;
};

function deg2rad(deg: number) {
  return (deg * Math.PI) / 180;
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = {
    x: cx + r * Math.cos(deg2rad(startAngle)),
    y: cy + r * Math.sin(deg2rad(startAngle)),
  };
  const end = {
    x: cx + r * Math.cos(deg2rad(endAngle)),
    y: cy + r * Math.sin(deg2rad(endAngle)),
  };

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function colorByIndex(index: number) {
  const hue = Math.round((index * 137.508) % 360);
  const saturation = index % 2 === 0 ? 72 : 66;
  const lightness = index % 3 === 0 ? 52 : 58;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function isFullCircle(startAngle: number, endAngle: number) {
  return endAngle - startAngle >= 359.9;
}

export default function PieByTask({
  totalsByTask,
  totalMs,
  todayTotalsByTask,
  todayTotalMs,
  size = 220,
  language,
}: Props) {
  const [showToday, setShowToday] = useState(false);
  const selectedTotals = showToday ? todayTotalsByTask : totalsByTask;
  const selectedTotalMs = showToday ? todayTotalMs : totalMs;
  const selectedLanguage = language ?? "en";
  const entries = Object.entries(selectedTotals)
    .filter(([, ms]) => ms > 0)
    .sort((a, b) => b[1] - a[1]);
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.min(cx, cy) - 6;
  let angle = -90;

  const slices = entries.map(([taskName, ms], index) => {
    const portion = ms / selectedTotalMs;
    const sweep = portion * 360;
    const slice = {
      taskName,
      ms,
      startAngle: angle,
      endAngle: angle + sweep,
      color: colorByIndex(index),
      portion,
    };
    angle += sweep;
    return slice;
  });

  return (
    <article className="stat-tile">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">{t("pie_title", selectedLanguage)}</p>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/10">
          <button
            type="button"
            onClick={() => setShowToday(false)}
            aria-pressed={!showToday}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${!showToday ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
          >
            {t("pie_all", selectedLanguage)}
          </button>
          <button
            type="button"
            onClick={() => setShowToday(true)}
            aria-pressed={showToday}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${showToday ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
          >
            {t("pie_today", selectedLanguage)}
          </button>
        </div>
      </div>
      {entries.length === 0 || selectedTotalMs === 0 ? (
        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
          {t("pie_noData", selectedLanguage)}
        </p>
      ) : (
        <div className="mt-5 flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="mx-auto h-auto w-full max-w-55 lg:mx-0 lg:flex-none"
            aria-hidden
          >
            {slices.map((s, i) =>
              isFullCircle(s.startAngle, s.endAngle) ? (
                <circle key={s.taskName + i} cx={cx} cy={cy} r={r} fill={s.color} />
              ) : (
                <path
                  key={s.taskName + i}
                  d={describeArc(cx, cy, r, s.startAngle, s.endAngle)}
                  fill={s.color}
                />
              ),
            )}
            <circle cx={cx} cy={cy} r={r - 36} fill="var(--surface)" />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-sm"
              style={{ fontSize: 12, fill: "var(--text)" }}
            >
              {formatDuration(selectedTotalMs)}
            </text>
          </svg>

          <div className="grid w-full gap-3 lg:max-w-[24rem] max-w-full min-w-0">
            {slices.slice(0, 8).map((s) => (
              <div
                key={s.taskName}
                className="surface-muted flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3"
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: s.color,
                    borderRadius: 3,
                    display: "inline-block",
                  }}
                />
                <div className="min-w-0 text-sm">
                  <div className="truncate font-medium text-slate-900 dark:text-white">
                    {s.taskName}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {formatDuration(s.ms)} ({Math.round(s.portion * 100)}%)
                  </div>
                </div>
              </div>
            ))}
            {slices.length > 8 ? (
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {t("andMore", selectedLanguage)}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
