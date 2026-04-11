# Time Tracker

[![License](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE) [![Version](https://img.shields.io/badge/version-0.4.4-lightgrey.svg)](frontend/package.json)

Eine leichte, im Browser laufende Anwendung zur Erfassung und Auswertung von Arbeitszeit. Die Benutzeroberfläche ist als Single-Page-App mit React + TypeScript erstellt und liegt im Ordner `frontend/`.

Inhaltsverzeichnis

- [Projektüberblick](#projektüberblick)
- [Features](#features)
- [Technologien](#technologien)
- [Schnellstart](#schnellstart)
- [Frontend](#frontend)
- [Projektstruktur](#projektstruktur)
- [Mitmachen](#mitmachen)
- [Lizenz](#lizenz)

## Projektüberblick

`Time Tracker` ermöglicht das einfache Erfassen von Arbeitszeiten pro Aufgabe, das Anzeigen von Tages- und Wochenübersichten sowie einfache Auswertungen (z. B. Zeit pro Aufgabe). Die App ist lokal ausführbar, offline-fähig und speichert Einstellungen im Browser.

- ## Features

- Erfassen von Start/Stop-Zeiten
- Manuelle Zeiteinträge: aktuell nicht über ein Formular möglich (nur automatische Tracking- bzw. Bearbeitungsfunktionen)
- Übersicht: Zeit pro Tag, Woche und pro Aufgabe (Kreis-/Balkendiagramme)
- Einstellbare Tagesziele und Theme-Support (hell/dunkel)
- Tag-Management und Export: aktuell wird ein einfacher `.txt`-Export verwendet
- Mehrsprachigkeit (i18n)

## Technologien

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS
- Build & Dev: npm, Vite

## Schnellstart

1. Ins Frontend-Verzeichnis wechseln

```bash
cd frontend
npm install
```

2. Entwicklung starten

```bash
npm run dev
# Öffne die angezeigte lokale URL (z. B. http://localhost:5173)
```

3. Produktion bauen

```bash
npm run build
npm run preview
```

4. Deploy (GitHub Pages)

Die App kann mit dem vorhandenen `deploy`-Script per `gh-pages` nach GitHub Pages deployt werden. Ablauf:

```bash
npm run build   # erstellt das Production-Bundle in `dist`
npm run deploy  # nutzt `gh-pages -d dist`, push zu gh-pages-Branch
```

Stelle sicher, dass das Remote-Repository korrekt konfiguriert ist und der `homepage`-Eintrag in `frontend/package.json` auf die GitHub Pages URL zeigt.

## Frontend

Die Frontend-spezifischen Details und Anweisungen stehen in der Frontend-README: [frontend/README.md](frontend/README.md).

## Projektstruktur

- `frontend/` — React-Anwendung (Quellcode, Assets, Scripts)
- `LICENSE` — Lizenzdatei (GPL-3.0)
- `README.md` — Diese Datei

## Mitmachen

- Öffne Issues für Fehler oder Featurewünsche
- Fork → Branch → PR, bitte mit Beschreibung und Reproduktionsschritten

## Lizenz

Dieses Projekt steht unter der [GPL-3.0](LICENSE).

---

Wenn du möchtest, kann ich jetzt noch die `frontend/README.md` ausführlicher kommentieren oder die Anleitung für das Deployment anpassen.
