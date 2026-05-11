# Local docs preview reference

## Apps

| App key | Path | Default port | Purpose |
| --- | --- | ---: | --- |
| `codex` | `apps/codex` | `3101` | OMX / Codex docs |
| `claudecode` | `apps/claudecode` | `3102` | Claude Code docs |
| `openagent` | `apps/openagent` | `3103` | OpenAgent docs |

## Useful commands

Start the OMX docs dev server on a remote server and smoke-check changed docs pages from git:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --from-git
```

Use a stable browser-facing URL when available:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --public-url http://home-server:3101 --from-git
```

Local-only fallback:

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
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --from-git --dry-run
```


## Remote server mode

Use `--remote` for the user's normal workflow on a remote development server.

Behavior:

- Binds Next to `0.0.0.0` so a browser outside the server can connect.
- Uses `127.0.0.1` for internal smoke checks so validation does not depend on DNS, Tailscale, or firewall routing.
- Prints browser-facing URLs separately from internal smoke URLs.
- If `--public-url` is omitted, prints detected non-loopback IPv4 candidates plus `http://<remote-host>:<port>`.

Recommended forms:

```bash
# Tailscale/LAN hostname known
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --public-url http://home-server:3101 --from-git

# URL from environment, useful for repeated sessions
DOCS_PREVIEW_CODEX_PUBLIC_URL=http://home-server:3101   node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --from-git

# Agent proof only: start, check internally, stop
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --remote --path /docs --exit-after-smoke
```

Environment variable precedence for browser-facing URLs:

1. `DOCS_PREVIEW_<APP>_PUBLIC_URL`, e.g. `DOCS_PREVIEW_CODEX_PUBLIC_URL`
2. `DOCS_PREVIEW_PUBLIC_URL`
3. `PREVIEW_PUBLIC_URL`
4. Auto-detected candidate URLs

If the browser cannot connect, check that the chosen port is open on the remote host, that the firewall/security group permits it, and that the URL uses the same host/port printed by the helper.

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

Preview is complete when the changed routes return HTTP 2xx/3xx through the internal smoke URL, the browser-facing remote URL renders the relevant pages visually, and the dev server is stopped unless the user asked to keep it running.
