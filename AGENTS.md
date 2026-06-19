# Repository Guidelines

## Project Overview

`oh-my-docs` is an **npm-workspaces monorepo** that manages five independently
deployed documentation sites under `apps/`. Each app is a Next.js 16 + Fumadocs
static documentation site for a different upstream project:

| App | Package name | Documents | Notes |
| --- | --- | --- | --- |
| `apps/codex` | `oh-my-codex-docs` | Oh My Codex | adds `content/for-everyone` collection |
| `apps/claudecode` | `omc-docs` | Oh My Claude Code | |
| `apps/openagent` | `oh-my-openagent-docs` | Oh My OpenAgent | |
| `apps/gajae-code` | `gajae-code-docs` | Gajae-Code (gjc) | scaffolded in-repo |
| `apps/lzx` | `lzx-docs` | LazyCodex (LZX) | `lzx.vibetip.help` |

Apps were imported/scaffolded via `git subtree` (see `MIGRATION.md`); source
history is preserved and each app can be pulled from / split back to its upstream
repo. Apps are **near-identical templates** — fix a pattern in one and replicate
it across the others.

## Architecture & Data Flow

- **Content model**: docs are MDX under `apps/<app>/content/docs/`. Fumadocs
  (`fumadocs-mdx`) compiles MDX into a generated `.source/` directory
  (gitignored) consumed via `src/lib/source.ts`.
- **i18n**: every page ships in 4 locales — `page.mdx` (en), `page.ko.mdx`,
  `page.zh.mdx`, `page.ja.mdx`. Sidebar order is driven by per-directory
  `meta.json` + locale variants (`meta.ko.json`, `meta.zh.json`, `meta.ja.json`).
  Routing uses an App Router `[lang]` dynamic segment.
- **Build pipeline**: `prebuild` runs `scripts/inject-<app>-version.mjs` (fetches
  upstream version into `src/lib/version.ts`, a generated file) and
  `check:localized-links`; then `next build` compiles MDX → `.next/`.
- **Deployment**: Vercel CLI. `deploy/vercel/projects.json` is the source of
  truth (projectId/orgId/rootDirectory per app); root `vercel:*` scripts sync
  link files, configure root dirs via the Vercel API, and deploy.
- **Upstream drift**: each app has `.github/workflows/check-upstream.yml`
  (scheduled daily) that compares the upstream SHA against
  `.github/upstream-sha.txt` and files/closes a GitHub issue on drift.

## Key Directories

```
apps/<app>/
  src/app/                # Next.js App Router (layout.tsx, [lang]/layout.tsx, api/)
  src/app/api/            # report/route.ts (GitHub issue + Turnstile), search/route.ts
  src/components/         # copy-install, report-form, mermaid, docs-sidebar-footer
  src/lib/                # i18n.ts, source.ts, version.ts (generated), schemas
  content/docs/           # MDX docs + meta.json (multi-locale)
  scripts/                # inject-<app>-version.mjs, check-localized-doc-links.mjs, scaffold-*.mjs
scripts/                  # vercel-deploy.mjs, vercel-configure-projects.mjs, vercel-sync-links.mjs
deploy/vercel/            # projects.json (manifest) + README.md (deploy guide)
```

## Development Commands

Run from the repo root (per-app suffix or bulk):

```bash
npm run install:all          # install deps in every app (no root deps)
npm run dev:gajae-code        # next dev for one app (also runs version injection)
npm run build                 # build ALL apps sequentially
npm run build:codex           # build one app
npm run lint                  # lint ALL apps
npm run lint:lzx              # lint one app
npm run status                # git status --short --branch
```

Inside an app (`apps/<app>/`): `npm run dev | build | start | lint`,
`npm run check:localized-links`.

Deployment (root):

```bash
npm run vercel:sync-links            # regenerate per-app .vercel/project.json
npm run vercel:configure:dry         # preview Vercel rootDirectory config
npm run vercel:configure:apply       # apply (needs VERCEL_TOKEN)
npm run vercel:deploy:lzx            # preview deploy
npm run vercel:deploy:lzx:prod       # production deploy
```

