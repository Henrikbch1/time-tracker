# TimeTracker

[![License](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE) [![Version](https://img.shields.io/badge/version-0.4.1-lightgrey.svg)](frontend/package.json) [![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-brightgreen.svg)](https://Henrikbch1.github.io/time-tracker/)

Ein leichtgewichtiges Single-Page-Frontend zur Erfassung und Auswertung von Arbeitszeit — gebaut mit React, TypeScript, Vite und Tailwind.

**Kurz:** Dieses Repository enthält die Frontend-Anwendung im Ordner `frontend/`. Die App lässt sich lokal entwickeln, bauen und per GitHub Pages deployen.

**Aktueller Release:** 0.4.1 — Verbesserte Statistiken, Einstellungen und Mobile-Optimierungen.

**Wichtigste Neuerungen (0.4.1)**
- Wochen-Ansicht: Balkendiagramm "Zeit pro Tag (Woche)" mit Ziel-Linie pro Tag.
- Tagesziele: `Daily target` und stundenweise Vorgaben pro Wochentag in den Einstellungen.
- Fortschrittsanzeige: Farbige Balken (Rot→Grün) zeigen Zielerreichung.
- Task-Statistik: Kreisdiagramm zeigt Zeitaufwand pro Aufgabe.
- Mobile: Verbesserte Eingabe- und Tag-UI für kleine Bildschirme.

**Schnellstart (lokal)**
1. Terminal öffnen und ins Frontend-Verzeichnis wechseln

```bash
cd frontend
npm ci
```

2. Entwicklung starten

```bash
npm run dev
# öffne http://localhost:5173 oder den in der Konsole angezeigten Port
```

3. Build & Vorschau

```bash
npm run build
npm run preview
```

4. Deploy zu GitHub Pages

```bash
npm run deploy
```

**Projektstruktur (Kurzüberblick)**
- `frontend/` — React-Anwendung
- `frontend/src/` — Komponenten, Hooks, Utilities
- `frontend/public/` — statische Assets (Icons, favicon)
- `frontend/package.json` — App-Metadaten & Scripts
- Root: `package.json` (Repo-Metadaten), `package-lock.json`, `README.md`

**Wichtige Hinweise**
- Einstellungen (Theme, Sprache, Tags) sind in der App unter `Settings` verfügbar.
- Linting: `npm run lint` (im `frontend`-Ordner).

**Mithelfen**
- Issues für Fehler/Feature-Wünsche öffnen.
- PR-Workflow: Fork → Branch → PR mit Beschreibung und, falls möglich, Reproduktions-/Testschritten.

**CHANGELOG (Kurz)**
- 0.4.1 — Statistik- und Settings-Updates, Mobile-Verbesserungen.

**Lizenz**
Dieses Projekt steht unter der [GPL-3.0](LICENSE).

---
Für Entwickler-Details siehe die Frontend-spezifische Anleitung: [frontend/README.md](frontend/README.md).