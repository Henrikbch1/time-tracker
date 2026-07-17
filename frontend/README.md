# Frontend - React + TypeScript + Vite

Dieses Verzeichnis enthaelt die Frontend-Anwendung des Time Trackers.

Live-Demo: [Hookie | TimeTracker](https://henrikbch1.github.io/time-tracker/)

## Inhaltsverzeichnis

- [Kurzueberblick](#kurzueberblick)
- [Tracking-Workflow](#tracking-workflow)
- [Feature-Einblick](#feature-einblick)
- [Schnellstart](#schnellstart)
- [Wichtige Skripte](#wichtige-skripte)
- [Projektstruktur](#projektstruktur)
- [Entwicklung und Debugging](#entwicklung-und-debugging)
- [Build und Deploy](#build-und-deploy)
- [Internationalisierung (i18n)](#internationalisierung-i18n)
- [Mitwirken](#mitwirken)

## Kurzueberblick

- Version: `0.5.0`
- Entrypoint: `src/main.tsx`
- Styling: Tailwind CSS

Aktueller Stand:

- Export ist als CSV-, Excel- und PDF-Export umgesetzt; zusaetzlich gibt es einen kompakten Tagesexport zum Kopieren.
- Eine dedizierte manuelle Neueingabe gibt es nicht, bestehende Historieneintraege lassen sich aber nachtraeglich bearbeiten.

## Tracking-Workflow

1. Aufgabe eingeben und optional einen Tag auswaehlen.
2. Session per `Start` beginnen.
3. Laufende Zeit wird live angezeigt.
4. Session per `Stop` beenden.
5. Eintrag landet in der Historie und fliesst in Reports/Charts ein.

Hinweise:

- Es ist immer nur eine aktive Session moeglich.
- Aktive Sessions koennen pausiert, fortgesetzt oder direkt abgeschlossen werden.

## Feature-Einblick

- Timer-Widget mit Start, Pause, Resume und Stop fuer Aufgaben samt optionalen Tags.
- Favoriten und Quick-Start fuer haeufige Aufgaben.
- Dashboard mit Live-Timer, KPI-Karten und Wochen-Trend.
- Reports mit Trend-, Aufgaben- und Tag-Charts.
- Historie mit Suche, Tag-Filter, Sortierung und Bearbeitung bestehender Eintraege.
- Einstellungen fuer Profil, Tags, Tagesziele, Workdays, Rundung, Exportoptionen, Theme und Sprache.
- Export als CSV, Excel, PDF sowie kompakter Tagesexport zum Kopieren.

## Schnellstart

```bash
cd frontend
npm install
npm run dev
```

Oeffne dann die in der Konsole angezeigte URL (z. B. `http://localhost:5173`).

## Wichtige Skripte

- `npm run dev` - Startet Vite im Entwicklungsmodus
- `npm run build` - Baut Produktionsassets
- `npm run preview` - Lokale Vorschau des Builds
- `npm run deploy` - Deploy ueber `gh-pages` (nach Build)
- `npm run lint` - ESLint ausfuehren

## Projektstruktur

- `src/` - React-Komponenten, Contexts, Hooks und Utilities
- `public/` - Statische Assets (z. B. Icons, favicon)
- `index.html` - HTML-Template
- `vite.config.ts` - Vite-Konfiguration

## Entwicklung und Debugging

- Starte die App mit `npm run dev`.
- Nutze Browser-DevTools fuer UI- und Netzwerk-Debugging.
- Pruefe TypeScript- und ESLint-Hinweise vor dem Commit.

## Build und Deploy

1. `npm run build`
2. `npm run preview` zur lokalen Kontrolle
3. `npm run deploy` (wenn `gh-pages` eingerichtet ist)

Hinweis: Fuer reproduzierbare Builds ist `npm ci` mit Lockfile sinnvoll.

## Internationalisierung (i18n)

Die App unterstuetzt mehrere Sprachen. Bei neuen UI-Texten bitte die i18n-Ressourcen entsprechend erweitern.

## Mitwirken

- Issues fuer Fehler oder Feature-Ideen erstellen
- PRs mit klarer Beschreibung und Test-/Pruefschritten einreichen
