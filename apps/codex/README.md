# oh-my-codex-docs

Official documentation site for [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex), a multi-agent orchestration layer for OpenAI Codex CLI.

- **Live site:** https://omx.vibetip.help
- **Framework:** Next.js 16 + Fumadocs 16
- **Languages:** English (default), 한국어, 中文, 日本語

This repository contains both the MDX content and the Next.js/Fumadocs site shell for oh-my-codex docs.

## Development

```bash
npm install
cp .env.example .env.local   # optional: support/report form + rate-limit envs
npm run dev
```

The `prebuild` script fetches the current `oh-my-codex` version from upstream and writes it to `src/lib/version.ts`.

## Repository structure

```text
<repo-root>/
├── content/docs/              # MDX docs content (all locales)
│   ├── index.mdx             # /docs landing page
│   ├── getting-started/      # install + first session
│   ├── concepts/             # agents, skills, hooks, state
│   ├── guides/               # task-oriented walkthroughs
│   ├── agents/               # 33 prompt reference pages + lane indexes
│   ├── skills/               # workflow + utility skill catalogs
│   ├── hooks/                # Codex-native hook documentation
│   ├── tools/                # MCP/state/wiki/tooling references
│   ├── integrations/         # OpenClaw, MCP, CLI bridge docs
│   ├── reference/            # configuration + command reference
│   └── support/              # FAQ + report form
├── src/                      # Next.js app shell and components
├── public/                   # static assets
├── scripts/                  # content/build helpers
└── docs/                     # repo-maintainer docs (not published)
```

## Content conventions

All MDX lives under `content/docs/`. Each page ships in four languages using parallel filename suffixes, and each directory keeps a locale-specific `meta` file for sidebar ordering.

| Locale | Filename | Notes |
|---|---|---|
| English | `foo.mdx` | Source of truth |
| 한국어 | `foo.ko.mdx` | Korean translation |
| 中文 | `foo.zh.mdx` | Simplified Chinese translation |
| 日本語 | `foo.ja.mdx` | Japanese translation |

Each directory also includes `meta.json` plus matching `meta.{ko,zh,ja}.json` siblings.

## Translations

See [`docs/CONTRIBUTING-TRANSLATIONS.md`](./docs/CONTRIBUTING-TRANSLATIONS.md) for the file-naming convention, glossary, and PR flow.

## Build

```bash
npm run build
```
