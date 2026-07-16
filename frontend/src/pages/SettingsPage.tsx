import { useState } from "react";
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
    handleClearHistory,
  } = useTracker();

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#4f46e5");
  const [goalHours, setGoalHours] = useState<number>(dailyGoalHours);
  const [localWorkdays, setLocalWorkdays] = useState(() => workdays);
  const [saved, setSaved] = useState(false);

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

          <div>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setDailyGoalHours(goalHours);
                setWorkdays(localWorkdays);
                writeDailyGoal(goalHours);
                writeWorkdays(localWorkdays);
                setSaved(true);
                window.setTimeout(() => setSaved(false), 2000);
              }}
              aria-live="polite"
            >
              {saved ? t("saved", language) : t("save", language)}
            </button>
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
