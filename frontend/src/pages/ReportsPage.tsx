import { useLanguage } from "../context/LanguageContext";
import { useTracker } from "../context/TrackerContext";
import {
  CategoryBarChart,
  DistributionPie,
  TrendChart,
} from "../components/Charts";
import { ExportMenu } from "../components/ExportMenu";
import KpiCard from "../components/KpiCard";
import { formatDuration } from "../lib/time";
import {
  colorByIndex,
  dailyTrend,
  resolveTagName,
  toCategorySeries,
} from "../lib/stats";
import { ChartIcon, ClockIcon } from "../components/icons";
import t from "../i18n";

export default function ReportsPage() {
  const { language } = useLanguage();
  const {
    history,
    tags,
    now,
    totalsByTask,
    totalsByTag,
    totalTrackedMs,
    weekTrackedMs,
    monthTrackedMs,
  } = useTracker();

  const trend = dailyTrend(history, now, 14);

  const taskSeries = toCategorySeries(
    totalsByTask,
    (key) => key,
    (_key, index) => colorByIndex(index),
  ).slice(0, 8);

  const tagSeries = toCategorySeries(
    totalsByTag,
    (key) => resolveTagName(key, tags, t("deletedLabel", language)),
    (key) => tags.find((tag) => tag.id === key)?.color ?? colorByIndex(0),
  ).slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="display-face text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--text)" }}
          >
            {t("reportsTitle", language)}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {t("reportsSubtitle", language)}
          </p>
        </div>
        <ExportMenu history={history} tags={tags} language={language} />
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard
          label={t("kpiTotalTracked", language)}
          value={formatDuration(totalTrackedMs)}
          icon={<ClockIcon className="h-5 w-5" />}
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
      </div>

      <section className="surface p-5">
        <div className="mb-3">
          <p className="eyebrow">{t("chartTrendTitle", language)}</p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-subtle)" }}>
            {t("chartTrendSubtitle", language)}
          </p>
        </div>
        <TrendChart data={trend} language={language} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-5">
          <p className="eyebrow mb-4">{t("chartByTaskTitle", language)}</p>
          <CategoryBarChart data={taskSeries} language={language} />
        </section>

        <section className="surface p-5">
          <p className="eyebrow mb-4">
            {t("chartByTagTitle", language)} ·{" "}
            {t("chartDistribution", language)}
          </p>
          <DistributionPie data={tagSeries} language={language} />
          {tagSeries.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {tagSeries.map((slice) => (
                <div key={slice.id} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: slice.color }}
                  />
                  <span
                    className="min-w-0 flex-1 truncate text-sm"
                    style={{ color: "var(--text)" }}
                  >
                    {slice.name}
                  </span>
                  <span
                    className="mono-face text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatDuration(slice.ms)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
