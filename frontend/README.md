# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # TimeTracker — Frontend

  Dieses Verzeichnis enthält die React-/TypeScript-Frontend-Anwendung, gebaut mit Vite.

  Kurze Anleitung (Entwicklung):

  ```bash
  cd frontend
  npm ci
  npm run dev
  # öffne http://localhost:5173
  ```

  Build & Deploy:

  ```bash
  npm run build
  npm run preview
  # Für GitHub Pages (bereits eingerichtet):
  npm run deploy
  ```

  Wichtige Dateien:
  - `src/` — Quellcode (Components, Hooks, Utils)
  - `index.html` — App-Entry
  - `vite.config.ts` — Vite-Konfiguration
  - `tsconfig.*.json` — TypeScript-Konfigurationen

  Tipps:
  - Linting: `npm run lint`
  - Die `homepage` in dieser `package.json` zeigt auf die GitHub-Pages-URL.

  Falls du Screenshots oder ein Demo-GIF hinzufügen möchtest, lege sie in `frontend/public/` ab und verlinke sie in der Root-`README.md`.

  Viel Erfolg beim Entwickeln — öffne gern ein Issue oder sende einen PR bei Fragen oder Verbesserungen.
  {
