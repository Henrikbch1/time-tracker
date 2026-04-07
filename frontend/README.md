# Frontend — React + TypeScript + Vite (Version 0.4.1)

Dieses Verzeichnis enthält die React-Frontend-Anwendung (Vite + TypeScript + Tailwind).

Kurzer Überblick
- Version: 0.4.1 (siehe `package.json`)
- Entrypoint: `frontend/src/main.tsx`

Schnellstart (Entwicklung)

```bash
cd frontend
npm ci
npm run dev
# öffne http://localhost:5173 oder den in der Konsole angezeigten Port
```

Build & Vorschau

```bash
npm run build
npm run preview
```

Deploy (GitHub Pages)

```bash
npm run deploy
```

Wichtige Hinweise
- Einstellungen (Theme, Sprache, Tags) sind in der App unter `Settings` verfügbar.
- Mobile-Optimierungen: Tag-Management und Formulare sind für kleine Bildschirme verbessert.

Wichtige Dateien
- `src/` — Komponenten, Hooks, Utils
- `public/` — statische Assets (Icons, favicon)
- `vite.config.ts` — Vite-Konfiguration
- `index.html` — HTML-Template

Scripts
- `npm run dev` — Startet Vite im Dev-Modus
- `npm run build` — Transpiliert und baut die Produktionsassets
- `npm run preview` — Vorschau des Build-Outputs
- `npm run deploy` — Deploy via `gh-pages` (erst `npm run build`)
- `npm run lint` — ESLint prüfen

Empfehlungen
- Nutze `npm ci` für reproduzierbare Builds
- Prüfe Linter/TypeScript-Fehler vor PRs

Support
- Issues und PRs sind willkommen — bitte beschreibe Probleme, Schritte zur Reproduktion und erwünschtes Verhalten.

Viel Erfolg beim Entwickeln!
