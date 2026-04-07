# TimeTracker

[![License](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE) [![Version](https://img.shields.io/badge/version-0.3.0-lightgrey.svg)](frontend/package.json) [![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-brightgreen.svg)](https://Henrikbch1.github.io/time-tracker/)

Elegant, leichtgewichtiger Time-Tracker — Single-Page-App mit React, TypeScript und Vite.

**Kurz:** Diese Repo enthält ein Frontend im Ordner `frontend/`, das mit Vite, React und Tailwind gebaut wird. Die Seite kann per GitHub Pages deployed werden (siehe `frontend/package.json`).

Hinweis: Theme (Dark/Light), Sprache und Tag-Management werden jetzt über die interne `Settings`-Seite gesteuert (oberer `Settings`-Button in der UI). Mobile Layout-Verbesserungen wurden vorgenommen, damit Tag-Erstellung und Einstellungen auf kleinen Bildschirmen besser nutzbar sind.

**Highlights**
- **Tech:** React, TypeScript, Vite, Tailwind
- **Deployment:** GitHub Pages (Script: `frontend/package.json`)
- **Architektur:** Kleine Komponentenstruktur, Hooks und Utility-Module

**Neu (Statistiken & Einstellungen)**
- Wochen-Ansicht: Balkendiagramm "Zeit pro Tag (Woche)" zeigt die Gesamtzeit pro Arbeitstag (Mo–So) und eine Ziel-Linie pro Tag.
- Tagesziele: In den `Settings` lässt sich ein `Daily target` und für jeden Wochentag die erwartete Arbeitszeit (Stunden) einstellen.
- Fortschritt: Balken sind farbcodiert nach Fortschritt (Rot→Orange→Gelb→Grün) und zeigen Prozent-Erreichung des Tagesziels.
- Task-Statistik: Kreisdiagramm "Time per task" zeigt, wie viel Zeit pro Aufgabe verbracht wurde.
- Settings: Änderungen werden persistiert (Cookies) und der Save-Button gibt visuelles Feedback ("Saved").
- Validierung: Stunden-Eingaben werden auf 0–24 geclampet; negative Werte werden nicht akzeptiert.

**Schnellstart**
1. Öffne ein Terminal im `frontend`-Ordner
2. Installieren:

```bash
cd frontend
npm ci
```

3. Lokal entwickeln:

```bash
npm run dev
# öffne http://localhost:5173
```

4. Build & Vorschau:

```bash
npm run build
npm run preview
```

5. Deploy zu GitHub Pages:

```bash
npm run deploy
```

**Badge-Übersicht**
- Lizenz: GNU GPLv3
- Version: aus `frontend/package.json`
- GitHub Pages: deployed (siehe `homepage` in `frontend/package.json`)

**Mithelfen**
- Issues anlegen für Fehler oder Feature-Wünsche
- Pull Requests: Fork → Branch → PR (gutes PR-Format: Problem, Lösung, Tests)

**Lizenz**
Dieses Projekt steht unter der [GPL-3.0](LICENSE).

---
Für detailliertere Entwickler-Infos siehe [frontend/README.md](frontend/README.md).