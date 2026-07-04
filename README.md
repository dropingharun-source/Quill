# Quill — goal & progress journal

A single-user personal dashboard built around a book metaphor: life goals are
**Chapters**, daily to-dos are **Lines**, and progress is visualized as a
growing **tree** under a sky that wakes as weekly goals get done.

Built with React 18 + TypeScript + Vite from a Claude Design handoff (warm
"paper" visual system). All charts and trees are hand-rolled inline SVG — no
chart library, no backend, no auth. Everything persists to the browser's
localStorage, with JSON backup export/import built into the sidebar.

## Views

- **Today** — greeting, streak, momentum ring; a two-panel hero (the living
  tree ⇄ a % goals-done history chart); today's lines and weekly goals.
- **Past pages** — every finished day, with its lines and reflection.
- **Chapter detail** — milestone timeline with tiny goals, checkpoint
  countdown, and a chapter tree (the IELTS chapter charts its overall band).
- **IELTS log** — four band-score lines over mock tests, with point editing
  and score entry.

## Run

```
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # typecheck + production build to dist/
npm run serve    # serve dist/ on http://localhost:5173 (no dependencies)
```

Deployed automatically to GitHub Pages on every push to `main`.

> Note: your journal data lives in your browser's localStorage, keyed to the
> address you use — the app itself never sends data anywhere.
