# Quill

> This file gives Claude Code project-specific context. Keep it short and factual.

## Overview

Quill is a **single-user personal goal & progress journal** built around a book
metaphor: life goals are **Chapters**, daily to-dos are **Lines**, progress is a
growing **tree**. Built from a Claude Design handoff (warm "paper" visual system);
the handoff bundle lives in `design_handoff_quill_dashboard/` — its README is the
spec and `Quill Dashboard.dc.html` is the reference prototype.

Four views in one shell: **Today** (default; hero tree/history carousel + lines/
weekly carousel), **Past pages** (archive of finished days with their lines and
reflections), **Chapter detail** (milestone timeline, checkpoint countdown,
chart or mini tree; "% inked" is milestone-driven except IELTS, which tracks the
overall band), and the **IELTS log** (band-score charting
for the special `ielts` chapter). No backend, no auth — everything persists to
localStorage under the `quill_*` keys listed in the handoff README plus
`quill_carryover_v1` for unanswered carry-over prompts (see
`src/store/persistence.ts`). The sidebar footer offers JSON backup export/import
(`src/store/backup.ts`), and a manifest + icons in `public/` make the app
installable as a PWA.

## Stack

- React 18 + TypeScript
- Vite (dev server + build)
- Plain CSS Modules for styling, with design tokens in `src/styles/tokens.css`
- Charts and trees are hand-rolled inline SVG (no chart library) — see
  `src/lib/chart.ts` and `src/lib/tree.ts`

## Project structure

- `src/components/` — reusable UI (Sidebar, SlidePanels carousel, Segmented,
  OptionMenu, BackupControls) plus view pieces under `today/` and `chapter/`
- `src/pages/`      — the four views (`Today.tsx`, `PastPages.tsx`,
  `ChapterDetail.tsx`, `IeltsLog.tsx`)
- `src/store/`      — `QuillContext.tsx` (all state + actions, plus the live
  day/week rollover that fires on an interval and on tab focus),
  `loadInitialState.ts` (hydration, week reset, day rollover/carry-over),
  `persistence.ts` (localStorage keys), `backup.ts` (export/import), `types.ts`
- `src/lib/`        — `chart.ts` (SVG path math), `tree.ts` (tree stage geometry),
  `date.ts` (epoch-day/week keys), `today.ts` (momentum/atmosphere formulas)
- `src/data/`       — `seed.ts` (placeholder starter data), `palette.ts` (chapter
  palette + IELTS skill colors), `constants.ts` (owner name, momentum base)
- `src/styles/`     — `tokens.css` (warm-paper palette), `global.css`

## Commands

- Install: `npm install`
- Run (dev): `npm run dev` (serves on http://localhost:5173, or 5174 if the
  production server holds 5173 — see below)
- Build: `npm run build` (runs `tsc -b` typecheck, then `vite build`)
- Serve build: `npm run serve` (`serve.mjs`, a dependency-free static server
  for `dist/` on 127.0.0.1:5173; exits quietly if the port is taken)
- Preview build: `npm run preview`
- Typecheck only: `npm run typecheck`
- Test: `TBD — no test runner set up yet`
- Lint / format: `TBD — none configured yet`

## Serving / deployment

The app auto-serves at login: `Quill server.vbs` in the user's Startup folder
launches `node D:\Quill\serve.mjs` hidden. **Port 5173 is load-bearing** — the
owner's journal data lives in localStorage under `http://localhost:5173`, so
the production server must stay on that origin. After code changes, run
`npm run build` and refresh; the running server picks up the new `dist/`
(index.html is served no-cache). To develop while it runs, just `npm run dev` —
Vite bumps to 5174, a separate origin with sandbox (seed) data, which keeps
real data out of dev experiments. To stop autostart, delete the Startup .vbs.

It is also hosted on GitHub Pages: repo `dropingharun-source/Quill`, served at
https://dropingharun-source.github.io/Quill/ via `.github/workflows/deploy.yml`
(builds and deploys on every push to `main`). Vite uses `base: './'` and the
PWA manifest uses relative paths so one build works at both the root origin
and the `/quill/` subpath. There are no local git credentials — pushes go
through the Composio GitHub connection (API commits). Remember each origin
(localhost vs github.io) keeps its own localStorage journal; move data with
the sidebar's backup export/import. The design handoff bundle
(`design_handoff_quill_dashboard/`) stays local — it is gitignored.

## Conventions

- One component per file; co-locate its `*.module.css` next to it.
- Drive colours/spacing from the CSS variables in `tokens.css`, not hard-coded hex
  (exception: per-chapter accent/tint and skill colours are data, applied inline).
- All persisted mutations go through the actions in `QuillContext.tsx`, which write
  their slice to localStorage on every change.
- Day/week semantics: epoch-day keys (`floor(t / 86400000)`), week key
  `floor((epochDay + 3) / 7)`; rollover and weekly reset run at load in
  `loadInitialState.ts` and live (interval + focus) in `QuillContext.tsx` —
  keep the two code paths in step.

## Notes for Claude

- This is a Windows environment; the shell is PowerShell (a Bash tool is also available).
- Keep changes minimal and match surrounding code style once it exists.
- The `ielts` chapter id is special-cased (band chart, IELTS log link, overall-band
  progress); other chapters get the milestone-driven mini tree.
