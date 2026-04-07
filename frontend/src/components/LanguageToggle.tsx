import { type Language } from '../utils/cookies'

interface LanguageToggleProps {
  language: Language
  onToggle: () => void
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="action-button gap-2"
      aria-label={`Switch to ${language === 'en' ? 'Deutsch' : 'English'}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        {language === 'en' ? 'EN' : 'DE'}
      </span>
      <span className="mono-face text-xs uppercase tracking-[0.24em]">
        {language === 'en' ? 'English' : 'Deutsch'}
      </span>
    </button>
  )
}

export default LanguageToggle
