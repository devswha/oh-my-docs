# Local docs preview reference

## Apps

| App key | Path | Default port | Purpose |
| --- | --- | ---: | --- |
| `codex` | `apps/codex` | `3101` | OMX / Codex docs |
| `claudecode` | `apps/claudecode` | `3102` | Claude Code docs |
| `openagent` | `apps/openagent` | `3103` | OpenAgent docs |

## Useful commands

Start the OMX docs dev server and smoke-check changed docs pages from git:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --from-git
```

Start, smoke-check, and stop automatically for CI/agent evidence:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --from-git --exit-after-smoke
```

Check a specific route on an already-running server:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --smoke-only --path /docs/getting-started
```

Dry-run planned commands/URLs:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --from-git --dry-run
```

## Route derivation

`--from-git` maps changed MDX files under `apps/<app>/content/docs` to routes:

- `content/docs/index.mdx` → `/docs`
- `content/docs/getting-started/index.mdx` → `/docs/getting-started`
- `content/docs/reference/quick-commands.mdx` → `/docs/reference/quick-commands`
- `content/docs/getting-started/index.ko.mdx` → `/ko/docs/getting-started`
- `content/docs/index.ja.mdx` → `/ja/docs`
- `content/docs/index.zh.mdx` → `/zh/docs`

## Manual visual checklist

For each changed page, inspect at least one desktop width and one narrow/mobile width if layout changed. Check:

- Sidebar entry appears and highlights correctly.
- Locale switch keeps the matching page when a locale sibling exists.
- Code blocks, command snippets, tables, Cards, Callouts, Tabs, Steps, and Mermaid blocks render.
- Internal links stay within the intended app and locale.
- The page has no hydration overlay, console error, or 404 after refresh.

## Stop condition

Local preview is complete when the changed routes return HTTP 2xx/3xx, the relevant pages render visually, and the dev server is stopped unless the user asked to keep it running.
