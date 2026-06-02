---
name: sync-gajae-docs
description: Synchronize this documentation site with upstream Yeachan-Heo/gajae-code README, docs/, package metadata, docs style, and Patina prose guardrails.
---

# Sync Gajae-Code Docs

Use this skill whenever editing this repository's Gajae-Code documentation based on upstream `Yeachan-Heo/gajae-code`.

## Required Sources

Before changing content, inspect the current versions of these upstream sources when available:

- `README.md`
- `package.json` (note: Bun monorepo; the root manifest has no top-level `version` field)
- `AGENTS.md`
- `docs/*.md` (architecture and runtime internals — e.g. `session.md`, `compaction.md`, `models.md`, `keybindings.md`, `environment-variables.md`)
- `docs/tools/*.md` (per-tool reference: `bash.md`, `edit.md`, `lsp.md`, `search.md`, ...)
- Relevant upstream skill/agent definitions when documenting workflow skills or role agents.

The upstream layout is a Rust/Bun/Python monorepo (`crates/`, `packages/`, `python/`) whose docs are deep engineering notes, NOT an end-user `docs/guide/*` tree. Curate: surface install/usage/config/loop facts for the docs site rather than mirroring internal design notes verbatim.

Prefer the local cache clone under `.omx/cache/upstream/gajae-code` if present. If it is stale or absent, use `gh` or a fresh clone, or run the inspection helper:

```bash
node .codex/skills/update-gajae-docs/scripts/inspect-upstream.mjs
```

## Naming Rules

- Product/site identity: Gajae-Code, `gjc`.
- Upstream repository: `Yeachan-Heo/gajae-code`.
- Install command: `bun install -g gajae-code` (installs the `gjc` binary). Scoped package: `@gajae-code/coding-agent`. Use Bun, not npm/yarn/pnpm.
- Launch: `gjc --tmux` (recommended), `gjc`, or `gjc --tmux --worktree <path>`.
- Config path: `~/.gjc/config.yml`.
- Do not invent model names, flags, or provider priorities. Prefer upstream README, docs, and package/config facts.

## Core Method

Gajae-Code focuses on one loop. Document it faithfully:

```text
deep-interview -> ralplan -> ultragoal
                         └─ optional team execution when parallel tmux workers help
```

- Workflow skills: `deep-interview`, `ralplan`, `team`, `ultragoal`.
- Role agents: `executor`, `architect`, `planner`, `critic`.

## Voice Rules

Follow the shared docs voice unless the user asks otherwise:

- Start with what the reader can do now.
- Prefer short, direct Korean sentences over abstract explanation.
- Keep product facts precise; do not soften commands or flags.
- Avoid AI packaging: "혁신적인", "강력한", "핵심적인 가치", "명확합니다", "제공합니다" unless the word is doing real work.
- Use tables for reference material and small numbered lists for setup flows.
- Keep some English product terms as-is when the upstream surface uses them: agent, skill, worktree, tmux, provider.

Use Patina as a prose guardrail, not a generic paraphraser:

1. Preserve semantic anchors: package names, commands, flags, version requirements, URLs.
2. Remove promotional or AI-sounding phrases.
3. Vary paragraph length; do not make every section the same shape.
4. If using Patina CLI/skill, prefer `--lang ko --diff` or audit-style review before overwriting docs.
5. Review meaning after any rewrite. If meaning drift appears, restore the original fact.

## Layout Rules

- Keep the Fumadocs left sidebar simple.
- Use `DocsLayout` `i18n={i18n}` instead of a custom sidebar footer language/theme block.
- Put Support as an icon link in the top docs links, beside GitHub, when a support page exists.
- Keep root nav order shallow: `index`, `getting-started`, then deeper sections as content grows.
- Do not add decorative sidebar styling unless the reference does.

## Content Workflow

1. Compare current docs against upstream README/docs/source facts.
2. Update English and Korean pages first.
3. Keep Japanese and Chinese routes navigable; if not fully localized, use concise English fallback content rather than leaving routes empty.
4. Prefer tables and checklists for reference material.
5. Use Mermaid only for high-value architecture or lifecycle diagrams.
6. When adding or reordering a section, update all relevant `meta*.json` files (en + `.ko`/`.zh`/`.ja`).
7. Keep examples executable and copy-safe.

## Verification

After editing docs:

- Check for excessive `<Mermaid` usage.
- Check for stale package-name claims (`gajae-code` / `gjc`, not `oh-my-*`).
- Run `npm run lint`.
- Run `npm run build`.
- Smoke changed routes locally or in the browser.

## Output

Report:

- Which upstream/reference sources were used.
- Which pages or layout files changed.
- What verification passed.
- Any upstream ambiguity that remains.
