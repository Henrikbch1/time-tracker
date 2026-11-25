import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTracker } from "../context/TrackerContext";
import { deltaColor, formatHM, formatSignedHM } from "../lib/overtime";
import t from "../i18n";

const PAGE = 14;

export default function OvertimeTable() {
  const { language } = useLanguage();
  const { overtime } = useTracker();
  const [visible, setVisible] = useState(PAGE);

  // Running balance after each day (days are newest first).
  const rows = useMemo(
    () =>
      overtime.days.map((day, index) => ({
        ...day,
        balanceMs:
          overtime.totalMs -
          overtime.days
            .slice(0, index)
            .reduce((sum, previous) => sum + previous.deltaMs, 0),
      })),
    [overtime],
  );

  const dateFormat = new Intl.DateTimeFormat(
    language === "de" ? "de-DE" : "en-GB",
    { weekday: "short", day: "2-digit", month: "2-digit" },
  );

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t("overtimeTableTitle", language)}</p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-subtle)" }}>
            {t("overtimeTableSubtitle", language)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t("overtimeBalance", language)}
          </p>
          <p
            className="mono-face text-2xl font-semibold"
            style={{ color: deltaColor(overtime.untilYesterdayMs) }}
          >
            {formatSignedHM(overtime.untilYesterdayMs)}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("noSessionsSaved", language)}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr
                className="border-b text-left text-xs"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                <th className="py-2 pr-2 font-medium">
                  {t("colDay", language)}
                </th>
                <th className="py-2 pr-2 text-right font-medium">
                  {t("trackedLabel", language)}
                </th>
                <th className="py-2 pr-2 text-right font-medium">
                  {t("targetLabel", language)}
                </th>
                <th className="py-2 pr-2 text-right font-medium">
                  {t("colDelta", language)}
                </th>
                <th className="py-2 text-right font-medium">
                  {t("colBalance", language)}
                </th>
              </tr>
            </thead>
            <tbody className="mono-face">
              {rows.slice(0, visible).map((row) => (
                <tr
                  key={row.dayKey}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td
                    className="whitespace-nowrap py-2 pr-2 font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    {dateFormat.format(row.dayTimestamp)}
                    {row.dayKey === overtime.today.dayKey ? (
                      <span
                        className="block text-[0.65rem] leading-none"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        ({t("today", language)})
                      </span>
                    ) : null}
                  </td>
                  <td
                    className="whitespace-nowrap py-2 pr-2 text-right"
                    style={{ color: "var(--text)" }}
                  >
                    {formatHM(row.trackedMs, false)}
                  </td>
                  <td
                    className="whitespace-nowrap py-2 pr-2 text-right"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatHM(row.targetMs, false)}
                  </td>
                  <td
                    className="whitespace-nowrap py-2 pr-2 text-right font-semibold"
                    style={{ color: deltaColor(row.deltaMs) }}
                  >
                    {formatSignedHM(row.deltaMs, false)}
                  </td>
                  <td
                    className="whitespace-nowrap py-2 text-right"
                    style={{ color: deltaColor(row.balanceMs) }}
                  >
                    {formatSignedHM(row.balanceMs, false)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > visible ? (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              className="ghost-button mt-2 w-full"
            >
              {t("showMore", language)}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
