import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { useTracker } from "../context/TrackerContext";
import KpiCard from "../components/KpiCard";
import TimerWidget from "../components/TimerWidget";
import { TrendChart } from "../components/Charts";
import { formatDuration, formatDateTime, getRoundedDurationMs } from "../lib/time";
import { dailyTrend } from "../lib/stats";
import { ChartIcon, ClockIcon } from "../components/icons";
import t from "../i18n";
import type { Key } from "../i18n";

function greetingKey(): Key {
  const hour = new Date().getHours();
  if (hour < 12) return "greetingMorning";
  if (hour < 18) return "greetingAfternoon";
  return "greetingEvening";
}

export default function DashboardPage() {
  const { language } = useLanguage();
  const { profile } = useProfile();
  const {
    history,
    tags,
    now,
    activeSession,
    elapsedMs,
    todayTrackedMs,
    weekTrackedMs,
    monthTrackedMs,
    completedToday,
    roundingConfig,
  } = useTracker();

  const name = profile.name.trim() || t("greetingFallback", language);
  const trend = dailyTrend(history, now, 14, roundingConfig);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1
          className="display-face text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--text)" }}
        >
          {t(greetingKey(), language)}
          {name ? `, ${name}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("dashboardSubtitle", language)}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label={t("kpiToday", language)}
          value={formatDuration(todayTrackedMs)}
          hint={`${completedToday} ${t("statusCompleted", language).toLowerCase()}`}
          icon={<ClockIcon className="h-5 w-5" />}
          accent="var(--primary)"
        />
        <KpiCard
          label={t("kpiWeek", language)}
          value={formatDuration(weekTrackedMs)}
          icon={<ChartIcon className="h-5 w-5" />}
          accent="var(--accent)"
        />
        <KpiCard
          label={t("kpiMonth", language)}
          value={formatDuration(monthTrackedMs)}
          icon={<ChartIcon className="h-5 w-5" />}
          accent="#8b5cf6"
        />
        <KpiCard
          label={t("kpiRunning", language)}
          value={formatDuration(activeSession ? elapsedMs : 0)}
          hint={activeSession?.taskName}
          icon={<ClockIcon className="h-5 w-5" />}
          accent="var(--success)"
          live={Boolean(activeSession)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <TimerWidget />

        <section className="surface flex flex-col p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{t("recentBookings", language)}</p>
            <Link
              to="/track"
              className="text-xs font-semibold"
              style={{ color: "var(--primary)" }}
            >
              {t("viewAll", language)}
            </Link>
          </div>

          {history.length === 0 ? (
            <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
              {t("noSessionsSaved", language)}
            </p>
          ) : (
            <ul
              className="mt-3 flex flex-col divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {history.slice(0, 6).map((entry) => {
                const tag = entry.tagId
                  ? tags.find((item) => item.id === entry.tagId)
                  : undefined;
                return (
                  <li key={entry.id} className="flex items-center gap-3 py-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background: tag?.color ?? "var(--border-strong)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {entry.taskName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        {formatDateTime(entry.endTimestamp)}
                      </p>
                    </div>
                    <span
                      className="mono-face shrink-0 text-sm font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatDuration(
                        getRoundedDurationMs(
                          entry.durationMs,
                          roundingConfig.enabled,
                          roundingConfig.intervalMinutes,
                        ),
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="eyebrow">{t("weeklyOverview", language)}</p>
            <p
              className="mt-0.5 text-xs"
              style={{ color: "var(--text-subtle)" }}
            >
              {t("chartTrendSubtitle", language)}
            </p>
          </div>
        </div>
        <TrendChart data={trend} language={language} />
      </section>
    </div>
  );
}
