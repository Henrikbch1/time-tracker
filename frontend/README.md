# Frontend — React + TypeScript + Vite

Dieses Verzeichnis enthält die Frontend-Anwendung der `Time Tracker`-App. Die folgenden Hinweise helfen beim lokalen Entwickeln, Bauen und Deployen.

Inhaltsverzeichnis

- [Kurzüberblick](#kurzüberblick)
- [Schnellstart](#schnellstart)
- [Wichtige Scripts](#wichtige-scripts)
- [Projektstruktur](#projektstruktur)
- [Entwicklung & Debugging](#entwicklung--debugging)
- [Build & Deploy](#build--deploy)
- [Internationale Unterstützung (i18n)](#internationale-unterst%C3%BCtzung-i18n)
- [Mitwirken](#mitwirken)

## Kurzüberblick

- Version: 0.4.3 (siehe `package.json`)
- Entrypoint: `src/main.tsx`

Hinweis: Styling erfolgt mit Tailwind CSS.

Aktueller Status: Export ist derzeit als einfacher `.txt`-Export implementiert; eine dedizierte manuelle Zeiteingabe (Formular) ist aktuell nicht vorhanden.

## Schnellstart

```bash
cd frontend
npm ci
npm run dev
# Öffne die in der Konsole angezeigte URL (z. B. http://localhost:5173)
```

npm install

- `npm run dev` — Startet Vite im Entwicklungsmodus
- `npm run build` — Baut Produktionsassets
- `npm run preview` — Vorschau des Builds
- `npm run deploy` — Deploy (z. B. über `gh-pages` nach erstem Build)
- `npm run lint` — ESLint prüfen
## Build & Deploy

## Projektstruktur

- `src/` — React-Komponenten, Hooks, Utilities
  - `components/` — UI-Komponenten (TrackerCard, Settings, Panels)
Hinweis: `npm install` ist üblich; `npm ci` ist optional für strikt reproduzierbare Installs wenn du eine `package-lock.json` verwendest.
  - `utils/` — Hilfsfunktionen für Datum, Zeit, Export, Cookies
- `public/` — statische Assets (Icons, favicon)
- `index.html` — HTML-Template
- `vite.config.ts` — Vite-Konfiguration

## Entwicklung & Debugging

- Starte `npm run dev` und verwende die Browser-Devtools für Debugging
- Prüfe TypeScript- und Linter-Warnungen vor dem Commit

## Build & Deploy

1. `npm run build`
2. `npm run preview` zur lokalen Kontrolle
3. `npm run deploy` (falls eingerichtet, z. B. mit `gh-pages`)

Hinweis: Für reproduzierbare Builds `npm ci` verwenden.

## Internationale Unterstützung (i18n)

Die App enthält Mehrsprachigkeit; Texte werden über die i18n-Integration geladen. Beim Hinzufügen neuer Texte bitte die Übersetzungsdateien aktualisieren.

## Mitwirken

- Issues melden für Fehler oder Featurevorschläge
- PRs mit klarer Beschreibung, Tests/Schritten zur Überprüfung willkommen

Bei Bedarf kann ich noch eine Schritt-für-Schritt-Anleitung für das Deployment (GitHub Pages) ergänzen oder die `package.json`-Scripts überprüfen.
