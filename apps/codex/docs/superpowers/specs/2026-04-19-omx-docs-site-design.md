# OMX Docs Site — Design Spec

- **Date:** 2026-04-19
- **Working dir:** `/home/devswha/workspace/oh-my-codex-docs/`
- **Upstream project:** `github.com/Yeachan-Heo/oh-my-codex` (OMX, version `0.13.2`)
- **Reference site:** `github.com/Yeachan-Heo/oh-my-claudecode-website` (OMC docs, the template we port from)
- **Deploy target:** `https://omx.vibetip.help` (Vercel)

## 1. Goal

Port the OMC docs site (Next.js 16 + Fumadocs 16 + 4-language i18n) into a new standalone site for **Oh My CodeX (OMX)**. Reuse OMC's structure and layout code; replace content and landing with OMX-accurate data sourced from the OMX repo.

## 2. Decisions (from brainstorming Q1–Q9)

| # | Decision | Rationale |
|---|---|---|
| Q1 | OMX is an existing project — a workflow layer for OpenAI Codex CLI. | Confirmed via GitHub repo. |
| Q2 | Build a separate docs site (not a PR to OMX). | Scope isolation, independent release cadence. |
| Q3 | Base on OMC content, replace terms/examples to match OMX. | Fastest path; retains proven structure. |
| Q4 | 4 languages: `en` (default), `ko`, `zh`, `ja`. | Mirrors OMC reach. |
| Q5 | Page inventory driven by actual OMX artifacts, not blind copy of OMC. | Prevents fabricated entries (e.g., OMC-only agents). |
| Q6 | Deploy to `omx.vibetip.help` on Vercel. | Parity with OMC (`omc.vibetip.help`). |
| Q7 | Selectively copy OMC files into this repo (not full clone, not scaffold from scratch). | Keeps repo clean, no OMC history noise. |
| Q8 | Landing page fully rewritten with OMX-real figures (33 agents, 37 skills). | Landing sets user expectation — must be truthful. |
| Q9a | `package.json.name = "oh-my-codex-docs"`. | Match the repository name and avoid temporary `omx-docs` shorthand drift. |
| Q9b | Version badge auto-injected from OMX `package.json` at build time. | No manual drift. Falls back to bundled static if import fails. |
| Q9c | Drop OMC legacy HTML assets (`index.html`, `docs/index.html`, `css/`). | Unused, GH-Pages relic. |
| Q9d | Document `.omx/` directory on a dedicated `reference/omx-directory.mdx` page. | Distinctive OMX concept. |
| Q9e | `CopyInstallCommand` reused with command swapped to `npm i -g oh-my-codex`. | Trivial edit. |

## 3. Architecture

### 3.1 Stack
- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Fumadocs 16** (`fumadocs-core` + `fumadocs-ui` + `fumadocs-mdx`)
- **Tailwind v4** (+ `@tailwindcss/postcss`)
- **Mermaid** diagrams (client-side component)
- **Vercel Analytics** (`@vercel/analytics`)
- Fonts: `JetBrains_Mono` (hero title)

### 3.2 Repository Layout
```
oh-my-codex-docs/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                    # root metadata only
│  │  ├─ global.css
│  │  ├─ api/search/                   # fumadocs search route
│  │  └─ [lang]/
│  │     ├─ layout.tsx                 # RootProvider + i18n UI + Analytics
│  │     ├─ page.tsx                   # landing (rewritten for OMX)
│  │     └─ docs/
│  │        ├─ layout.tsx              # DocsLayout + version badge (auto)
│  │        └─ [[...slug]]/page.tsx    # MDX renderer, prev/next nav
│  ├─ components/
│  │  ├─ copy-install.tsx              # "npm i -g oh-my-codex"
│  │  └─ mermaid.tsx
│  ├─ lib/
│  │  ├─ i18n.ts                       # en/ko/zh/ja
│  │  ├─ source.ts                     # fumadocs loader
│  │  └─ version.ts                    # build-time generated, exports OMX_VERSION
│  └─ middleware.ts                    # i18n routing
├─ content/docs/                       # MDX source (see §4)
├─ public/                             # favicons, og image, logo
├─ source.config.ts                    # defineDocs({ dir: 'content/docs' })
├─ next.config.mjs                     # MDX + security headers
├─ postcss.config.mjs
├─ eslint.config.mjs
├─ tsconfig.json
├─ package.json                        # name: "oh-my-codex-docs"
├─ scripts/
│  └─ inject-omx-version.mjs           # writes src/lib/version.ts from upstream package.json
├─ docs/superpowers/                   # specs and plans (this doc lives here)
└─ README.md
```

