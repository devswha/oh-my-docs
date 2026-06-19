# Docs apps — upstream source of truth & per-app facts

Use this when running the `review-docs` workflow. The **upstream repo is the only authority** for what a feature is, what it is called, and whether it exists. Never carry a feature from one product into another's docs.

## Per-app mapping

### apps/codex — Oh My Codex
- Upstream: `https://github.com/Yeachan-Heo/oh-my-codex` (branch `main`)
- Version inject: `apps/codex/scripts/inject-omx-version.mjs` → `src/lib/version.ts`
- Live: https://omx.vibetip.help
- Product: multi-agent orchestration layer for the OpenAI Codex CLI.
- Has an extra `content/for-everyone` collection (see `source.config.ts`).

### apps/claudecode — Oh My Claude Code
- Upstream: `https://github.com/Yeachan-Heo/oh-my-claudecode` (branch `main`)
- Version inject: `apps/claudecode/scripts/inject-omc-version.mjs`
- Product: multi-agent orchestration layer for Claude Code. npm-ish name `omc`.

### apps/openagent — Oh My OpenAgent (OmO)
- Upstream: `https://github.com/code-yeongyu/oh-my-openagent` (branch `dev` — note: not `main`)
- Version inject: `apps/openagent/scripts/inject-omo-version.mjs`
- Product: multi-model orchestration harness for OpenCode. This IS the OmO engine that LazyCodex repackages.

### apps/gajae-code — Gajae-Code (`gjc`)
- Upstream: `https://github.com/Yeachan-Heo/gajae-code` (branch `main`)
- Version inject: `apps/gajae-code/scripts/inject-gc-version.mjs`
- Product: red-claw coding-agent harness, binary `gjc`, npm `gajae-code`.
- gjc-specific surface (do NOT leak into other apps): workflows `deep-interview`, `ralplan`, `ultragoal`, `team`; role agents `executor`, `architect`, `planner`, `critic`; `auth-broker`/`auth-gateway`; the `usage` status-line segment (5h/7d).

### apps/lzx — LazyCodex (`lzx`)
- Upstream: `https://github.com/code-yeongyu/lazycodex` (branch `main`); packages OmO (`code-yeongyu/oh-my-openagent`).
- Version inject: `apps/lzx/scripts/inject-lzx-version.mjs`
- Live: https://lzx.vibetip.help
- Product: OmO packaged as the Codex agent harness ("LazyVim for Codex"). Install `npx lazycodex-ai install`.
- Command pillars: `$ulw-plan`, `$start-work`, `$ulw-loop`, `/init-deep`. Concept: **ultrawork** (NOT "ultragoal" — that is gjc; it was removed from these docs).
- Upstream skills live at `plugins/omo/skills/*`; components at `plugins/omo/components/*`; hooks at `plugins/omo/hooks/hooks.json`.
- OmO depth: `.omx/cache/upstream/oh-my-openagent` and `apps/openagent`.

## Where to look in an upstream repo

| Want to verify | Typical upstream location |
| --- | --- |
| Install line / CLI / flags | `README.md`, the package `bin`, `packages/web/content/docs/installation.md` (lzx) |
| Skills | skills dir, e.g. `plugins/omo/skills/*/SKILL.md` (OmO/lzx) |
| Components / hooks | `plugins/omo/components/*`, `plugins/omo/hooks/hooks.json` (OmO/lzx) |
| Official doc copy | `packages/web/content/docs/*.md` (lzx); `README.md` (others) |
| Version | upstream root `package.json` `version` |

## Existing per-app skills (reuse, don't duplicate)

- `.codex/skills/update-lzx-docs/` — lzx update + `scripts/inspect-upstream.mjs` (clones/fast-forwards the cache, diffs version/meta).
- `apps/lzx/.opencode/skills/sync-lzx-docs/SKILL.md`
- `apps/gajae-code/.opencode/skills/sync-gajae-docs/SKILL.md`

`review-docs` is the cross-app fact-check + humanize + ship loop; the `sync-*`/`update-*` skills are the per-app content-refresh helpers. Use them together: sync/update to pull new upstream content, then `review-docs` to fact-check, de-slop (English-only), verify, and deploy.

## Locale & link rules (all apps)

- Locales: `en` (default, unprefixed) + `.ko` + `.zh` + `.ja`.
- Non-English links must be locale-prefixed (`/ko/docs/...`); enforced by `scripts/check-localized-doc-links.mjs`.
- Keep `meta.json` + `meta.ko/zh/ja.json` page-lists consistent; do NOT list `"index"`.

## Verify & deploy commands (all apps)

```bash
npm run check:localized-links --prefix apps/<app>
npm run lint:<app>
npm run build:<app>
npm run vercel:deploy:<app>          # preview
npm run vercel:deploy:<app>:prod     # production
```
