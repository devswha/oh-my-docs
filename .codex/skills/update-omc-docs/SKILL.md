---
name: update-omc-docs
description: Refresh and verify the Claude Code/OMC documentation app from the latest upstream oh-my-claudecode repository. Use when the user asks to update OMC docs, sync docs from the latest oh-my-claudecode repo, bump documented OMC_VERSION, reconcile new agents/skills/hooks/tools/plugins for Claude Code orchestration, or check whether apps/claudecode content is stale against upstream.
---

# Update OMC Docs

## Overview

Update `apps/claudecode` in this monorepo using the latest `Yeachan-Heo/oh-my-claudecode` upstream as the source of truth. Keep the docs site buildable, localized, and aligned with upstream commands (`oh-my-claudecode ...`, `/oh-my-claudecode:<skill>`, `omc ...`), versions, agents, skills, hooks, tools, and plugin behavior. The legacy package name `claude-code-orchestrator` may still appear in migration content; treat it as legacy alias only.

## Quick start

From the monorepo root, run the inspection helper first:

```bash
node .codex/skills/update-omc-docs/scripts/inspect-upstream.mjs
```

Use `--json` for machine-readable output, `--no-fetch` to inspect an existing cache, `--branch dev` if the user prefers `dev` over the default `main`, or `--app apps/claudecode` if the app path changes.

Read `references/mapping.md` when applying changes or when the upstream diff contains new files that are not obvious one-to-one docs updates.

## Workflow

### 1. Preflight

- Confirm the target app is `apps/claudecode` unless the user says otherwise.
- Check `git status --short --branch`. Continue with local edits only when the dirty state is understood.
- Treat external deploys, Vercel setting changes, and publishing as separate explicit actions; this skill updates docs, not production.

### 2. Inspect latest upstream

Run the helper. It will clone or fast-forward `.omx/cache/upstream/oh-my-claudecode`, read upstream `package.json`, compare `apps/claudecode/src/lib/version.ts` (`OMC_VERSION`), list candidate upstream changes, and check locale/meta parity.

If the helper reports no version drift and no relevant changed files, stop with that evidence unless the user requested a forced refresh.

### 3. Decide the update scope

Classify upstream changes before editing:

- Version/release-note only
- CLI command/config/env behavior changes (`oh-my-claudecode ...`, `omc ...`, `/oh-my-claudecode:<skill>`)
- New or changed agents/prompts under upstream `agents/` or `prompts/`
- New or changed skills under upstream `skills/`
- Hook/runtime/MCP/plugin behavior changes
- Landing/getting-started prose changes (incl. `README.md`, `docs/**`)
- Unmapped upstream changes requiring manual triage

Use `references/mapping.md` to pick target docs files.

### 4. Edit docs safely

- Preserve commands, code fences, config keys, env vars, paths, package names (`oh-my-claudecode`, plugin marketplace `Yeachan-Heo/oh-my-claudecode`), and skill invocations verbatim from upstream.
- Adapt prose to the docs site's Fumadocs/MDX style instead of dumping raw upstream text.
- Preserve frontmatter shape and existing MDX components.
- Update all existing locale siblings (`.ko.mdx`, `.ja.mdx`, `.zh.mdx`) for changed content where practical. If a locale cannot be translated safely, add a localized TODO callout and report it as a known gap.
- When adding/removing pages, update the directory's `meta.json` plus locale meta files.
- `apps/claudecode` has `scripts/inject-omc-version.mjs` — it fetches upstream `package.json` and rewrites `src/lib/version.ts` automatically on `dev`/`build`. Do not hand-edit `version.ts`; instead let the script run, or trigger it manually with `node apps/claudecode/scripts/inject-omc-version.mjs`. Call it out in the report if version drift was reconciled this way.

### 5. Verify

```bash
npm run lint:claudecode
npm run build:claudecode
```

If package files changed, run `npm ci --prefix apps/claudecode` before lint/build. If only prose changed and build is expensive, still run lint and report any skipped build explicitly.

### 6. Report or commit

Final report must include:

- Upstream HEAD and version inspected (and branch — `main` or `dev`)
- Files changed in `apps/claudecode`
- Locale coverage or translation gaps
- Validation commands and outcomes
- Unmapped upstream changes, if any
- Whether `OMC_VERSION` was refreshed (via inject script) and the new value

If committing, use the repository's commit protocol and mention the upstream ref in `Tested:` or the body.
