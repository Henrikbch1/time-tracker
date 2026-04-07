import Cookies from 'js-cookie'

export interface ActiveSession {
  taskName: string
  startTimestamp: number
}

export interface HistoryEntry {
  id: string
  taskName: string
  startTimestamp: number
  endTimestamp: number
  durationMs: number
}

export type ThemeMode = 'light' | 'dark'

const ACTIVE_SESSION_COOKIE = 'hookie.active-session'
const HISTORY_COOKIE = 'hookie.history'
const THEME_COOKIE = 'hookie.theme'
const HISTORY_CHAR_LIMIT = 3_200
const COOKIE_PATH = import.meta.env.BASE_URL || '/'
const COOKIE_WRITE_OPTIONS = {
  expires: 365,
  path: COOKIE_PATH,
  sameSite: 'lax' as const,
}
const COOKIE_REMOVE_OPTIONS = {
  path: COOKIE_PATH,
}

function safeParseJson<T>(value: string | undefined) {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function isActiveSession(value: unknown): value is ActiveSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ActiveSession>

  return (
    typeof candidate.taskName === 'string' &&
    candidate.taskName.trim().length > 0 &&
    isFiniteNumber(candidate.startTimestamp)
  )
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<HistoryEntry>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.taskName === 'string' &&
    candidate.taskName.trim().length > 0 &&
    isFiniteNumber(candidate.startTimestamp) &&
    isFiniteNumber(candidate.endTimestamp) &&
    isFiniteNumber(candidate.durationMs)
  )
}

function getSerializedSize(value: string) {
  return encodeURIComponent(value).length
}

export function limitHistoryEntries(entries: HistoryEntry[]) {
  let trimmedEntries = [...entries]

  while (trimmedEntries.length > 0) {
    const serializedEntries = JSON.stringify(trimmedEntries)

    if (getSerializedSize(serializedEntries) <= HISTORY_CHAR_LIMIT) {
      return trimmedEntries
    }

    trimmedEntries = trimmedEntries.slice(0, -1)
  }

  return []
}

export function readActiveSession() {
  const parsedSession = safeParseJson<unknown>(Cookies.get(ACTIVE_SESSION_COOKIE))

  if (!isActiveSession(parsedSession)) {
    return null
  }

  return parsedSession
}

export function writeActiveSession(activeSession: ActiveSession) {
  Cookies.set(ACTIVE_SESSION_COOKIE, JSON.stringify(activeSession), COOKIE_WRITE_OPTIONS)
}

export function clearActiveSession() {
  Cookies.remove(ACTIVE_SESSION_COOKIE, COOKIE_REMOVE_OPTIONS)
}

export function readHistory() {
  const parsedHistory = safeParseJson<unknown>(Cookies.get(HISTORY_COOKIE))

  if (!Array.isArray(parsedHistory)) {
    return []
  }

  return parsedHistory.filter(isHistoryEntry)
}

export function writeHistory(history: HistoryEntry[]) {
  const trimmedHistory = limitHistoryEntries(history)

  if (trimmedHistory.length === 0) {
    Cookies.remove(HISTORY_COOKIE, COOKIE_REMOVE_OPTIONS)
    return
  }

  Cookies.set(HISTORY_COOKIE, JSON.stringify(trimmedHistory), COOKIE_WRITE_OPTIONS)
}

export function readTheme() {
  const theme = Cookies.get(THEME_COOKIE)

  if (!isThemeMode(theme)) {
    return null
  }

  return theme
}

export function writeTheme(theme: ThemeMode) {
  Cookies.set(THEME_COOKIE, theme, COOKIE_WRITE_OPTIONS)
}

export type Language = 'en' | 'de'

const LANG_COOKIE = 'hookie.lang'

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'de'
}

export function readLanguage() {
  const lang = Cookies.get(LANG_COOKIE)

  if (!isLanguage(lang)) {
    return null
  }

  return lang
}

export function writeLanguage(lang: Language) {
  Cookies.set(LANG_COOKIE, lang, COOKIE_WRITE_OPTIONS)
}