### 3.3 Files Copied (lightly edited) from OMC
- `source.config.ts` (identical)
- `next.config.mjs` (identical — security headers)
- `src/middleware.ts`, `src/lib/i18n.ts`, `src/lib/source.ts` (identical)
- `src/app/layout.tsx`, `src/app/global.css` (identical)
- `src/app/[lang]/layout.tsx` (identical — i18n UI translations)
- `src/app/[lang]/docs/layout.tsx` (identical except version badge imports `OMX_VERSION` from `src/lib/version.ts`)
- `src/app/[lang]/docs/[[...slug]]/page.tsx` (identical)
- `src/components/mermaid.tsx` (identical)
- `src/components/copy-install.tsx` (swap command to `npm i -g oh-my-codex`)
- `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json` (identical)

### 3.4 Files Rewritten for OMX
- `src/app/[lang]/page.tsx` — landing (see §5)
- `package.json` — new name, deps copied from OMC
- `content/docs/**` — all MDX authored fresh (see §4)

### 3.5 Files NOT Copied from OMC
- `index.html`, `docs/index.html`, `image.png`, `css/` (GH-Pages legacy)

## 4. Content Inventory (`content/docs/`)

Every MDX file ships in 4 languages: `foo.mdx` (en), `foo.ko.mdx`, `foo.zh.mdx`, `foo.ja.mdx`. Every directory ships 4 meta files: `meta.json`, `meta.ko.json`, `meta.zh.json`, `meta.ja.json`.

### 4.1 Root
```json
// content/docs/meta.json
{ "title": "OMX Docs",
  "pages": ["index", "getting-started", "concepts", "guides",
            "agents", "skills", "hooks", "tools",
            "integrations", "reference"] }
```
`integrations` is new vs. OMC — OMX has first-class integration surface (OpenClaw, Clawhip, MCP, cross-CLI bridges).

### 4.2 `agents/` — 33 pages, 4 lanes
Sourced from `prompts/*.md` in OMX repo.

| Lane | Pages (count) |
|---|---|
| `build-analysis` (8) | explore, analyst, planner, architect, executor, debugger, verifier, explore-harness |
| `review` (6) | code-reviewer, security-reviewer, quality-reviewer, style-reviewer, api-reviewer, performance-reviewer |
| `domain` (14) | test-engineer, qa-tester, writer, designer, researcher, ux-researcher, information-architect, product-analyst, product-manager, dependency-expert, git-master, build-fixer, code-simplifier, vision |
| `coordination` (5) | critic, quality-strategist, team-orchestrator, team-executor, sisyphus-lite |

Each page ports OMC's agent doc pattern (description, invocation, inputs/outputs, example) and replaces Claude-specific bits.

### 4.3 `skills/` — 37 pages, 2 lanes
Complete list from `skills/*/` in the OMX repo (verified 2026-04-19).

| Lane (count) | Pages |
|---|---|
| `workflow` (19) | autopilot, ralph, ralph-init, ralplan, team, swarm, worker, pipeline, ultrawork, ultraqa, deep-interview, plan, tdd, trace, deepsearch, frontend-ui-ux, visual-verdict, web-clone, wiki |
| `utility` (18) | ai-slop-cleaner, analyze, ask-claude, ask-gemini, build-fix, cancel, code-review, configure-notifications, doctor, ecomode, git-master, help, hud, note, omx-setup, review, security-review, skill |

Totals: 19 + 18 = **37**, matching §5.1 landing copy. Lane assignment follows OMC's convention (workflow = end-to-end pipelines and multi-agent orchestration; utility = single-purpose ops and config). No OMC-only skills (`ccg`, `sciomc`, `external-context`, `omx-teams`) are included — they do not exist in upstream OMX.

Skill invocation syntax uses `$<name>` (OMX convention), replacing OMC's `/<name>`.

