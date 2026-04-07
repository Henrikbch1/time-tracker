import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import type { Tag, Language } from '../utils/cookies'
import { writeDailyGoal, writeWorkdays } from '../utils/cookies'
import t from '../i18n'

interface Props {
  theme: string
  setTheme: (mode: 'dark' | 'light') => void
  language: Language
  setLanguage: (lang: Language) => void
  tags: Tag[]
  setTags: (tags: Tag[]) => void
  onClose: () => void
  dailyGoalHours: number
  setDailyGoalHours: (n: number) => void
  workdays: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', number>
  setWorkdays: (m: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', number>) => void
}

export default function Settings({ theme, setTheme, language, setLanguage, tags, setTags, onClose, dailyGoalHours, setDailyGoalHours, workdays, setWorkdays }: Props) {
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#7c3aed')
  // local copies for settings
  const [goalHours, setGoalHours] = useState<number>(dailyGoalHours ?? 8)
  const [localWorkdays, setLocalWorkdays] = useState(() => workdays ?? { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 })
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{t('settingsHeader', language)}</h2>
        <button onClick={onClose} className="action-button">
          ×
        </button>
      </div>

      <section className="surface mb-4 p-4">
        <p className="eyebrow">{t('themeSection', language)}</p>
        <div className="mt-4">
          <ThemeToggle mode={theme as any} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} language={language} />
        </div>
      </section>

      <section className="surface mb-4 p-4">
        <p className="eyebrow">{t('languageSection', language)}</p>
        <div className="mt-4">
          <LanguageToggle language={language} onToggle={() => setLanguage(language === 'en' ? 'de' : 'en')} />
        </div>
      </section>

      <section className="surface mb-4 p-4">
        <p className="eyebrow">{t('tagsSection', language)}</p>
        <div className="mt-4 flex flex-col gap-3">
          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder={t('tagNamePlaceholder', language)}
            className="rounded px-2 py-2 text-sm w-full"
            aria-label={t('tagNamePlaceholder', language)}
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
              aria-label={t('colorPicker', language)}
              id="settings-new-tag-color"
            />
          </div>
          <button
            type="button"
            className="primary-button w-full sm:w-auto"
            onClick={() => {
              const name = newTagName.trim()
              const color = newTagColor || '#7c3aed'
              if (!name) return
              const newTag: Tag = { id: `${Date.now()}`, name, color }
              setTags([newTag, ...tags])
              setNewTagName('')
              setNewTagColor('#7c3aed')
            }}
          >
            {t('addTag', language)}
          </button>

          <div className="mt-2 flex flex-col gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between gap-3 rounded px-2 py-2 border">
                <div className="flex items-center gap-3">
                  <span style={{ background: tag.color }} className="w-3 h-3 inline-block rounded-full border border-slate-200 dark:border-white/10" />
                  <span className="text-sm">{tag.name}</span>
                </div>
                <div>
                  <button
                    onClick={() => setTags(tags.filter((t) => t.id !== tag.id))}
                    className="text-xs text-red-600"
                    aria-label={`Delete ${tag.name}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="surface mb-4 p-4">
        <p className="eyebrow">{t('workGoalSection', language)}</p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm">{t('dailyGoalLabel', language)}</label>
            <input type="number" min={0} max={24} value={goalHours} onChange={(e) => setGoalHours(Number(e.target.value) || 0)} className="w-20 rounded px-2 py-1" />
            <span className="text-sm text-slate-600">{t('hours', language)}</span>
          </div>

          <div>
            <p className="text-sm text-slate-600">{t('workdaysLabel', language)}</p>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {['mon','tue','wed','thu','fri','sat','sun'].map((k, i) => (
                <div key={k} className="flex flex-col items-center">
                  <div className="text-xs">{['Mo','Di','Mi','Do','Fr','Sa','So'][i]}</div>
                  <input type="number" min={0} max={24} value={(localWorkdays as any)[k]} onChange={(e) => setLocalWorkdays((w) => ({ ...w, [k]: Number(e.target.value) || 0 }))} className="w-16 rounded px-1 py-1 text-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" className="primary-button" onClick={() => {
              // persist and lift up (keep settings open)
              setDailyGoalHours(goalHours)
              setWorkdays(localWorkdays)
              writeDailyGoal(goalHours)
              writeWorkdays(localWorkdays)
            }}>{t('save', language)}</button>
          </div>
        </div>
      </section>
    </div>
  )
}
