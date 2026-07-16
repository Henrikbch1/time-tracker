import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../context/ProfileContext";
import { useTracker } from "../../context/TrackerContext";
import { formatDuration } from "../../lib/time";
import t from "../../i18n";
import {
  BellIcon,
  GlobeIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  TagIcon,
  ClockIcon,
} from "../icons";

interface TopNavbarProps {
  onOpenMenu: () => void;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  tone: "success" | "warning" | "info";
}

interface SearchHit {
  type: "task" | "tag";
  label: string;
}

export function TopNavbar({ onOpenMenu }: TopNavbarProps) {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { profile, initials } = useProfile();
  const {
    history,
    tags,
    activeSession,
    pausedSessions,
    elapsedMs,
    todayTrackedMs,
    dailyGoalHours,
  } = useTracker();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(
    null,
  );
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];
    const goalMs = dailyGoalHours * 3_600_000;

    if (goalMs > 0) {
      if (todayTrackedMs >= goalMs) {
        items.push({
          id: "goal-reached",
          title: t("notifGoalReachedTitle", language),
          body: t("notifGoalReachedBody", language),
          tone: "success",
        });
      } else {
        items.push({
          id: "goal-behind",
          title: t("notifGoalBehindTitle", language),
          body: `${formatDuration(goalMs - todayTrackedMs)} ${t("notifRemainingToGoal", language)}`,
          tone: "info",
        });
      }
    }

    if (activeSession && elapsedMs > 4 * 3_600_000) {
      items.push({
        id: "long-timer",
        title: t("notifLongTimerTitle", language),
        body: t("notifLongTimerBody", language),
        tone: "warning",
      });
    }

    if (pausedSessions.length > 0) {
      items.push({
        id: "paused",
        title: t("notifPausedTitle", language),
        body: `${pausedSessions.length} ${t("notifPausedBody", language)}`,
        tone: "info",
      });
    }

    return items.filter((item) => !dismissed.has(item.id));
  }, [
    dailyGoalHours,
    todayTrackedMs,
    activeSession,
    elapsedMs,
    pausedSessions.length,
    language,
    dismissed,
  ]);

  const searchHits = useMemo<SearchHit[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const taskNames = new Set<string>();
    for (const entry of history) taskNames.add(entry.taskName);
    for (const paused of pausedSessions) taskNames.add(paused.taskName);
    if (activeSession) taskNames.add(activeSession.taskName);

    const taskHits: SearchHit[] = [...taskNames]
      .filter((name) => name.toLowerCase().includes(trimmed))
      .slice(0, 5)
      .map((label) => ({ type: "task", label }));

    const tagHits: SearchHit[] = tags
      .filter((tag) => tag.name.toLowerCase().includes(trimmed))
      .slice(0, 3)
      .map((tag) => ({ type: "tag", label: tag.name }));

    return [...taskHits, ...tagHits];
  }, [query, history, pausedSessions, activeSession, tags]);

  const runSearch = (value: string) => {
    setSearchOpen(false);
    setQuery(value);
    navigate(`/track?q=${encodeURIComponent(value)}`);
  };

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 sm:px-6"
      style={{
        background: "color-mix(in srgb, var(--surface) 88%, transparent)",
        borderColor: "var(--border)",
        backdropFilter: "blur(10px)",
      }}
    >
      <button
        type="button"
        onClick={onOpenMenu}
        className="ghost-button lg:hidden"
        aria-label={t("openMenu", language)}
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-subtle)" }}
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim())
                runSearch(query.trim());
            }}
            placeholder={t("searchPlaceholder", language)}
            className="field pl-9"
            aria-label={t("searchPlaceholder", language)}
          />
        </div>

        {searchOpen && query.trim() ? (
          <div
            className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border shadow-[var(--shadow-pop)]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {searchHits.length === 0 ? (
              <p
                className="px-4 py-3 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {t("searchNoResults", language)}
              </p>
            ) : (
              <ul className="max-h-72 overflow-y-auto py-1">
                {searchHits.map((hit) => (
                  <li key={`${hit.type}-${hit.label}`}>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        runSearch(hit.label);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[var(--surface-2)]"
                      style={{ color: "var(--text)" }}
                    >
                      {hit.type === "tag" ? (
                        <TagIcon
                          className="h-4 w-4"
                          style={{ color: "var(--text-subtle)" }}
                        />
                      ) : (
                        <ClockIcon
                          className="h-4 w-4"
                          style={{ color: "var(--text-subtle)" }}
                        />
                      )}
                      <span className="truncate">{hit.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleLanguage}
          className="ghost-button"
          aria-label={t("languageSection", language)}
          title={language === "en" ? "EN" : "DE"}
        >
          <GlobeIcon className="h-5 w-5" />
          <span className="mono-face text-xs font-semibold uppercase">
            {language}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="ghost-button"
          aria-label={
            theme === "dark"
              ? t("lightMode", language)
              : t("darkMode", language)
          }
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) =>
                prev === "notifications" ? null : "notifications",
              )
            }
            className="ghost-button relative"
            aria-label={t("notifications", language)}
          >
            <BellIcon className="h-5 w-5" />
            {notifications.length > 0 ? (
              <span
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-bold text-white"
                style={{ background: "var(--danger)" }}
              >
                {notifications.length}
              </span>
            ) : null}
          </button>

          {openMenu === "notifications" ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30 cursor-default"
                aria-hidden
                onClick={() => setOpenMenu(null)}
              />
              <div
                className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-xl border shadow-[var(--shadow-pop)]"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {t("notifications", language)}
                  </p>
                </div>
                {notifications.length === 0 ? (
                  <p
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t("notificationsEmpty", language)}
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <li
                        key={item.id}
                        className="border-b px-4 py-3 last:border-b-0"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1 h-2 w-2 shrink-0 rounded-full"
                            style={{
                              background:
                                item.tone === "success"
                                  ? "var(--success)"
                                  : item.tone === "warning"
                                    ? "var(--warning)"
                                    : "var(--primary)",
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-medium"
                              style={{ color: "var(--text)" }}
                            >
                              {item.title}
                            </p>
                            <p
                              className="mt-0.5 text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {item.body}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDismissed((prev) => new Set(prev).add(item.id))
                            }
                            className="text-xs"
                            style={{ color: "var(--text-subtle)" }}
                            aria-label="dismiss"
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === "profile" ? null : "profile"))
            }
            className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2 transition hover:bg-[var(--surface-2)]"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: profile.color || "var(--primary)" }}
            >
              {initials}
            </span>
          </button>

          {openMenu === "profile" ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30 cursor-default"
                aria-hidden
                onClick={() => setOpenMenu(null)}
              />
              <div
                className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-xl border shadow-[var(--shadow-pop)]"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="px-4 py-3">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {profile.name || t("profileMenu", language)}
                  </p>
                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {t("signedInLocally", language)}
                  </p>
                </div>
                <div
                  className="border-t p-1"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-2)]"
                    style={{ color: "var(--text)" }}
                  >
                    {t("navSettings", language)}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
