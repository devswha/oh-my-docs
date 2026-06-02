---
name: update-gajae-docs
description: Refresh and verify the Gajae-Code documentation app from the latest upstream gajae-code repository. Use when the user asks to update Gajae-Code docs, sync docs from the latest Yeachan-Heo/gajae-code repo, bump the documented GC_VERSION, reconcile new gjc commands/skills/agents/tools, or check whether apps/gajae-code content is stale against upstream.
---

# Update Gajae-Code Docs

## Overview

Update `apps/gajae-code` in this monorepo using the latest `Yeachan-Heo/gajae-code` upstream as the source of truth. Keep the docs site buildable, localized, and aligned with upstream commands (`bun install -g gajae-code`, `gjc ...`), config (`~/.gjc/config.yml`), the `deep-interview → ralplan → ultragoal` loop, workflow skills, role agents, and runtime behavior.

Upstream is a Rust/Bun/Python monorepo (`crates/`, `packages/`, `python/`) whose `docs/` directory holds deep engineering notes, not an end-user guide tree. Curate: surface install/usage/config/loop facts for the docs site rather than mirroring internal design notes verbatim.

## Quick start

From the monorepo root, run the inspection helper first:

```bash
node .codex/skills/update-gajae-docs/scripts/inspect-upstream.mjs
```

Use `--json` for machine-readable output, `--no-fetch` to inspect an existing cache, `--branch <name>` to override the default `main`, or `--app apps/gajae-code` if the app path changes.

Read `references/mapping.md` when applying changes or when the upstream diff contains new files that are not obvious one-to-one docs updates.

## Workflow

### 1. Preflight

- Confirm the target app is `apps/gajae-code` unless the user says otherwise.
- Check `git status --short --branch`. Continue with local edits only when the dirty state is understood.
- Treat external deploys, Vercel setting changes, and publishing as separate explicit actions; this skill updates docs, not production.

### 2. Inspect latest upstream

Run the helper. It will clone or fast-forward `.omx/cache/upstream/gajae-code`, read upstream `package.json`, compare `apps/gajae-code/src/lib/version.ts` (`GC_VERSION`), list candidate upstream changes, and check locale/meta parity.

If the helper reports no version drift and no relevant changed files, stop with that evidence unless the user requested a forced refresh.

### 3. Decide the update scope

Classify upstream changes before editing:

- Version/release-note only
- CLI command/config/env behavior changes (`gjc ...`, `~/.gjc/config.yml`)
- New or changed workflow skills (`deep-interview`, `ralplan`, `team`, `ultragoal`)
- New or changed role agents (`executor`, `architect`, `planner`, `critic`)
- Tool/runtime behavior changes (`docs/*.md`, `docs/tools/*.md`)
- Landing/getting-started prose changes (incl. upstream `README.md`)
- Unmapped upstream changes requiring manual triage

Use `references/mapping.md` to pick target docs files.

### 4. Edit docs safely

- Preserve commands, code fences, config keys, env vars, paths, and package names (`gajae-code`, `gjc`, `@gajae-code/coding-agent`) verbatim from upstream.
- Adapt prose to the docs site's Fumadocs/MDX style instead of dumping raw upstream text.
- Preserve frontmatter shape and existing MDX components.
- Update all existing locale siblings (`.ko.mdx`, `.ja.mdx`, `.zh.mdx`) for changed content where practical. If a locale cannot be translated safely, add a localized TODO callout and report it as a known gap.
- When adding/removing pages, update the directory's `meta.json` plus locale meta files.

### 5. Version handling

`apps/gajae-code` has `scripts/inject-gc-version.mjs`, but upstream `Yeachan-Heo/gajae-code` is a Bun monorepo whose root `package.json` has no top-level `version` field. The inject script therefore falls back to the committed seed in `src/lib/version.ts`. To bump the documented version, edit the seed literal `GC_VERSION` in `apps/gajae-code/src/lib/version.ts` directly (or point the inject script's `RAW_URL` at a versioned sub-package), and call it out in the report.

### 6. Verify

```bash
npm run lint:gajae-code
npm run build:gajae-code
```

If package files changed, run `npm ci --prefix apps/gajae-code` before lint/build. If only prose changed and build is expensive, still run lint and report any skipped build explicitly.

### 7. Report or commit

Final report must include:

- Upstream HEAD and version inspected (and branch)
- Files changed in `apps/gajae-code`
- Locale coverage or translation gaps
- Validation commands and outcomes
- Unmapped upstream changes, if any
- Whether the `GC_VERSION` seed was bumped manually

If committing, use the repository's commit protocol and mention the upstream ref in `Tested:` or the body.
