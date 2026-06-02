---
name: update-lzx-docs
description: Refresh and verify the LazyCodex (LZX) documentation app from the latest upstream lazycodex repository. Use when the user asks to update LZX/LazyCodex docs, sync docs from the latest code-yeongyu/lazycodex repo, bump the documented LZX_VERSION, reconcile new commands/skills/hooks, or check whether apps/lzx content is stale against upstream.
---

# Update LazyCodex Docs

## Overview

Update `apps/lzx` in this monorepo using the latest `code-yeongyu/lazycodex` upstream as the source of truth. LazyCodex packages OmO (oh-my-openagent) as the Codex agent harness — "LazyVim for Codex." Keep the docs site buildable, localized, and aligned with the upstream install command (`npx lazycodex-ai install`), the command pillars (`$ulw-plan`, `$start-work`, `$ulw-loop`, `/init-deep`), the skills, hooks, and model routing.

## Quick start

From the monorepo root, run the inspection helper first:

```bash
node .codex/skills/update-lzx-docs/scripts/inspect-upstream.mjs
```

Use `--json`, `--no-fetch`, `--branch <name>` (default `main`), or `--app apps/lzx`. Read `references/mapping.md` when applying changes.

## Workflow

### 1. Preflight

- Confirm the target app is `apps/lzx` unless the user says otherwise.
- Check `git status --short --branch`.
- Treat external deploys and Vercel changes as separate explicit actions; this skill updates docs.

### 2. Inspect latest upstream

Run the helper. It clones/fast-forwards `.omx/cache/upstream/lazycodex`, reads upstream `package.json` (it HAS a `version` field), compares `apps/lzx/src/lib/version.ts` (`LZX_VERSION`), lists candidate changes, and checks locale/meta parity.

### 3. Primary sources

LazyCodex has no `docs/` tree; its docs live in the website package and skill definitions:

- `packages/web/content/docs/*.md` — the official lazycodex.ai/docs content (overview, installation, ulw-plan, start-work, ulw-loop, ultrawork, skills). PRIMARY.
- `README.md` — install, command pillars, skills table, "what you get", model routing, architecture.
- `plugins/omo/skills/*/SKILL.md` — installed skill definitions.
- `plugins/omo/hooks/hooks.json`, `plugins/omo/components/*` — hooks/components.
- OmO harness depth: `.omx/cache/upstream/oh-my-openagent` and `apps/openagent` (LZX IS OmO for Codex).

### 4. Edit docs safely

- Preserve commands, flags, package names verbatim: `npx lazycodex-ai install`, `npx lazycodex-ai install --no-tui --codex-autonomous`, `$ulw-plan`, `$start-work`, `$ulw-loop`, `/init-deep`.
- Identity: LazyCodex / LZX, npm package `lazycodex-ai`, platform Codex. Never `gajae-code`/`gjc`/`oh-my-*` in product copy.
- Update all existing locale siblings (`.ko`/`.ja`/`.zh`); update `meta*.json` for added/removed pages (do NOT list `"index"` in folder metas).

### 5. Version

The build runs `scripts/inject-lzx-version.mjs`, which fetches the upstream root `package.json` version and writes `LZX_VERSION`. Bump the seed in `apps/lzx/src/lib/version.ts` only if pinning manually.

### 6. Verify

```bash
npm run lint:lzx
npm run build:lzx
```

### 7. Report or commit

Report upstream HEAD/version, files changed in `apps/lzx`, locale coverage, validation outcomes, and any unmapped upstream changes.
