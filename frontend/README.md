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

- Version: siehe `package.json`
- Entrypoint: `src/main.tsx`
- Styling: Tailwind CSS

Aktueller Stand:

- Export ist aktuell als einfacher `.txt`-Export umgesetzt.
- Eine dedizierte manuelle Zeiteingabe per Formular ist derzeit nicht vorhanden.

## Tracking-Workflow

1. Aufgabe eingeben und optional einen Tag auswaehlen.
2. Session per `Start` beginnen.
3. Laufende Zeit wird live angezeigt.
4. Session per `Stop` beenden.
5. Eintrag landet in der Historie und fliesst in Reports/Charts ein.

Hinweise:

- Es ist immer nur eine aktive Session moeglich.
- Pause/Resume ist aktuell nicht enthalten.

## Feature-Einblick

- Dashboard mit KPI-Karten fuer Tages-/Wochenwerte.
- Reports mit grafischen Auswertungen (z. B. Balken/Kreis).
- Historie mit Bearbeitungsmoeglichkeiten.
- Tag-Management fuer Aufgaben.
- Theme-Umschaltung und Spracheinstellungen.
- Datenexport (aktuell `.txt`).

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
