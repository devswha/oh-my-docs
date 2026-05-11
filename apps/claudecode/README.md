# oh-my-claudecode docs

Documentation site for [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) — a multi-agent orchestration layer for Claude Code.

Built with **Next.js** + **Fumadocs**. Deployed on Vercel.

## Dev

```bash
npm install
npm run dev
```

## Content

All docs live in [`content/docs/`](./content/docs/) as MDX. Sidebar
order is driven by per-directory `meta.json` files.

## Translations

See [`docs/CONTRIBUTING-TRANSLATIONS.md`](./docs/CONTRIBUTING-TRANSLATIONS.md)
for the file-naming convention, glossary, and PR flow.

## Layout

```
content/docs/           MDX content (feeds the docs site)
src/app/                Next.js app (landing + docs routes)
src/components/         Shared React components
public/                 Static assets
.github/workflows/      CI (incl. upstream-drift check)
docs/                   Repo-maintainer docs (not published to site)
```
