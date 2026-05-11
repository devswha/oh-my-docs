---
name: preview-docs-local
description: Run and verify local or remote-server Next/Fumadocs preview servers for this docs monorepo. Use when the user wants to check docs updates in a browser, preview changed OMX/Codex/Claude Code/OpenAgent docs pages, bind a dev server on 0.0.0.0 for remote access, smoke-test routes, derive preview URLs from changed MDX files, or keep a dev server running for manual inspection.
---

# Preview Docs Local

## Overview

Preview docs changes for the three app directories in this monorepo: `apps/codex`, `apps/claudecode`, and `apps/openagent`. Support both local-only use and remote-server use where the dev server binds to `0.0.0.0`, smoke checks through `127.0.0.1`, and reports browser-facing LAN/Tailscale/public URLs.

## Quick start

For OMX docs changes on a remote server, use remote mode:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --from-git
```

If you know the browser-facing hostname, pass it explicitly:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --public-url http://home-server:3101 --from-git
```

For local-only use:

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

Use `--remote` by default when working on the user's remote server. It binds the dev server to `0.0.0.0`, checks readiness through `127.0.0.1`, and prints browser-facing candidate URLs. Use `--public-url` or `DOCS_PREVIEW_<APP>_PUBLIC_URL` when the stable external hostname is known.

Use `--from-git` to derive URLs from changed MDX files. Add `--path` for pages that changed indirectly through layout, sidebar, assets, or config.

Examples:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --from-git --path /docs
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs claudecode --remote --path /ko/docs/getting-started
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs openagent --remote --exit-after-smoke
```

If a server is already running, use `--smoke-only --port <port>` instead of starting another server. For a remote server that is already bound externally, combine it with `--remote` or `--check-host 127.0.0.1 --public-url <url>`.

### 4. Inspect visually

Report both the internal smoke URL and the browser-facing preview URL. On remote servers, tell the user to open the `--public-url` URL or one of the generated LAN/Tailscale candidates. For layout/content changes, inspect the pages manually in a browser or use the current environment’s available screenshot/browser tooling if present. Check sidebar, locale links, code blocks, cards/callouts/tabs, mobile width, and refresh behavior.

### 5. Stop cleanly

If the helper is running interactively, stop it with Ctrl-C after inspection. For agent evidence, prefer `--exit-after-smoke` so the command exits cleanly after the route checks.

## Reporting

Final report must include:

- App key, bind host, internal smoke base URL, and browser-facing preview URL
- Routes checked
- Whether the server was stopped or intentionally left running
- Static checks run and outcomes
- Visual issues or remaining gaps
