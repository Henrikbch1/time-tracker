import t from "../i18n";
import type { Tag } from "../lib/cookies";
import { formatDuration } from "../lib/time";
import type { Language } from "../lib/cookies";

interface Props {
  tags: Tag[];
  totalsByTag: Record<string, number>;
  language: Language;
}

export default function TagSummary({ tags, totalsByTag, language }: Props) {
  const tagIds = Object.keys(totalsByTag);

  if (tagIds.length === 0) {
    return (
      <article className="stat-tile">
        <p className="eyebrow">{t("tagsSummary", language)}</p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {t("noTagsYet", language)}
        </p>
      </article>
    );
  }

  return (
    <article className="stat-tile">
      <p className="eyebrow">{t("tagsSummary", language)}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tagIds.map((id) => {
          const tag = tags.find((t) => t.id === id);
          return (
            <div
              key={id}
              className="surface-muted flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  style={{ background: tag?.color ?? "transparent" }}
                  className="inline-block h-3 w-3 shrink-0 rounded-full border border-slate-200 dark:border-white/10"
                />
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {tag?.name ?? t("deletedLabel", language)}
                </span>
              </div>
              <div className="shrink-0 text-sm text-slate-700 dark:text-slate-200">
                {formatDuration(totalsByTag[id])}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
