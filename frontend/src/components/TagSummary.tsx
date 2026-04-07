import t from '../i18n'
import type { Tag } from '../utils/cookies'
import { formatDuration } from '../utils/time'
import type { Language } from '../utils/cookies'

interface Props {
  tags: Tag[]
  totalsByTag: Record<string, number>
  language: Language
}

export default function TagSummary({ tags, totalsByTag, language }: Props) {
  const tagIds = Object.keys(totalsByTag)

  if (tagIds.length === 0) {
    return (
      <article className="stat-tile">
        <p className="eyebrow">{t('tagsSummary', language)}</p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('noTagsYet', language)}</p>
      </article>
    )
  }

  return (
    <article className="stat-tile">
      <p className="eyebrow">{t('tagsSummary', language)}</p>
      <div className="mt-4 flex flex-col gap-2">
        {tagIds.map((id) => {
          const tag = tags.find((t) => t.id === id)
          return (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  style={{ background: tag?.color ?? 'transparent' }}
                  className="inline-block w-3 h-3 rounded-full border border-slate-200 dark:border-white/10"
                />
                <span className="text-sm font-medium">{tag?.name ?? t('deletedLabel', language)}</span>
              </div>
              <div className="text-sm">{formatDuration(totalsByTag[id])}</div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