### 4.4 `hooks/` — 5 pages
- `lifecycle-events.mdx` (PreToolUse/PostToolUse/Stop/SessionStart/etc.)
- `core-hooks.mdx`
- `context-hooks.mdx`
- `magic-keywords.mdx`
- `codex-native-hooks.mdx` (**new**, based on `docs/codex-native-hooks.md` + `docs/hooks-extension.md`)

### 4.5 `tools/` — OMX-specific
Replaces OMC's Claude-centric tool list. Pages: `state`, `hud`, `wiki`, `catalog`, `visual`, `ask-claude`, `ask-gemini`. (Derived from `src/{state,hud,wiki,catalog,visual}` and `src/scripts/ask-*.sh`.)

### 4.6 `integrations/` (new section) — 4 pages
- `openclaw.mdx` — based on `docs/openclaw-integration.md`
- `clawhip.mdx` — based on `docs/clawhip-event-contract.md`
- `mcp.mdx` — based on `src/mcp/`
- `cli-bridges.mdx` — `$ask-claude`, `$ask-gemini`, `ccg` tri-model workflow

### 4.7 `reference/` — 8 pages
- `configuration.mdx`
- `environment.mdx`
- `migration.mdx` (seeds: `docs/migration-mainline-post-v0.4.4.md`)
- `changelog.mdx` (pulled from upstream `CHANGELOG.md`)
- `quick-commands.mdx`
- `cjk-ime.mdx`
- `contracts.mdx` (**new**, from `docs/contracts/`, `prompt-guidance-contract.md`, `interop-team-mutation-contract.md`)
- `omx-directory.mdx` (**new**, documents `.omx/` — state, notepad, logs, sessions, memory)

### 4.8 `getting-started/`, `concepts/`, `guides/`
Single `index.mdx` each, same structure as OMC, content adapted for OMX (install `@openai/codex` first, then `oh-my-codex`; invoke `omx setup`; core concepts include Codex-native hooks, $skills, team/worker model).

## 5. Landing Page (`src/app/[lang]/page.tsx`)

Structure identical to OMC (Hero, Features, Pipeline, Agents, Skills, Steps, Footer). All copy rewritten; `translations` object holds en/ko/zh/ja.

### 5.1 Hero
- Headline: `Oh My` / `CodeX` (JetBrains Mono, two-line)
- Subtitle: "Multi-Agent Orchestration for Codex CLI"
- Description: *"A workflow layer for OpenAI Codex CLI. 33 agent prompts and 37 skills working together."*
- CTAs: **Get Started** → `${lp}/docs/getting-started`; **View Docs** → `${lp}/docs`
- `CopyInstallCommand`: `npm i -g oh-my-codex`

### 5.2 Features (4 cards)
1. **33 Specialized Agent Prompts** — from exploration to verification.
2. **37 Automation Skills** — `$autopilot`, `$ralph`, `$ultrawork`.
3. **Codex-Native Hooks** — lifecycle, context, magic keywords.
4. **Cross-CLI Integrations** — OpenClaw, Clawhip, MCP, Ask-Claude/Gemini.

### 5.3 Pipeline (7 steps)
Idea → Analyst → Architect → Planner → Executor → UltraQA → Verifier.

### 5.4 Agents grid — 4 lanes × counts (matches §4.2 totals: 8/6/14/5).

### 5.5 Skills highlight (4 tiles)
| Name | Blurb |
|---|---|
| `$deep-interview` | Socratic requirements crystallization |
| `$ralplan` | Iterative consensus planning |
| `$team` | N coordinated agents on a shared task list |
| `$ralph` | Self-referential loop until complete |

### 5.6 Steps (3 cards)
1. Install Codex CLI — `npm i -g @openai/codex`
2. Install OMX — `npm i -g oh-my-codex` and run `omx setup`
3. Start `$autopilot` — `"autopilot build me X"`

### 5.7 Footer
GitHub (`Yeachan-Heo/oh-my-codex`), Docs link, Discord (`discord.gg/PUwSMR9XNk`).

### 5.8 Version badge
`src/app/[lang]/docs/layout.tsx` reads `OMX_VERSION` from `src/lib/version.ts`. The file is regenerated by `scripts/inject-omx-version.mjs` before every build; the script fetches upstream `package.json.version` (currently `0.13.2`) via a local cached clone or HTTP read. If fetch fails, the previous committed value is kept and build continues.

## 6. i18n Pipeline

