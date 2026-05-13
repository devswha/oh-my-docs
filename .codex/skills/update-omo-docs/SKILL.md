---
name: update-omo-docs
description: Refresh and verify the OpenAgent/OmO documentation app from the latest upstream oh-my-openagent repository. Use when the user asks to update OmO docs, sync docs from the latest oh-my-openagent/oh-my-opencode repo, bump documented OMO_VERSION, reconcile new agents/skills/hooks/tools/providers for OpenAgent or OpenCode, or check whether apps/openagent content is stale against upstream.
---

# Update OmO Docs

## Overview

Update `apps/openagent` in this monorepo using the latest `code-yeongyu/oh-my-openagent` upstream as the source of truth. Keep the docs site buildable, localized, and aligned with upstream commands (`bunx oh-my-openagent ...`), versions, agents, skills, hooks, providers, and runtime behavior. Treat the legacy package name `oh-my-opencode` as an alias when reading upstream docs.

## Quick start

From the monorepo root, run the inspection helper first:

```bash
node .codex/skills/update-omo-docs/scripts/inspect-upstream.mjs
```

Use `--json` for machine-readable output, `--no-fetch` to inspect an existing cache, `--branch main` if the user prefers `main` over the default `dev`, or `--app apps/openagent` if the app path changes.

Read `references/mapping.md` when applying changes or when the upstream diff contains new files that are not obvious one-to-one docs updates.

## Workflow

### 1. Preflight

- Confirm the target app is `apps/openagent` unless the user says otherwise.
- Check `git status --short --branch`. Continue with local edits only when the dirty state is understood.
- Treat external deploys, Vercel setting changes, and publishing as separate explicit actions; this skill updates docs, not production.

### 2. Inspect latest upstream

Run the helper. It will clone or fast-forward `.omx/cache/upstream/oh-my-openagent`, read upstream `package.json`, compare `apps/openagent/src/lib/version.ts` (`OMO_VERSION`), list candidate upstream changes, and check locale/meta parity.

If the helper reports no version drift and no relevant changed files, stop with that evidence unless the user requested a forced refresh.

### 3. Decide the update scope

Classify upstream changes before editing:

- Version/release-note only
- CLI command/config/env behavior changes (`bunx oh-my-openagent ...`)
- New or changed agents/prompts under upstream `prompts/` or `agents/`
- New or changed skills under upstream `skills/`
- Hook/runtime/provider/MCP behavior changes
- Landing/getting-started prose changes (incl. `docs/guide/installation.md`)
- Unmapped upstream changes requiring manual triage

Use `references/mapping.md` to pick target docs files.

### 4. Edit docs safely

- Preserve commands, code fences, config keys, env vars, paths, package names (`oh-my-openagent` / legacy `oh-my-opencode`), and skill invocations verbatim from upstream.
- Adapt prose to the docs site's Fumadocs/MDX style instead of dumping raw upstream text.
- Preserve frontmatter shape and existing MDX components.
- Update all existing locale siblings (`.ko.mdx`, `.ja.mdx`, `.zh.mdx`) for changed content where practical. If a locale cannot be translated safely, add a localized TODO callout and report it as a known gap.
- When adding/removing pages, update the directory's `meta.json` plus locale meta files.
- `apps/openagent` has no `inject-omo-version.mjs` — when upstream version changes, edit `apps/openagent/src/lib/version.ts` manually so `OMO_VERSION` matches and call it out in the report.

### 5. Verify

```bash
npm run lint:openagent
npm run build:openagent
```

If package files changed, run `npm ci --prefix apps/openagent` before lint/build. If only prose changed and build is expensive, still run lint and report any skipped build explicitly.

### 6. Report or commit

Final report must include:

- Upstream HEAD and version inspected (and branch — `dev` or `main`)
- Files changed in `apps/openagent`
- Locale coverage or translation gaps
- Validation commands and outcomes
- Unmapped upstream changes, if any
- Whether `OMO_VERSION` was bumped manually

If committing, use the repository's commit protocol and mention the upstream ref in `Tested:` or the body.
