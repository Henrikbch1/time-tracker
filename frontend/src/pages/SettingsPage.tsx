import { useState, useEffect } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import LanguageToggle from "../components/LanguageToggle";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { useTracker } from "../context/TrackerContext";
import { writeDailyGoal, writeWorkdays, type Tag } from "../lib/cookies";
import { PlusIcon } from "../components/icons";
import t from "../i18n";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { profile, setProfile, initials } = useProfile();
  const {
    tags,
    setTags,
    dailyGoalHours,
    setDailyGoalHours,
    workdays,
    setWorkdays,
    roundingConfig,
    setRoundingConfig,
    exportConfig,
    setExportConfig,
    handleClearHistory,
  } = useTracker();

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#4f46e5");
  const [goalHours, setGoalHours] = useState<number>(dailyGoalHours);
  const [localWorkdays, setLocalWorkdays] = useState(() => workdays);

  // Rounding settings - auto-save
  const [localRounding, setLocalRounding] = useState(roundingConfig);

  // Export config settings - auto-save
  const [localExportConfig, setLocalExportConfig] = useState(exportConfig);

  // Auto-save rounding config
  useEffect(() => {
    setRoundingConfig(localRounding);
  }, [localRounding, setRoundingConfig]);

  // Auto-save export config
  useEffect(() => {
    setExportConfig(localExportConfig);
  }, [localExportConfig, setExportConfig]);

  // Auto-save workdays
  useEffect(() => {
    setDailyGoalHours(goalHours);
    writeDailyGoal(goalHours);
  }, [goalHours, setDailyGoalHours]);

  useEffect(() => {
    setWorkdays(localWorkdays);
    writeWorkdays(localWorkdays);
  }, [localWorkdays, setWorkdays]);

  const weekdayKeys = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ] as const;
  const weekdayLabels = [
    t("dayShortMon", language),
    t("dayShortTue", language),
    t("dayShortWed", language),
    t("dayShortThu", language),
    t("dayShortFri", language),
    t("dayShortSat", language),
    t("dayShortSun", language),
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1
          className="display-face text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--text)" }}
        >
          {t("settingsHeader", language)}
        </h1>
      </header>

      {/* Profile */}
      <section className="surface p-5 sm:p-6">
        <p className="eyebrow">{t("profileSection", language)}</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-white"
            style={{ background: profile.color || "var(--primary)" }}
          >
            {initials}
          </span>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className="eyebrow">{t("displayNameLabel", language)}</span>
              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile({ ...profile, name: event.target.value })
                }
                placeholder={t("displayNamePlaceholder", language)}
                className="field mt-1.5"
              />
            </label>
            <label className="block">
              <span className="eyebrow">{t("avatarColorLabel", language)}</span>
              <input
                type="color"
                value={profile.color}
                onChange={(event) =>
                  setProfile({ ...profile, color: event.target.value })
                }
                className="mt-1.5 h-11 w-16 cursor-pointer rounded-lg border"
                style={{ borderColor: "var(--border)" }}
                aria-label={t("avatarColorLabel", language)}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="surface p-5 sm:p-6">
        <p className="eyebrow">{t("themeSection", language)}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ThemeToggle
            mode={theme}
            onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            language={language}
          />
          <LanguageToggle
            language={language}
            onToggle={() => setLanguage(language === "en" ? "de" : "en")}
          />
        </div>
      </section>

      {/* Tags */}
      <section className="surface p-5 sm:p-6">
        <p className="eyebrow">{t("tagsSection", language)}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            placeholder={t("tagNamePlaceholder", language)}
            className="field flex-1"
            aria-label={t("tagNamePlaceholder", language)}
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(event) => setNewTagColor(event.target.value)}
            className="h-11 w-14 cursor-pointer rounded-lg border"
            style={{ borderColor: "var(--border)" }}
            aria-label={t("colorPicker", language)}
          />
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              const name = newTagName.trim();
              const color = newTagColor || "#4f46e5";
              if (!name) return;
              const newTag: Tag = { id: `${Date.now()}`, name, color };
              setTags([newTag, ...tags]);
              setNewTagName("");
              setNewTagColor("#4f46e5");
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t("addTag", language)}
          </button>
        </div>

        {tags.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{ background: tag.color }}
                    className="inline-block h-3 w-3 rounded-full"
                  />
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {tag.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((tg) => tg.id !== tag.id))}
                  className="text-sm"
                  style={{ color: "var(--danger)" }}
                  aria-label={`Delete ${tag.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
            {t("noTagsYet", language)}
          </p>
        )}
      </section>

      {/* Rounding & Export */}
      <section className="surface p-5 sm:p-6">
        <p className="eyebrow">{t("roundingExportSection", language)}</p>
        <div className="mt-4 flex flex-col gap-4">
          {/* Rounding Section */}
          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rounding-enabled"
                checked={localRounding.enabled}
                onChange={(event) =>
                  setLocalRounding({
                    ...localRounding,
                    enabled: event.target.checked,
                  })
                }
                className="h-4 w-4 cursor-pointer"
              />
              <label
                htmlFor="rounding-enabled"
                className="text-sm font-medium cursor-pointer"
                style={{ color: "var(--text)" }}
              >
                {t("roundingEnabledLabel", language)}
              </label>
            </div>
            <p className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>
              {t("roundingHelp", language)}
            </p>
          </div>

          {localRounding.enabled && (
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: "var(--text)" }}
              >
                {t("roundingModeLabel", language)}
              </label>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  { value: 0, label: t("roundingNone", language) },
                  { value: 5, label: t("rounding5min", language) },
                  { value: 10, label: t("rounding10min", language) },
                  { value: 15, label: t("rounding15min", language) },
                  { value: -1, label: t("roundingCustom", language) },
                ].map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rounding-mode"
                      id={`rounding-${option.value}`}
                      checked={
                        option.value === -1
                          ? localRounding.intervalMinutes !== 0 &&
                            localRounding.intervalMinutes !== 5 &&
                            localRounding.intervalMinutes !== 10 &&
                            localRounding.intervalMinutes !== 15
                          : localRounding.intervalMinutes === option.value
                      }
                      onChange={() => {
                        if (option.value !== -1) {
                          setLocalRounding({
                            ...localRounding,
                            intervalMinutes: option.value,
                          });
                        }
                      }}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <label
                      htmlFor={`rounding-${option.value}`}
                      className="text-sm cursor-pointer"
                      style={{ color: "var(--text)" }}
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>

              {localRounding.enabled &&
                localRounding.intervalMinutes !== 0 &&
                localRounding.intervalMinutes !== 5 &&
                localRounding.intervalMinutes !== 10 &&
                localRounding.intervalMinutes !== 15 && (
                  <div className="mt-3">
                    <label
                      className="text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      {t("roundingCustomLabel", language)}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={localRounding.intervalMinutes}
                      onChange={(event) => {
                        const v = Number(event.target.value);
                        if (Number.isFinite(v) && v > 0 && v <= 60) {
                          setLocalRounding({
                            ...localRounding,
                            intervalMinutes: v,
                          });
                        }
                      }}
                      className="field mt-1.5 w-32"
                    />
                  </div>
                )}
            </div>
          )}

          {/* Export Format Section */}
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            <p
              className="mt-4 text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              {t("exportFormatLabel", language)}
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              {[
                {
                  value: "textBlock" as const,
                  label: t("exportFormatTextBlock", language),
                },
                {
                  value: "table" as const,
                  label: t("exportFormatTable", language),
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="export-format"
                    checked={localExportConfig.format === option.value}
                    onChange={() =>
                      setLocalExportConfig({
                        ...localExportConfig,
                        format: option.value,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {t("exportTimeFormatLabel", language)}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {[
                {
                  value: "HH:MM" as const,
                  label: t("exportTimeFormatHHMM", language),
                },
                {
                  value: "H.H" as const,
                  label: t("exportTimeFormatHDecimal", language),
                },
                {
                  value: "minutes" as const,
                  label: t("exportTimeFormatMinutes", language),
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="export-time-format"
                    checked={localExportConfig.timeFormat === option.value}
                    onChange={() =>
                      setLocalExportConfig({
                        ...localExportConfig,
                        timeFormat: option.value,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localExportConfig.includeTaskName}
                onChange={(event) =>
                  setLocalExportConfig({
                    ...localExportConfig,
                    includeTaskName: event.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <span className="text-sm" style={{ color: "var(--text)" }}>
                {t("exportIncludeTaskLabel", language)}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localExportConfig.includeTag}
                onChange={(event) =>
                  setLocalExportConfig({
                    ...localExportConfig,
                    includeTag: event.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <span className="text-sm" style={{ color: "var(--text)" }}>
                {t("exportIncludeTagLabel", language)}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Work goals */}
      <section className="surface p-5 sm:p-6">
        <p className="eyebrow">{t("workGoalSection", language)}</p>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--text)" }}
              >
                {t("dailyGoalLabel", language)}
              </label>
              <input
                type="number"
                min={0}
                max={24}
                value={goalHours}
                onChange={(event) => {
                  const v = Number(event.target.value);
                  setGoalHours(
                    Number.isFinite(v) ? Math.max(0, Math.min(24, v)) : 0,
                  );
                }}
                className="field w-24"
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {t("hours", language)}
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
              {t("dailyGoalHelp", language)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {t("workdaysLabel", language)}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>
              {t("workdaysHelp", language)}
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {weekdayKeys.map((k, i) => (
                <div key={k} className="flex flex-col items-center gap-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {weekdayLabels[i]}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    value={localWorkdays[k]}
                    onChange={(event) => {
                      const v = Number(event.target.value);
                      const safe = Number.isFinite(v)
                        ? Math.max(0, Math.min(24, v))
                        : 0;
                      setLocalWorkdays((w) => ({ ...w, [k]: safe }));
                    }}
                    className="field w-full px-2 text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section
        className="surface p-5 sm:p-6"
        style={{ borderColor: "var(--danger)" }}
      >
        <p className="eyebrow" style={{ color: "var(--danger)" }}>
          {t("dangerZone", language)}
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("hardResetDescription", language)}
        </p>
        <button
          type="button"
          className="danger-button mt-4"
          onClick={handleClearHistory}
        >
          {t("hardReset", language)}
        </button>
      </section>
    </div>
  );
}
