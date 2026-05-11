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
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --tailscale --from-git
```

Use a stable browser-facing URL when available:

```bash
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --tailscale --public-url http://home-server:3101 --from-git
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
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --tailscale --from-git --dry-run
```


## Tailscale / remote server mode

Use `--tailscale` for the user's normal workflow on a Tailscale-connected remote development server. Use plain `--remote` only for non-Tailscale remote access.

Behavior:

- Binds Next to `0.0.0.0` so a browser outside the server can connect.
- Uses `127.0.0.1` for internal smoke checks so validation does not depend on DNS, Tailscale, or firewall routing.
- Prints browser-facing URLs separately from internal smoke URLs.
- In Tailscale mode, prints MagicDNS and `100.x` Tailnet URLs first.
- If `--public-url` is omitted outside Tailscale mode, prints detected non-loopback IPv4 candidates plus `http://<remote-host>:<port>`.

Recommended forms:

```bash
# Tailscale/LAN hostname known
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --tailscale --public-url http://home-server:3101 --from-git

# URL from environment, useful for repeated sessions
DOCS_PREVIEW_CODEX_PUBLIC_URL=http://home-server:3101   node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --tailscale --from-git

# Agent proof only: start, check internally, stop
node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --tailscale --path /docs --exit-after-smoke
```


Tailscale detection uses `tailscale status --json` and `tailscale ip -4` when available. Example generated URLs on this host look like:

```text
http://home-server.tail1e211e.ts.net:3101/docs
http://home-server:3101/docs
http://100.123.228.51:3101/docs
```

Environment variable precedence for browser-facing URLs:

1. `DOCS_PREVIEW_<APP>_PUBLIC_URL`, e.g. `DOCS_PREVIEW_CODEX_PUBLIC_URL`
2. `DOCS_PREVIEW_PUBLIC_URL`
3. `PREVIEW_PUBLIC_URL`
4. Auto-detected candidate URLs

If the browser cannot connect over Tailscale, first try the `100.x` URL, then the full MagicDNS name. Check that Tailscale is connected on both devices, MagicDNS is enabled if using hostnames, and the chosen port is not blocked by the server firewall.

## Route derivation

`--from-git` maps changed MDX files under `apps/<app>/content/docs` to routes:

- `content/docs/index.mdx` → `/docs`
- `content/docs/getting-started/index.mdx` → `/docs/getting-started`
- `content/docs/reference/quick-commands.mdx` → `/docs/reference/quick-commands`
- `content/docs/getting-started/index.ko.mdx` → `/ko/docs/getting-started`
- `content/docs/index.ja.mdx` → `/ja/docs`
- `content/docs/index.zh.mdx` → `/zh/docs`


## Next.js dev origin allowlist

Next.js blocks dev resources such as HMR from unknown remote origins. For Tailnet browser access, the app's `next.config.mjs` must include the Tailscale hosts in `allowedDevOrigins`:

```js
allowedDevOrigins: [
  'home-server',
  'home-server.tail1e211e.ts.net',
  '100.123.228.51',
]
```

If the page shell loads but the console or server log shows `Blocked cross-origin request to Next.js dev resource`, add the exact hostname printed in the warning and restart the dev server.

## Manual visual checklist

For each changed page, inspect at least one desktop width and one narrow/mobile width if layout changed. Check:

- Sidebar entry appears and highlights correctly.
- Locale switch keeps the matching page when a locale sibling exists.
- Code blocks, command snippets, tables, Cards, Callouts, Tabs, Steps, and Mermaid blocks render.
- Internal links stay within the intended app and locale.
- The page has no hydration overlay, console error, or 404 after refresh.

## Stop condition

Preview is complete when the changed routes return HTTP 2xx/3xx through the internal smoke URL, the browser-facing remote URL renders the relevant pages visually, and the dev server is stopped unless the user asked to keep it running.
