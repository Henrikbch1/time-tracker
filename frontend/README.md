# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

# Frontend (React + TypeScript + Vite)

Dieses Verzeichnis enthält die React-/TypeScript-Frontend-Anwendung, gebaut mit Vite und Tailwind.

Schnellstart (Entwicklung):

```bash
cd frontend
npm ci
npm run dev
# öffne http://localhost:5173 oder den in der Konsole angezeigten Vite-Port
```

Build & Vorschau:

```bash
npm run build
npm run preview
```

Deploy (GitHub Pages):

```bash
npm run deploy
```

Wichtige Hinweise für diese Codebasis
- Theme (Dark/Light), Sprache und Tag-Management sind über die In-App `Settings` erreichbar (oben rechts über den `Settings`-Button).
- Mobile: Formulare und Tag-Manager wurden für kleine Bildschirme optimiert (gestapelte Eingaben, horizontales Scrollen für Tag-Chips).

Wichtige Dateien:
- `src/` — Quellcode (Components, Hooks, Utils)
- `index.html` — App-Entry
- `vite.config.ts` — Vite-Konfiguration
- `tsconfig.*.json` — TypeScript-Konfigurationen

Empfehlungen:
- Linting: `npm run lint`
- Falls du die App lokal testen willst, achte auf den in der Konsole angezeigten Vite-Port (standardmäßig 5173, kann variieren).

Support
- Für Issues oder Feature-Requests öffne ein Issue im Repository oder erstell einen PR mit einer klaren Beschreibung und Schritten zur Reproduktion.

Viel Erfolg beim Entwickeln!
  Viel Erfolg beim Entwickeln — öffne gern ein Issue oder sende einen PR bei Fragen oder Verbesserungen.
