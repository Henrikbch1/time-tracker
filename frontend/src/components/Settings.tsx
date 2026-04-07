import React, { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import TagsManager from './TagsManager'
import type { Tag, Language } from '../utils/cookies'
import t from '../i18n'

interface Props {
  theme: string
  setTheme: (mode: 'dark' | 'light') => void
  language: Language
  setLanguage: (lang: Language) => void
  tags: Tag[]
  setTags: (tags: Tag[]) => void
  onClose: () => void
}

export default function Settings({ theme, setTheme, language, setLanguage, tags, setTags, onClose }: Props) {
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#7c3aed')
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

      <section className="surface p-4">
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
    </div>
  )
}
