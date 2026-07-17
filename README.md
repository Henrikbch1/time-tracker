# Time Tracker

Live-Demo: [Hookie | TimeTracker](https://henrikbch1.github.io/time-tracker/)

[![License](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.5.0-lightgrey.svg)](frontend/package.json)

Eine leichte, im Browser laufende Anwendung zur Erfassung und Auswertung von Arbeitszeit. Die Benutzeroberflaeche ist als Single-Page-App mit React + TypeScript umgesetzt und liegt im Ordner `frontend/`.

## Inhaltsverzeichnis

- [Projektueberblick](#projektueberblick)
- [So funktioniert das Time Tracking](#so-funktioniert-das-time-tracking)
- [Feature-Einblick](#feature-einblick)
- [Technologien](#technologien)
- [Schnellstart](#schnellstart)
- [Deploy (GitHub Pages)](#deploy-github-pages)
- [Projektstruktur](#projektstruktur)
- [Frontend-Dokumentation](#frontend-dokumentation)
- [Mitmachen](#mitmachen)
- [Lizenz](#lizenz)

## Projektueberblick

`Time Tracker` ermoeglicht das Erfassen von Arbeitszeit pro Aufgabe, die Anzeige von Tages- und Wochenwerten sowie einfache Auswertungen nach Aufgaben und Zeitraeumen. Die App ist lokal nutzbar, offline-faehig und speichert Daten und Einstellungen im Browser.

## So funktioniert das Time Tracking

Der typische Workflow ist bewusst schlank gehalten:

1. Aufgabe benennen (optional mit Tag).
2. Tracking mit `Start` beginnen.
3. Timer laeuft live im Dashboard.
4. Tracking mit `Stop` beenden.
5. Session wird automatisch in der Historie gespeichert und in KPIs/Charts beruecksichtigt.

Wichtige Regeln im aktuellen Stand:

- Es kann immer nur eine Session gleichzeitig aktiv sein.
- Aktive Sessions koennen pausiert, spaeter fortgesetzt oder direkt abgeschlossen werden.
- Historieneintraege lassen sich nachtraeglich bearbeiten, eine separate manuelle Neueingabe gibt es aber nicht.

## Feature-Einblick

- Task-Tracking mit Start, Pause, Resume und Stop inklusive optionaler Tags.
- Favoriten und Quick-Start fuer wiederkehrende Aufgaben.
- Dashboard mit Live-Timer sowie KPI-Karten fuer Tag, Woche und Monat.
- Reports mit Trend-, Aufgaben- und Tag-Auswertungen.
- Historie mit Suche, Filtern, Sortierung und editierbaren Eintraegen.
- Einstellungen fuer Profil, Tagesziel, Workdays, Rundung, Theme und Sprache.
- Export als CSV, Excel, PDF sowie kompakter Tagesexport zum Kopieren.
- Lokale Speicherung im Browser inklusive Wiederherstellung laufender oder pausierter Sessions.

## Technologien

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS
- Build & Dev: npm, Vite

## Schnellstart

1. Ins Frontend-Verzeichnis wechseln und Abhaengigkeiten installieren:

```bash
cd frontend
npm install
```

2. Entwicklung starten:

```bash
npm run dev
# Oeffne die angezeigte URL (z. B. http://localhost:5173)
```

3. Produktion lokal pruefen:

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

Die App kann mit dem vorhandenen `deploy`-Script per `gh-pages` nach GitHub Pages veroeffentlicht werden:

```bash
cd frontend
npm run build
npm run deploy
```

Stelle sicher, dass das Remote-Repository korrekt konfiguriert ist und `homepage` in `frontend/package.json` auf die GitHub-Pages-URL zeigt.

## Projektstruktur

- `frontend/` - React-Anwendung (Quellcode, Assets, Scripts)
- `LICENSE` - Lizenzdatei (GPL-3.0)
- `README.md` - Diese Datei

## Frontend-Dokumentation

Frontend-spezifische Details findest du in [frontend/README.md](frontend/README.md).

## Mitmachen

- Issues fuer Fehler oder Feature-Wuensche erstellen
- Fork -> Branch -> PR, bitte mit Beschreibung und Reproduktionsschritten

## Lizenz

Dieses Projekt steht unter der [GPL-3.0](LICENSE).
