import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTracker } from "../context/TrackerContext";
import TimerWidget from "../components/TimerWidget";
import HistoryPanel from "../components/HistoryPanel";
import { SearchIcon } from "../components/icons";
import t from "../i18n";
import type { HistoryEntry } from "../lib/cookies";

type SortMode = "newest" | "oldest" | "longest" | "shortest";

function sortEntries(entries: HistoryEntry[], mode: SortMode): HistoryEntry[] {
  const copy = [...entries];
  switch (mode) {
    case "oldest":
      return copy.sort((a, b) => a.endTimestamp - b.endTimestamp);
    case "longest":
      return copy.sort((a, b) => b.durationMs - a.durationMs);
    case "shortest":
      return copy.sort((a, b) => a.durationMs - b.durationMs);
    default:
      return copy.sort((a, b) => b.endTimestamp - a.endTimestamp);
  }
}

export default function TrackingPage() {
  const { language } = useLanguage();
  const { history, tags, handleUpdateHistoryEntry } = useTracker();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("q") ?? "";
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortMode>("newest");

  const setSearch = (value: string) => {
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matched = history.filter((entry) => {
      const matchesQuery =
        query.length === 0 || entry.taskName.toLowerCase().includes(query);
      const matchesTag = tagFilter === "all" || entry.tagId === tagFilter;
      return matchesQuery && matchesTag;
    });
    return sortEntries(matched, sort);
  }, [history, search, tagFilter, sort]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1
          className="display-face text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--text)" }}
        >
          {t("trackingTitle", language)}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {t("trackingSubtitle", language)}
        </p>
      </header>

      <TimerWidget />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-subtle)" }}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchEntries", language)}
            className="field pl-9"
          />
        </div>

        <select
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
          className="field sm:w-44"
          aria-label={t("filterAllTags", language)}
        >
          <option value="all">{t("filterAllTags", language)}</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          className="field sm:w-44"
          aria-label={t("sortLabel", language)}
        >
          <option value="newest">{t("sortNewest", language)}</option>
          <option value="oldest">{t("sortOldest", language)}</option>
          <option value="longest">{t("sortLongest", language)}</option>
          <option value="shortest">{t("sortShortest", language)}</option>
        </select>
      </div>

      <HistoryPanel
        history={filtered}
        allHistory={history}
        tags={tags}
        onUpdateEntry={handleUpdateHistoryEntry}
        language={language}
        title={t("statusCompleted", language)}
      />
    </div>
  );
}
