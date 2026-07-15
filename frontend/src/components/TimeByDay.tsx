import { formatDuration } from "../lib/time";
import { formatLocalYMD } from "../lib/date";
import type { HistoryEntry, ActiveSession, Language } from "../lib/cookies";
import t from "../i18n";

function progressColor(percent: number) {
  if (percent >= 100) return "#10b981";
  if (percent >= 75) return "#84cc16";
  if (percent >= 50) return "#f59e0b";
  return "#f97316";
}

type Props = {
  history: HistoryEntry[];
  now: number;
  language?: Language;
  activeSession?: ActiveSession | null;
  elapsedMs?: number;
  workdays?: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    number
  >;
};

export default function TimeByDay({
  history,
  now,
  language,
  activeSession,
  elapsedMs = 0,
  workdays,
}: Props) {
  const dayMs: Record<string, number> = {};

  for (const entry of history) {
    if (entry.endTimestamp > now) continue;

    const key = formatLocalYMD(entry.endTimestamp);
    dayMs[key] = (dayMs[key] || 0) + entry.durationMs;
  }

  const today = new Date(now);
  const dayOfWeek = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  const daysArr = [...Array(7)].map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = formatLocalYMD(d.getTime());
    const dayKey = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][i] as
      | "mon"
      | "tue"
      | "wed"
      | "thu"
      | "fri"
      | "sat"
      | "sun";
    const workHours = workdays?.[dayKey] ?? 0;
    return { key, ts: d.getTime(), ms: dayMs[key] || 0, dayKey, workHours };
  });

  if (activeSession) {
    const activeDateKey = formatLocalYMD(activeSession.createdTimestamp);
    const todayKey = formatLocalYMD(daysArr[dayOfWeek].ts);
    if (activeDateKey === todayKey) {
      daysArr[dayOfWeek].ms += elapsedMs || 0;
    }
  }

  const displayedDays = daysArr.filter((d) => (d.workHours ?? 0) > 0);

  const labelMap: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    string
  > = {
    mon: t("dayShortMon", language ?? "en"),
    tue: t("dayShortTue", language ?? "en"),
    wed: t("dayShortWed", language ?? "en"),
    thu: t("dayShortThu", language ?? "en"),
    fri: t("dayShortFri", language ?? "en"),
    sat: t("dayShortSat", language ?? "en"),
    sun: t("dayShortSun", language ?? "en"),
  };

  const chartData = displayedDays.map((d) => {
    const targetMs = (d.workHours ?? 0) * 3_600_000;
    const percent = targetMs > 0 ? Math.round((d.ms / targetMs) * 100) : 0;
    return {
      key: d.key,
      day: labelMap[d.dayKey],
      trackedMs: d.ms,
      targetMs,
      trackedHours: Number((d.ms / 3_600_000).toFixed(2)),
      targetHours: Number((targetMs / 3_600_000).toFixed(2)),
      percent,
    };
  });

  const weekTargetMs = displayedDays.reduce(
    (total, day) => total + (day.workHours ?? 0) * 3_600_000,
    0,
  );
  const weekTrackedMs = chartData.reduce(
    (total, day) => total + day.trackedMs,
    0,
  );
  const weekPercent =
    weekTargetMs > 0 ? Math.round((weekTrackedMs / weekTargetMs) * 100) : 0;
  const weekRemainingMs = Math.max(0, weekTargetMs - weekTrackedMs);

  const chartHeight = 184;
  const chartWidth = Math.max(300, chartData.length * 58);
  const margin = { top: 12, right: 10, bottom: 28, left: 32 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  // Use configured day targets as chart scale so one outlier day does not stretch the axis.
  const maxHours = Math.max(...chartData.map((d) => d.targetHours), 1);
  const rowStep = innerHeight / 4;

  return (
    <article className="stat-tile">
      <p className="eyebrow">{t("timePerDayWeek", language ?? "en")}</p>
      <div className="mt-5 h-64 w-full">
        {chartData.length > 0 ? (
          <div className="h-full w-full overflow-x-auto overflow-y-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-full min-w-75"
              role="img"
              aria-label={t("timePerDayWeek", language ?? "en")}
            >
              {[0, 1, 2, 3, 4].map((i) => {
                const y = margin.top + i * rowStep;
                const hours = Math.round(maxHours * (1 - i / 4) * 10) / 10;
                return (
                  <g key={i}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={chartWidth - margin.right}
                      y2={y}
                      stroke="rgba(148,163,184,0.25)"
                    />
                    <text
                      x={margin.left - 6}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748b"
                    >
                      {hours}h
                    </text>
                  </g>
                );
              })}

              {chartData.map((d, index) => {
                const groupWidth = innerWidth / chartData.length;
                const barWidth = Math.min(24, groupWidth * 0.6);
                const x =
                  margin.left +
                  index * groupWidth +
                  (groupWidth - barWidth) / 2;
                const targetHeight = (d.targetHours / maxHours) * innerHeight;
                const trackedHeight =
                  (Math.min(d.trackedHours, maxHours) / maxHours) * innerHeight;
                const targetY = margin.top + innerHeight - targetHeight;
                const trackedY = margin.top + innerHeight - trackedHeight;
                const isOverflow = d.trackedHours > maxHours;

                return (
                  <g key={d.key}>
                    <title>
                      {`${d.day}: ${formatDuration(d.trackedMs)} / ${formatDuration(d.targetMs)} (${d.percent}%)`}
                    </title>
                    <rect
                      x={x}
                      y={targetY}
                      width={barWidth}
                      height={targetHeight}
                      rx={6}
                      fill="rgba(148,163,184,0.12)"
                      stroke="rgba(148,163,184,0.5)"
                      strokeWidth="1"
                    />
                    <rect
                      x={x}
                      y={trackedY}
                      width={barWidth}
                      height={trackedHeight}
                      rx={6}
                      fill={progressColor(d.percent)}
                    />
                    {isOverflow ? (
                      <rect
                        x={x + 2}
                        y={margin.top + 2}
                        width={Math.max(2, barWidth - 4)}
                        height={3}
                        rx={2}
                        fill="#ef4444"
                      />
                    ) : null}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-600 dark:text-slate-300">
            {t("pie_noData", language ?? "en")}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm bg-slate-400/50"
            aria-hidden
          />
          {t("dailyGoalLabel", language ?? "en")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" aria-hidden />
          {t("trackedTime", language ?? "en")}
        </span>
      </div>
      <div className="mt-5 rounded-3xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{t("timePerWeek", language ?? "en")}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {formatDuration(weekTrackedMs)} / {formatDuration(weekTargetMs)}
            </p>
          </div>
          <div className="text-right text-sm text-slate-600 dark:text-slate-300">
            <div className="font-medium text-slate-900 dark:text-white">
              {weekPercent}%
            </div>
            <div>
              {formatDuration(weekRemainingMs)} {t("hours", language ?? "en")}
            </div>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, weekPercent)}%`,
              background:
                weekPercent >= 100
                  ? "linear-gradient(90deg, #10b981, #059669)"
                  : "linear-gradient(90deg, #06b6d4, #7c3aed)",
            }}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {chartData.map((day) => (
            <div
              key={day.key}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {day.day}
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                {formatDuration(day.trackedMs)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 w-full text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
        {t("monToSun", language ?? "en")}
      </div>
    </article>
  );
}
