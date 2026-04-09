import { formatDuration } from "../utils/time";
import { formatLocalYMD } from "../utils/date";
import type { HistoryEntry, ActiveSession, Language } from "../utils/cookies";
import t from "../i18n";

function progressGradient(percent: number) {
  if (percent <= 0) return "linear-gradient(180deg,#7c3aed,#06b6d4)";
  if (percent >= 100) return "linear-gradient(180deg,#10b981,#059669)";
  if (percent >= 75) return "linear-gradient(180deg,#84cc16,#f59e0b)";
  if (percent >= 50) return "linear-gradient(180deg,#f59e0b,#fb923c)";
  return "linear-gradient(180deg,#ef4444,#f87171)";
}

type Props = {
  history: HistoryEntry[];
  now?: number;
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
  now = Date.now(),
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

  // compute start of week (Monday)
  const today = new Date(now);
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
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
    const workHours = (workdays && (workdays as any)[dayKey]) ?? 0;
    return { key, ts: d.getTime(), ms: dayMs[key] || 0, dayKey, workHours };
  });

  // add active session elapsed time to today's bucket if it exists
  if (activeSession) {
    const activeDateKey = formatLocalYMD(activeSession.startTimestamp);
    const todayIndex = (new Date(now).getDay() + 6) % 7;
    const todayKey = formatLocalYMD(daysArr[todayIndex].ts);
    // if active session started today only add to today's bucket
    if (activeDateKey === todayKey) {
      daysArr[todayIndex].ms += elapsedMs || 0;
    }
  }

  // filter to only workdays with > 0 hours
  const displayedDays = daysArr.filter((d) => (d.workHours ?? 0) > 0);
  const maxMs = Math.max(...displayedDays.map((d) => d.ms), 1);
  // compute max target ms across week to have consistent scaling
  const maxTargetMs = Math.max(
    ...["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((k) => {
      const dayKey = k as "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
      const hrs = (workdays && (workdays as any)[dayKey]) ?? 0;
      return hrs * 3_600_000;
    }),
    0,
  );
  const scaleMax = Math.max(maxMs, maxTargetMs, 1);

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

  const isSmall = typeof window !== "undefined" && window.innerWidth <= 380;
  const BAR_MAX = isSmall ? 56 : 80;
  const CONTAINER_H = isSmall ? 96 : 132;

  return (
    <article className="stat-tile">
      <p className="eyebrow">{t("timePerDayWeek", language ?? "en")}</p>
      <div className="mt-5 grid w-full grid-flow-col auto-cols-[minmax(3.5rem,1fr)] gap-3 overflow-x-auto pb-2 sm:gap-4">
        {displayedDays.map((d) => {
          const targetHours = d.workHours ?? 0;
          const targetMs = targetHours * 3_600_000;
          const achievedHeight = Math.round((d.ms / scaleMax) * BAR_MAX);
          const targetHeight = Math.round((targetMs / scaleMax) * BAR_MAX);
          const percent =
            targetMs > 0 ? Math.round((d.ms / targetMs) * 100) : 0;

          return (
            <div
              key={d.key}
              className="flex min-w-[3.5rem] flex-col items-center"
            >
              <div
                title={`${formatDuration(d.ms)}`}
                style={{
                  height: CONTAINER_H,
                  display: "flex",
                  alignItems: "flex-end",
                  position: "relative",
                  width: "100%",
                }}
              >
                {/* target background bar */}
                <div
                  style={{
                    width: "100%",
                    height: `${targetHeight}px`,
                    background: "rgba(148,163,184,0.14)",
                    borderRadius: 12,
                    position: "absolute",
                    bottom: 0,
                  }}
                  aria-hidden
                />
                {/* achieved fill */}
                <div
                  style={{
                    width: "100%",
                    height: `${achievedHeight}px`,
                    background: progressGradient(percent),
                    borderRadius: 12,
                    position: "relative",
                  }}
                />
                {/* small target line indicator */}
                {targetMs > 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${targetHeight}px`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "100%",
                      height: 2,
                      background: "rgba(255,255,255,0.9)",
                      opacity: 0.9,
                    }}
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="mt-3 text-sm font-medium leading-5 text-slate-700 dark:text-slate-200">
                {labelMap[d.dayKey]}
              </div>
              <div className="mt-1 text-center text-xs leading-5 text-slate-600 dark:text-slate-300">
                <span className="block">{formatDuration(d.ms)}</span>
                {targetMs > 0 ? (
                  <span className="block">{percent}%</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 w-full text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
        {t("monToSun", language ?? "en")}
      </div>
    </article>
  );
}
