# OMC docs update mapping

Use this reference after running `scripts/inspect-upstream.mjs` when deciding which docs to edit.

## Repository roots

- Monorepo docs app: `apps/claudecode`
- Docs content root: `apps/claudecode/content/docs`
- Upstream source of truth: `https://github.com/Yeachan-Heo/oh-my-claudecode.git`, default branch `main` (override with `--branch dev` if needed)
- Local upstream cache: `.omx/cache/upstream/oh-my-claudecode` from the monorepo root
- Legacy package alias to expect in upstream/migration docs: `claude-code-orchestrator`

## Common upstream-to-site mapping

| Upstream path | Site target |
| --- | --- |
| `package.json` version | `apps/claudecode/src/lib/version.ts` (`OMC_VERSION`) — refreshed by `scripts/inject-omc-version.mjs`; do not hand-edit |
| `README.md` and localized READMEs | Landing/getting-started prose: `content/docs/index*.mdx`, `content/docs/getting-started/index*.mdx` |
| `docs/installation*.md` | `content/docs/index*.mdx` install section, getting-started install steps |
| `CHANGELOG.md` / release notes | `content/docs/reference/changelog*.mdx` and `release-notes*.mdx` if present |
| `prompts/*.md` or `agents/*` | `content/docs/agents/**/<slug>*.mdx`; update category `meta*.json` if pages are added/removed |
| `skills/*/SKILL.md` | `content/docs/skills/**/<slug>*.mdx`; update category `meta*.json` if pages are added/removed |
| `hooks/*` or hook source changes | `content/docs/hooks/*.mdx` |
| `commands/*` or slash-command changes | `content/docs/reference/commands*.mdx`, `content/docs/skills/**/*.mdx` |
| MCP config changes | `content/docs/integrations/mcp*.mdx` or `content/docs/tools/*.mdx` |
| Plugin/marketplace changes | `content/docs/reference/migration*.mdx`, getting-started plugin install steps |
| Provider/auth/config changes | `content/docs/reference/configuration*.mdx`, `environment*.mdx` |
| CLI command behavior changes (`omc setup`, `omc doctor`, `omc update`, …) | `content/docs/reference/quick-commands*.mdx`, getting-started step list |

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
- When upstream renames slash commands (`/oh-my-claudecode:<name>`) or skill paths, propagate the new identifier everywhere in docs.
- The legacy npm name `claude-code-orchestrator` should only appear inside explicit migration content. Anywhere else, use `oh-my-claudecode`.
- If upstream removes a behavior, remove or clearly deprecate the corresponding docs section instead of leaving stale guidance.
- Record unmapped upstream changes in the final report so they can be triaged later.
