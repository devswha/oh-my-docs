# Gajae-Code docs update mapping

Use this reference after running `scripts/inspect-upstream.mjs` when deciding which docs to edit.

## Repository roots

- Monorepo docs app: `apps/gajae-code`
- Docs content root: `apps/gajae-code/content/docs`
- Upstream source of truth: `https://github.com/Yeachan-Heo/gajae-code.git`, default branch `main`
- Local upstream cache: `.omx/cache/upstream/gajae-code` from the monorepo root
- Upstream is a Rust/Bun/Python monorepo (`crates/`, `packages/`, `python/`); `docs/` holds deep engineering notes, not an end-user guide tree.

## Common upstream-to-site mapping

| Upstream path | Site target |
| --- | --- |
| `package.json` version (none at root — Bun monorepo) | `apps/gajae-code/src/lib/version.ts` (`GC_VERSION`) — edit the seed literal manually; `inject-gc-version.mjs` falls back to it |
| `README.md` | Landing/getting-started prose: `content/docs/index*.mdx`, `content/docs/getting-started/index*.mdx` |
| `README.md` install/usage section (`bun install -g gajae-code`, `gjc --tmux`) | `content/docs/index*.mdx` install section, getting-started install/launch steps |
| `README.md` retry/config (`~/.gjc/config.yml`) | getting-started configuration section, future `content/docs/reference/configuration*.mdx` |
| `README.md` workflow surface (`deep-interview`/`ralplan`/`team`/`ultragoal`) | `content/docs/index*.mdx` workflow tables, future `content/docs/skills/*.mdx` |
| `README.md` role agents (`executor`/`architect`/`planner`/`critic`) | `content/docs/index*.mdx` agent tables, future `content/docs/agents/*.mdx` |
| `docs/*.md` (runtime internals) | future `content/docs/concepts/*.mdx` or `content/docs/reference/*.mdx` — curate, do not mirror verbatim |
| `docs/tools/*.md` | future `content/docs/tools/*.mdx`; update category `meta*.json` if pages are added/removed |
| `AGENTS.md` | agent role/boundary docs |

## Locale rules

The app currently ships English plus locale-suffixed MDX siblings: `.ko.mdx`, `.ja.mdx`, and `.zh.mdx`.

- When editing a default English page, update every existing locale sibling in the same pass when practical.
- If a locale update is not safe, add a visible TODO callout near the changed section and report it as a validation gap.
- When adding a new page, add every existing locale sibling or document the exception; update `meta.json`, `meta.ko.json`, `meta.ja.json`, and `meta.zh.json` for that directory.
- Keep code fences, inline code, command names, env vars, paths, package names, and CLI invocations verbatim across locales.

## Content rules

- Treat upstream commands, config keys, code blocks, and safety warnings as authoritative.
- Preserve site-specific MDX structure: frontmatter, `<Cards>`, `<Card>`, `<Callout>`, `<Steps>`, `<Tabs>`, and Mermaid wrappers.
- Do not bulk-copy upstream prose when the docs page has product-site framing; merge the facts and keep the site tone.
- Keep the package identity consistent: `gajae-code` / `gjc`, not `oh-my-*`.
- If upstream removes a behavior, remove or clearly deprecate the corresponding docs section instead of leaving stale guidance.
- Record unmapped upstream changes in the final report so they can be triaged later.