### 6.1 Languages
`en` (default, `hideLocale: 'default-locale'`), `ko`, `zh`, `ja`. Defined in `src/lib/i18n.ts`.

### 6.2 Term-replacement matrix (applied when porting OMC copy)
| OMC | OMX |
|---|---|
| `Claude Code` | `Codex CLI` |
| `oh-my-claudecode`, `OMC` | `oh-my-codex`, `OMX` |
| `omc` (CLI) | `omx` |
| `/<skill>` invocation | `$<skill>` |
| `.omc/` path | `.omx/` |
| `~/.claude/**` | `~/.codex/**` |
| Claude model IDs | Codex model IDs per upstream README |

### 6.3 Validation
During implementation and before declaring done:
```bash
grep -rIn -E "claude-code|oh-my-claudecode|\\.omc/|\\bomc\\b|Claude Code" content/docs/ \
  | grep -v ":\\s*<!--" | grep -v "comparison"
```
Must return 0 lines outside deliberate comparison sections.

## 7. Deployment

### 7.1 Vercel
- Framework preset: Next.js
- Root dir: `oh-my-codex-docs/`
- Build command: `next build`
- Install command: `npm ci`
- Prebuild: `node scripts/inject-omx-version.mjs`
- Output: `.next/`
- Env vars: none required.

### 7.2 Domain
`omx.vibetip.help` — CNAME to Vercel. DNS wiring happens outside this spec (operator task).

### 7.3 Security headers
Copied verbatim from OMC `next.config.mjs`: X-Frame-Options `DENY`, X-Content-Type-Options `nosniff`, Referrer-Policy `strict-origin-when-cross-origin`, HSTS `max-age=63072000; includeSubDomains; preload`, DNS-Prefetch-Control `on`.

## 8. Acceptance Criteria

- [ ] `npm run build` completes with 0 errors and emits all routes × 4 locales statically.
- [ ] All routes `/`, `/docs`, `/docs/getting-started`, `/docs/agents`, `/docs/skills`, `/docs/hooks`, `/docs/tools`, `/docs/integrations`, `/docs/reference` respond 200 in each of `en`, `ko`, `zh`, `ja` (URL prefixes: `/`, `/ko/`, `/zh/`, `/ja/`).
- [ ] Sidebar renders 33 agents across 4 lanes and 37 skills across 2 lanes, every page reachable by click.
- [ ] Landing shows `33 agent prompts` and `37 skills`, counts identical to sidebar totals.
- [ ] Version badge equals current upstream OMX `package.json.version`.
- [ ] Search API (`/api/search`) returns results for a query in each of the 4 languages.
- [ ] Lighthouse (desktop): Performance ≥ 90, Accessibility ≥ 95.
- [ ] Grep gate (§6.3) returns 0 unintended OMC references.
- [ ] No `/plugin marketplace` wording; install flow reflects Codex CLI + `oh-my-codex` npm package.

## 9. Out of Scope

- PR to `Yeachan-Heo/oh-my-codex` repo.
- Deep rewrite of agent/skill body copy beyond the OMC-based port described in §4 (follow-up plan).
- Analytics dashboards, marketing pages, Discord automation.
- MCP tool wiring inside the docs site runtime.

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Term-replacement misses | Grep gate in §6.3, baked into acceptance. |
| Upstream OMX adds/removes skills or prompts between port and release | Implementation plan includes a catalog-audit step that lists `skills/` and `prompts/` from upstream and compares to `content/docs` inventory. |
| 4-language maintenance cost | `en` is canonical; `ko`/`zh`/`ja` initialized as machine-translated drafts with explicit human-review markers in the plan. |
| `version.ts` injection breaks under Turbopack | Fallback: commit a static `version.ts`; prebuild script only overwrites on success. |
| Domain propagation delay | Ship on `*.vercel.app` first, point CNAME once DNS is ready. |

## 11. Follow-Up Plans (not in this spec)

1. **Deep body rewrite** of every agent/skill MDX to reflect OMX behavior, not OMC's.
2. **Catalog auto-sync** from upstream `skills/` + `prompts/` at build time with a drift alert.
3. **OpenClaw deep guide** translating the 13-language `openclaw-integration.*.md` family into the docs site.
4. **MCP registry reference** once OMX's MCP surface stabilizes.
