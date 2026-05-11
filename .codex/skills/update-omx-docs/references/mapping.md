# OMX docs update mapping

Use this reference after running `scripts/inspect-upstream.mjs` when deciding which docs to edit.

## Repository roots

- Monorepo docs app: `apps/codex`
- Docs content root: `apps/codex/content/docs`
- Upstream source of truth: `https://github.com/Yeachan-Heo/oh-my-codex.git`, branch `main`
- Local upstream cache: `.omx/cache/upstream/oh-my-codex` from the monorepo root

## Common upstream-to-site mapping

| Upstream path | Site target |
| --- | --- |
| `package.json` version | `apps/codex/src/lib/version.ts` via `apps/codex/scripts/inject-omx-version.mjs` |
| `README.md` and localized READMEs | Landing/getting-started prose: `content/docs/index*.mdx`, `content/docs/getting-started/index*.mdx` |
| `CHANGELOG.md` / release notes | `content/docs/reference/changelog*.mdx` and `release-notes*.mdx` |
| `prompts/*.md` | `content/docs/agents/**/<prompt-slug>*.mdx`; update category `meta*.json` if pages are added/removed |
| `skills/*/SKILL.md` | `content/docs/skills/**/<skill-slug>*.mdx`; update category `meta*.json` if pages are added/removed |
| `docs/*hook*.md` or hook source changes | `content/docs/hooks/*.mdx` |
| `docs/*mcp*.md` or MCP config changes | `content/docs/integrations/mcp*.mdx` or `content/docs/tools/*.mdx` |
| CLI command behavior/config/env changes | `content/docs/reference/configuration*.mdx`, `environment*.mdx`, `quick-commands*.mdx` |
| Runtime state/HUD/wiki/tool changes | `content/docs/tools/*.mdx` and `content/docs/reference/omx-directory*.mdx` |

## Locale rules

The app currently ships English plus locale-suffixed MDX siblings, commonly `.ko.mdx`, `.ja.mdx`, and `.zh.mdx`.

- When editing a default English page, update every existing locale sibling in the same pass when practical.
- If a locale update is not safe, add a visible TODO callout near the changed section and report it as a validation gap.
- When adding a new page, add every existing locale sibling or document the exception; update `meta.json`, `meta.ko.json`, `meta.ja.json`, and `meta.zh.json` for that directory.
- Keep code fences, inline code, command names, env vars, paths, package names, and slash/skill invocations verbatim across locales.

## Content rules

- Treat upstream commands, config keys, code blocks, and safety warnings as authoritative.
- Preserve site-specific MDX structure: frontmatter, `<Cards>`, `<Card>`, `<Callout>`, `<Steps>`, `<Tabs>`, and Mermaid wrappers.
- Do not bulk-copy upstream prose when the docs page has product-site framing; merge the facts and keep the site tone.
- If upstream removes a behavior, remove or clearly deprecate the corresponding docs section instead of leaving stale guidance.
- Record unmapped upstream changes in the final report so they can be triaged later.
