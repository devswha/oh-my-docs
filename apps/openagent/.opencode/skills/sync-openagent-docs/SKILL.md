---
name: sync-openagent-docs
description: Synchronize this documentation site with upstream code-yeongyu/oh-my-openagent README, docs, package metadata, OMC docs style, and Patina prose guardrails.
---

# Sync OpenAgent Docs

Use this skill whenever editing this repository's OmO/OpenAgent documentation based on upstream `code-yeongyu/oh-my-openagent`.

## Required Sources

Before changing content, inspect the current versions of these upstream sources when available:

- `README.md`
- `package.json`
- `docs/guide/installation.md`
- `docs/guide/overview.md`
- `docs/guide/orchestration.md`
- `docs/reference/features.md`
- `docs/reference/configuration.md`
- `docs/reference/cli.md`
- `docs/manifesto.md`
- Relevant upstream `.opencode/skills/*/SKILL.md` files when documenting skills or harness behavior.

Also compare against the local/reference OMC docs when tone or layout is in scope:

- `/tmp/opencode/oh-my-claudecode-docs/content/docs/index.ko.mdx`
- `/tmp/opencode/oh-my-claudecode-docs/content/docs/getting-started/index.ko.mdx`
- `/tmp/opencode/oh-my-claudecode-docs/src/app/[lang]/docs/layout.tsx`
- `/tmp/opencode/patina/README.md` or `devswha/patina` for prose humanization rules.

Prefer a local clone under `/tmp/opencode/oh-my-openagent-source` if present. If it is stale or absent, use `gh` or a fresh clone outside the workspace.

## Naming Rules

- Product/site identity: Oh My OpenAgent, OmO.
- Upstream repository: `code-yeongyu/oh-my-openagent`.
- Published install command may still be `bunx oh-my-opencode ...`; do not rewrite it to `oh-my-openagent` unless upstream package metadata and installer docs confirm the rename.
- Explain the transition clearly: OpenAgent is the product identity; `oh-my-opencode` may remain the package/compatibility command.
- Do not invent model names or provider priorities. Prefer upstream docs, package metadata, and generated config/schema facts.

## Voice Rules

Follow the OMC docs voice unless the user asks otherwise:

- Start with what the reader can do now.
- Prefer short, direct Korean sentences over abstract explanation.
- Keep product facts precise; do not soften commands or flags.
- Avoid AI packaging: “혁신적인”, “강력한”, “핵심적인 가치”, “명확합니다”, “제공합니다” unless the word is doing real work.
- Use tables for reference material and small numbered lists for setup flows.
- Keep some English product terms as-is when the upstream surface uses them: provider, agent, category, skill, hook, workflow.

Use Patina as a prose guardrail, not as a generic paraphraser:

1. Preserve semantic anchors: package names, commands, flags, version requirements, URLs.
2. Remove promotional or AI-sounding phrases.
3. Vary paragraph length; do not make every section the same shape.
4. If using Patina CLI/skill, prefer `--lang ko --diff` or audit-style review before overwriting docs.
5. Review meaning after any rewrite. If meaning drift appears, restore the original fact.

## Layout Rules

When matching OMC docs:

- Keep the Fumadocs left sidebar simple.
- Use `DocsLayout` `i18n={i18n}` instead of a custom sidebar footer language/theme block.
- Put Support as an icon link in the top docs links, beside GitHub.
- Keep root nav order close to OMC: `index`, `getting-started`, `concepts`, `guides`, `agents`, `skills`, `hooks`, `tools`, `reference`, `support`.
- Do not add decorative sidebar styling unless the reference does.

## Content Workflow

1. Compare current docs against upstream README/docs/source facts.
2. Compare tone and sidebar behavior against OMC docs when requested.
3. Update English and Korean pages first.
4. Keep Japanese and Chinese routes navigable; if not fully localized, use concise English fallback content rather than leaving routes empty.
5. Prefer tables and checklists for reference material.
6. Use Mermaid only for high-value architecture or lifecycle diagrams. Remove decorative diagrams from detail pages.
7. When adding or reordering a section, update all relevant `meta*.json` files.
8. Keep examples executable and copy-safe.

## Harness Documentation Checklist

Cover these topics when they change upstream:

- Install flags and provider authentication.
- `doctor` diagnostics behavior.
- Agent catalog and role boundaries.
- Category + skill delegation rules.
- Continuation mechanisms: todos, Ralph/ulw loops, boulder state, background tasks.
- Tool surfaces: LSP, AST-Grep, tmux/browser/manual QA, Context7/web/GitHub search.
- Hook families: routing, continuation, recovery, tool integration, context injection.
- Config paths, model overrides, variants, `fallback_models`, environment variables.
- Telemetry opt-out variables and privacy notes.

## Verification

After editing docs:

- Check for excessive `<Mermaid` usage.
- Check for stale package-name claims.
- Run `npm run lint`.
- Run `npm run build`.
- Smoke changed routes locally or in the browser.
- If deploying, smoke the same routes on `https://omo.vibetip.help`.

## Output

Report:

- Which upstream/reference sources were used.
- Which pages or layout files changed.
- What verification passed.
- Any upstream ambiguity that remains.
