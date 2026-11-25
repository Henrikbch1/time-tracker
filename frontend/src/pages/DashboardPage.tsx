import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { useTracker } from "../context/TrackerContext";
import KpiCard from "../components/KpiCard";
import TimerWidget from "../components/TimerWidget";
import TodaySummary from "../components/TodaySummary";
import { TrendChart } from "../components/Charts";
import { dailyTrend } from "../lib/stats";
import { deltaColor, formatHM, formatSignedHM } from "../lib/overtime";
import { BalanceIcon, ChartIcon } from "../components/icons";
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
    now,
    weekTrackedMs,
    monthTrackedMs,
    roundingConfig,
    overtime,
  } = useTracker();

  const name = profile.name.trim();
  const trend = dailyTrend(history, now, 14, roundingConfig);
  const today = new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {today}
        </p>
        <h1
          className="display-face mt-0.5 text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--text)" }}
        >
          {t(greetingKey(), language)}
          {name ? `, ${name}` : ""}
        </h1>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <TimerWidget />
        <TodaySummary />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard
          label={t("overtimeBalance", language)}
          value={formatSignedHM(overtime.untilYesterdayMs)}
          valueColor={deltaColor(overtime.untilYesterdayMs)}
          hint={`${t("inclToday", language)}: ${formatSignedHM(overtime.totalMs)}`}
          icon={<BalanceIcon className="h-5 w-5" />}
          accent="var(--success)"
          className="col-span-2 lg:col-span-1"
        />
        <KpiCard
          label={t("kpiWeek", language)}
          value={formatHM(weekTrackedMs)}
          hint={`${t("colBalance", language)} ${formatSignedHM(overtime.weekMs)}`}
          hintColor={deltaColor(overtime.weekMs)}
          icon={<ChartIcon className="h-5 w-5" />}
          accent="var(--accent)"
        />
        <KpiCard
          label={t("kpiMonth", language)}
          value={formatHM(monthTrackedMs)}
          hint={`${t("colBalance", language)} ${formatSignedHM(overtime.monthMs)}`}
          hintColor={deltaColor(overtime.monthMs)}
          icon={<ChartIcon className="h-5 w-5" />}
          accent="#8b5cf6"
        />
      </div>

      <section className="surface p-5">
        <div className="mb-3">
          <p className="eyebrow">{t("weeklyOverview", language)}</p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-subtle)" }}>
            {t("chartTrendSubtitle", language)}
          </p>
        </div>
        <TrendChart data={trend} language={language} />
      </section>
    </div>
  );
}
