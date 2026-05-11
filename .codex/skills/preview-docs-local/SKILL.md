---
name: preview-docs-local
description: Run and verify local Next/Fumadocs preview servers for this docs monorepo. Use when the user wants to check docs updates locally, preview changed OMX/Codex/Claude Code/OpenAgent docs pages, smoke-test local routes, derive preview URLs from changed MDX files, or keep a local dev server running for manual inspection.
---

# Preview Docs Local

## Overview

Preview docs changes locally for the three app directories in this monorepo: `apps/codex`, `apps/claudecode`, and `apps/openagent`. Prefer the bundled helper for repeatable server startup, changed-page URL derivation, and smoke checks.

## Quick start

For OMX docs changes:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --from-git
```

For non-interactive proof that a changed page renders:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --from-git --exit-after-smoke
```

Read `references/local-preview.md` for app keys, route derivation, and the manual visual checklist.

## Workflow

### 1. Pick the app

- OMX / Codex docs → `codex` (`apps/codex`, default port `3101`)
- Claude Code docs → `claudecode` (`apps/claudecode`, default port `3102`)
- OpenAgent docs → `openagent` (`apps/openagent`, default port `3103`)

When the user says “OMX docs,” use `codex`.

### 2. Run basic static checks first when docs were edited

For OMX docs, run these before or after the local preview depending on time:

```bash
npm --prefix apps/codex run check:localized-links
npm run lint:codex
```

Use the app-specific root scripts for other apps: `lint:claudecode`, `lint:openagent`, `build:*` when needed.

### 3. Start preview and smoke-check routes

Use `--from-git` to derive URLs from changed MDX files. Add `--path` for pages that changed indirectly through layout, sidebar, assets, or config.

Examples:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --from-git --path /docs
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs claudecode --path /ko/docs/getting-started
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs openagent --exit-after-smoke
```

If a server is already running, use `--smoke-only --port <port>` instead of starting another server.

### 4. Inspect visually

Report the preview URLs. For layout/content changes, inspect the pages manually in a browser or use the current environment’s available screenshot/browser tooling if present. Check sidebar, locale links, code blocks, cards/callouts/tabs, mobile width, and refresh behavior.

### 5. Stop cleanly

If the helper is running interactively, stop it with Ctrl-C after inspection. For agent evidence, prefer `--exit-after-smoke` so the command exits cleanly after the route checks.

## Reporting

Final report must include:

- App key and local base URL
- Routes checked
- Whether the server was stopped or intentionally left running
- Static checks run and outcomes
- Visual issues or remaining gaps
