import { type ThemeMode } from '../utils/cookies'

interface ThemeToggleProps {
  mode: ThemeMode
  onToggle: () => void
}

export function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="action-button gap-2"
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
      </span>
      <span className="mono-face text-xs uppercase tracking-[0.24em]">
        {mode === 'dark' ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 15.79A9 9 0 0 1 8.21 4a7 7 0 1 0 11.79 11.79Z" />
    </svg>
  )
}