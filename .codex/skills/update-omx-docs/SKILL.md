---
name: update-omx-docs
description: Refresh and verify the Codex/OMX documentation app from the latest upstream oh-my-codex repository. Use when the user asks to update OMX docs, sync docs from the latest OMX repo, bump documented OMX versions, reconcile new agents/skills/hooks/tools, or check whether apps/codex content is stale against upstream.
---

# Update OMX Docs

## Overview

Update `apps/codex` in this monorepo using the latest `Yeachan-Heo/oh-my-codex` upstream as the source of truth. Keep the docs site buildable, localized, and aligned with upstream commands, versions, agents, skills, hooks, and runtime behavior.

## Quick start

From the monorepo root, run the inspection helper first:

```bash
node .codex/skills/update-omx-docs/scripts/inspect-upstream.mjs
```

Use `--json` for machine-readable output, `--no-fetch` to inspect an existing cache, or `--app apps/codex` if the app path changes.

Read `references/mapping.md` when applying changes or when the upstream diff contains new files that are not obvious one-to-one docs updates.

## Workflow

### 1. Preflight

- Confirm the target app is `apps/codex` unless the user says otherwise.
- Check `git status --short --branch`. Continue with local edits only when the dirty state is understood.
- Treat external deploys, Vercel setting changes, and publishing as separate explicit actions; this skill updates docs, not production.

### 2. Inspect latest upstream

Run the helper. It will clone or fast-forward `.omx/cache/upstream/oh-my-codex`, read upstream `package.json`, compare `apps/codex/src/lib/version.ts`, list candidate upstream changes, and check locale/meta parity.

If the helper reports no version drift and no relevant changed files, stop with that evidence unless the user requested a forced refresh.

### 3. Decide the update scope

Classify upstream changes before editing:

- Version/release note only
- Command/config/env behavior changes
- New or changed agents under upstream `prompts/`
- New or changed skills under upstream `skills/`
- Hook/runtime/tool behavior changes
- Landing/getting-started prose changes
- Unmapped upstream changes requiring manual triage

Use `references/mapping.md` to pick target docs files.

### 4. Edit docs safely

- Preserve commands, code fences, config keys, env vars, paths, package names, and skill invocations verbatim from upstream.
- Adapt prose to the docs site's Fumadocs/MDX style instead of dumping raw upstream text.
- Preserve frontmatter shape and existing MDX components.
- Update all existing locale siblings for changed content where practical. If a locale cannot be translated safely, add a localized TODO callout and report it as a known gap.
- When adding/removing pages, update the directory's `meta.json` plus locale meta files.
- Run `node apps/codex/scripts/inject-omx-version.mjs` when upstream version changes.

### 5. Verify

Run the smallest proof first, then full app checks:

```bash
npm --prefix apps/codex run check:localized-links
npm run lint:codex
npm run build:codex
```

If package files changed, run `npm ci --prefix apps/codex` before lint/build. If only prose changed and build is expensive, still run at least the localized-link checker and lint; report any skipped build explicitly.

### 6. Report or commit

Final report must include:

- Upstream HEAD and version inspected
- Files changed in `apps/codex`
- Locale coverage or translation gaps
- Validation commands and outcomes
- Unmapped upstream changes, if any

If committing, use the repository's Lore commit protocol and mention the upstream ref in `Tested:` or the body.
