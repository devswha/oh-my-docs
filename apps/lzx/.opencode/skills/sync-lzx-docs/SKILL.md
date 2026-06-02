---
name: sync-lzx-docs
description: Synchronize this documentation site with upstream code-yeongyu/lazycodex README, the lazycodex.ai web content, skill definitions, package metadata, docs style, and Patina prose guardrails.
---

# Sync LazyCodex Docs

Use this skill whenever editing this repository's LazyCodex (LZX) documentation based on upstream `code-yeongyu/lazycodex`.

## What LazyCodex is

LazyCodex packages [OmO (oh-my-openagent)](https://github.com/code-yeongyu/oh-my-openagent) as the Codex agent harness — "LazyVim for Codex." It is a thin distribution layer; the core engine is OmO, included as the `src/` submodule. Document the LZX surface (install, the command pillars, skills) faithfully, and reference OmO for the underlying harness behavior.

## Required Sources

Before changing content, inspect the current versions of these upstream sources when available:

- `README.md` (install, command pillars, skills table, "what you get", model routing, architecture)
- `packages/web/content/docs/*.md` — the official lazycodex.ai/docs source (overview, installation, ulw-plan, start-work, ulw-loop, ultrawork, skills). PRIMARY source for page content.
- `plugins/omo/skills/*/SKILL.md` — the installed skill definitions (review-work, remove-ai-slops, frontend-ui-ux, programming, lsp, rules, comment-checker, refactor, debugging, ultragoal).
- `plugins/omo/hooks/hooks.json`, `plugins/omo/components/*` — hooks and components.
- `package.json` (name `lazycodex-ai`, has a `version` field).
- The OmO harness depth lives in `.omx/cache/upstream/oh-my-openagent` and `apps/openagent` — reuse for agent/model-routing concepts since LZX IS OmO for Codex.

Prefer the local cache clone under `.omx/cache/upstream/lazycodex`. If stale or absent, use `gh` or a fresh clone, or run:

```bash
node .codex/skills/update-lzx-docs/scripts/inspect-upstream.mjs
```

## Naming Rules

- Product/site identity: LazyCodex, short form LZX.
- Upstream repository: `code-yeongyu/lazycodex`. npm package: `lazycodex-ai`.
- Install: `npx lazycodex-ai install` (NO global install — always npx). Autonomous: `npx lazycodex-ai install --no-tui --codex-autonomous`. Shorthand for `npx --yes --package oh-my-openagent omo install --platform=codex`.
- Platform: Codex (OpenAI). LZX is OmO packaged for Codex.
- Command pillars (`$command` syntax): `$ulw-plan`, `$start-work`, `$ulw-loop`; plus `/init-deep` for project memory.
- Do not invent commands, flags, model names, or skills. Prefer the README, `packages/web/content/docs/*`, and SKILL.md files.

## Voice Rules

Follow the shared docs voice unless the user asks otherwise:

- Start with what the reader can do now.
- Prefer short, direct Korean sentences over abstract explanation.
- Keep product facts precise; do not soften commands or flags.
- Avoid AI packaging: "혁신적인", "강력한", "핵심적인 가치", "명확합니다", "제공합니다" unless the word is doing real work.
- Use tables for reference material and small numbered lists for setup flows.
- Keep some English product terms as-is when the upstream surface uses them: agent, skill, hook, worktree, Codex, provider.

Use Patina as a prose guardrail, not a generic paraphraser:

1. Preserve semantic anchors: package names, commands, flags, version requirements, URLs.
2. Remove promotional or AI-sounding phrases.
3. Vary paragraph length; do not make every section the same shape.
4. If using Patina CLI/skill, prefer `--lang ko --diff` or audit-style review before overwriting docs.
5. Review meaning after any rewrite. If meaning drift appears, restore the original fact.

## Layout Rules

- Keep the Fumadocs left sidebar simple.
- Use `DocsLayout` `i18n={i18n}` instead of a custom sidebar footer language/theme block.
- Folder `meta.json` lists sub-page slugs only — do NOT list `"index"` (Fumadocs uses the folder's index.mdx as the folder landing; listing it duplicates the sidebar entry).
- Keep root nav order: `index`, `getting-started`, `guides`, then deeper sections.

## Content Workflow

1. Compare current docs against upstream README + `packages/web/content/docs/*` + SKILL.md facts.
2. Update English and Korean pages first.
3. Keep Japanese and Chinese routes navigable; if not fully localized, use concise faithful content rather than leaving routes empty.
4. Prefer tables and checklists for reference material.
5. When adding or reordering a section, update all relevant `meta*.json` files (en + `.ko`/`.zh`/`.ja`) with matching page-lists.
6. Keep examples executable and copy-safe.

## Verification

After editing docs:

- Check for stale package-name claims (`lazycodex` / `lazycodex-ai` / LZX, not `gajae-code`/`gjc`).
- Run `npm run lint`.
- Run `npm run build`.
- Smoke changed routes locally or in the browser.

## Output

Report which upstream sources were used, which pages changed, what verification passed, and any upstream ambiguity that remains.
