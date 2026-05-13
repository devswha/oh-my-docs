# OmO docs update mapping

Use this reference after running `scripts/inspect-upstream.mjs` when deciding which docs to edit.

## Repository roots

- Monorepo docs app: `apps/openagent`
- Docs content root: `apps/openagent/content/docs`
- Upstream source of truth: `https://github.com/code-yeongyu/oh-my-openagent.git`, default branch `dev` (override with `--branch main` if needed)
- Local upstream cache: `.omx/cache/upstream/oh-my-openagent` from the monorepo root
- Legacy package alias to expect in upstream docs: `oh-my-opencode`

## Common upstream-to-site mapping

| Upstream path | Site target |
| --- | --- |
| `package.json` version | `apps/openagent/src/lib/version.ts` (`OMO_VERSION`) — edited manually; there is no inject script |
| `README.md` and localized READMEs | Landing/getting-started prose: `content/docs/index*.mdx`, `content/docs/getting-started/index*.mdx` |
| `docs/guide/installation.md` | `content/docs/index*.mdx` install section, getting-started install steps |
| `CHANGELOG.md` / release notes | `content/docs/reference/changelog*.mdx` and `release-notes*.mdx` if present |
| `prompts/*.md` or `agents/*` | `content/docs/agents/**/<slug>*.mdx`; update category `meta*.json` if pages are added/removed |
| `skills/*/SKILL.md` | `content/docs/skills/**/<slug>*.mdx`; update category `meta*.json` if pages are added/removed |
| `docs/*hook*.md` or hook source changes | `content/docs/hooks/*.mdx` |
| `docs/*mcp*.md` or MCP config changes | `content/docs/integrations/mcp*.mdx` or `content/docs/tools/*.mdx` |
| Provider/auth/config changes | `content/docs/reference/configuration*.mdx`, `environment*.mdx` |
| CLI command behavior changes (`install`, `doctor`, `ultrawork`, …) | `content/docs/reference/quick-commands*.mdx`, getting-started step list |

## Locale rules

The app currently ships English plus locale-suffixed MDX siblings, commonly `.ko.mdx`, `.ja.mdx`, and `.zh.mdx`.

- When editing a default English page, update every existing locale sibling in the same pass when practical.
- If a locale update is not safe, add a visible TODO callout near the changed section and report it as a validation gap.
- When adding a new page, add every existing locale sibling or document the exception; update `meta.json`, `meta.ko.json`, `meta.ja.json`, and `meta.zh.json` for that directory.
- Keep code fences, inline code, command names, env vars, paths, package names, and CLI invocations verbatim across locales.

## Content rules

- Treat upstream commands, config keys, code blocks, and safety warnings as authoritative.
- Preserve site-specific MDX structure: frontmatter, `<Cards>`, `<Card>`, `<Callout>`, `<Steps>`, `<Tabs>`, and Mermaid wrappers.
- Do not bulk-copy upstream prose when the docs page has product-site framing; merge the facts and keep the site tone.
- When the upstream renames `oh-my-opencode` → `oh-my-openagent` (or vice versa) in commands, propagate the new package name everywhere in docs except where the legacy alias is intentionally called out (e.g., the `doctor` warning about legacy package names).
- If upstream removes a behavior, remove or clearly deprecate the corresponding docs section instead of leaving stale guidance.
- Record unmapped upstream changes in the final report so they can be triaged later.