## Code Conventions & Common Patterns

- **TypeScript** (`tsconfig.json`, identical across apps): `target ES2017`,
  `strict: true`, `module esnext`, `moduleResolution bundler`, `jsx react-jsx`,
  `noEmit`. Path aliases: `@/*` → `./src/*`, `@/.source` → `./.source`.
- **ESLint** (`eslint.config.mjs`): flat config using `@next/eslint-plugin-next`
  recommended rules; ignores `.next/`, `.source/`, `node_modules/`, `dist/`, and
  tool dirs (`.omc/`, `.omx/`, `.sisyphus/`).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` (sole PostCSS plugin);
  Fumadocs UI styles imported in `src/app/layout.tsx`.
- **API routes**: validate input with **Zod**; `api/report` gates submissions
  with Cloudflare Turnstile and posts GitHub issues via `@octokit/rest`, rate
  limited with `@upstash/ratelimit` + `@upstash/redis`.
- **Generated files** — never hand-edit: `src/lib/version.ts` (from
  `inject-<app>-version.mjs`), `.source/`, `.vercel/project.json`.
- **Localized links**: non-English MDX MUST use locale-prefixed routes
  (`/ko/docs`, `/ja/docs`, `/zh/docs`), not bare `/docs` — enforced by
  `check-localized-doc-links.mjs`.
- **Monorepo rule**: keep product-specific code/assets/config inside the matching
  `apps/*`. No shared `src/` library exists; replicate shared patterns per app.

## Important Files

- `apps/<app>/source.config.ts` — Fumadocs doc collection definitions.
- `apps/<app>/next.config.mjs` — `createMDX` wrapper, Turbopack root, security
  headers (X-Frame-Options DENY, HSTS, nosniff, Referrer-Policy), `allowedDevOrigins`.
- `apps/<app>/src/lib/i18n.ts` — `defineI18n({ defaultLanguage: 'en', languages: ['en','ko','zh','ja'] })`.
- `apps/<app>/src/lib/source.ts` — Fumadocs source loader (`baseUrl: /docs`).
- `apps/<app>/.env.example` — required env: `GITHUB_REPORT_TOKEN`,
  `GITHUB_REPORT_REPO_OWNER/NAME`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`, `KV_REST_API_URL/TOKEN`, `NEXT_PUBLIC_ENABLE_SUPPORT`.
- `deploy/vercel/projects.json` — Vercel project manifest (drives all deploy scripts).
- `MIGRATION.md` — git subtree import/pull/split commands.

## Runtime/Tooling Preferences

- **Runtime: Node.js with npm** (not Bun). The repo uses npm workspaces, each app
  ships a `package-lock.json`, and all scripts invoke `npm --prefix apps/<app>`.
  No `packageManager` field or `engines` are declared; Vercel/deploy scripts call
  `node` directly.
- **Stack versions** (shared across apps): Next.js `^16.2.0`, React `^19.0.0`,
  Fumadocs `^16.6.0` (core/ui) + `fumadocs-mdx ^14.2.0`, Tailwind `^4.2.1`,
  TypeScript `^5.7.0`, Zod `^4.3.6`.
- Some content/asset scripts are Python (e.g. `make-social-preview.py`) and run
  outside the Node build.

## Testing & QA

- **No unit-test framework** (no Jest/Vitest) is configured. The only automated
  test is `apps/codex/scripts/check-localized-doc-links.test.mjs`, written with
  the Node built-in `node:test` + `node:assert/strict`; run it with
  `node apps/codex/scripts/check-localized-doc-links.test.mjs`.
- Primary QA gates are **lint** (`npm run lint[:app]`), the **prebuild localized
  link check** (`npm run check:localized-links`), and a successful **`next build`**.
- CI is limited to upstream-drift workflows; builds/lint are **not** run in GitHub
  Actions, so validate locally (`npm run lint && npm run build:<app>`) before
  shipping.
