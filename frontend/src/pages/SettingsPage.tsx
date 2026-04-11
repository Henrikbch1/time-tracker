import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import LanguageToggle from "../components/LanguageToggle";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTracker } from "../context/TrackerContext";
import { writeDailyGoal, writeWorkdays, type Tag } from "../lib/cookies";
import t from "../i18n";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const {
    tags,
    setTags,
    dailyGoalHours,
    setDailyGoalHours,
    workdays,
    setWorkdays,
  } = useTracker();

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#7c3aed");
  const [goalHours, setGoalHours] = useState<number>(dailyGoalHours ?? 8);
  const [localWorkdays, setLocalWorkdays] = useState(
    () =>
      workdays ?? { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
  );
  const [saved, setSaved] = useState(false);

  return (
    <div className="relative isolate overflow-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {t("settingsHeader", language)}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="action-button"
              aria-label={t("closeLabel", language)}
            >
              ×
            </button>
          </div>

          <section className="surface mb-4 p-4">
            <p className="eyebrow">{t("themeSection", language)}</p>
            <div className="mt-4">
              <ThemeToggle
                mode={theme}
                onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
                language={language}
              />
            </div>
          </section>

          <section className="surface mb-4 p-4">
            <p className="eyebrow">{t("languageSection", language)}</p>
            <div className="mt-4">
              <LanguageToggle
                language={language}
                onToggle={() => setLanguage(language === "en" ? "de" : "en")}
              />
            </div>
          </section>

          <section className="surface mb-4 p-4">
            <p className="eyebrow">{t("tagsSection", language)}</p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={t("tagNamePlaceholder", language)}
                className="rounded px-2 py-2 text-sm w-full"
                aria-label={t("tagNamePlaceholder", language)}
                id="settings-new-tag-name"
              />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ background: newTagColor }}
                    aria-hidden
                  />
                  <svg
                    className="absolute -right-1 -bottom-1 w-4 h-4 text-white/90"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <path d="M15.232 5.232a3 3 0 114.243 4.243l-9.9 9.9a1 1 0 01-.464.263l-4.242 1.06a1 1 0 01-1.213-1.213l1.06-4.243a1 1 0 01.263-.464l9.9-9.9z" />
                    <path d="M20.485 10.485l-6.97-6.97" />
                  </svg>
                </div>
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-12 h-12 p-0"
                  aria-label={t("colorPicker", language)}
                  id="settings-new-tag-color"
                />
              </div>
              <button
                type="button"
                className="primary-button w-full sm:w-auto"
                onClick={() => {
                  const name = newTagName.trim();
                  const color = newTagColor || "#7c3aed";
                  if (!name) return;
                  const newTag: Tag = { id: `${Date.now()}`, name, color };
                  setTags([newTag, ...tags]);
                  setNewTagName("");
                  setNewTagColor("#7c3aed");
                }}
              >
                {t("addTag", language)}
              </button>

              <div className="mt-2 flex flex-col gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between gap-3 rounded px-2 py-2 border"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        style={{ background: tag.color }}
                        className="w-3 h-3 inline-block rounded-full border border-slate-200 dark:border-white/10"
                      />
                      <span className="text-sm">{tag.name}</span>
                    </div>
                    <button
                      onClick={() =>
                        setTags(tags.filter((tg) => tg.id !== tag.id))
                      }
                      className="text-xs text-red-600"
                      aria-label={`Delete ${tag.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="surface mb-4 p-4">
            <p className="eyebrow">{t("workGoalSection", language)}</p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">
                    {t("dailyGoalLabel", language)}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    value={goalHours}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGoalHours(
                        Number.isFinite(v) ? Math.max(0, Math.min(24, v)) : 0,
                      );
                    }}
                    className="w-20 rounded px-2 py-1"
                  />
                  <span className="text-sm text-slate-600">
                    {t("hours", language)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("dailyGoalHelp", language)}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">
                  {t("workdaysLabel", language)}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t("workdaysHelp", language)}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {(
                    ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
                  ).map((k, i) => (
                    <div key={k} className="flex flex-col items-center">
                      <div className="text-xs">
                        {
                          [
                            t("dayShortMon", language),
                            t("dayShortTue", language),
                            t("dayShortWed", language),
                            t("dayShortThu", language),
                            t("dayShortFri", language),
                            t("dayShortSat", language),
                            t("dayShortSun", language),
                          ][i]
                        }
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={localWorkdays[k]}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const safe = Number.isFinite(v)
                            ? Math.max(0, Math.min(24, v))
                            : 0;
                          setLocalWorkdays((w) => ({ ...w, [k]: safe }));
                        }}
                        className="w-16 rounded px-1 py-1 text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className={"primary-button" + (saved ? " opacity-90" : "")}
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
        </div>
      </main>
    </div>
  );
}
