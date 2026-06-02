# Vercel deployment management

This directory records the Vercel project mapping for the `oh-my-docs` monorepo.

## Project mapping

| App | Path | Vercel project |
| --- | --- | --- |
| Codex docs | `apps/codex` | `oh-my-codex-docs` |
| Claude Code docs | `apps/claudecode` | `oh-my-claudecode-docs` |
| OpenAgent docs | `apps/openagent` | `oh-my-openagent-docs` |
| Gajae-Code docs | `apps/gajae-code` | `gajae-code-docs` |
| LazyCodex docs | `apps/lzx` | `lzx-docs` |

`projects.json` stores Vercel project IDs and org IDs only. It does **not** store deployment tokens, environment variables, or secrets.


## Reference behavior

This setup follows Vercel's documented monorepo and CLI behavior:

- Monorepo Git projects should use a separate Vercel Project per app directory and set each Project's Root Directory to the matching app path.
- Vercel CLI supports `--cwd` for commands that should operate on an app directory from the monorepo root.
- Vercel CLI `deploy` can deploy a project from its project root or by passing a project path.
- Vercel CLI `link --repo` is available for linking multiple projects in one repository; the local scripts here use tracked metadata to regenerate per-app local link files deterministically.

## Local link files

Vercel CLI expects each project root to have `.vercel/project.json`. The repository keeps `.vercel/` ignored, so regenerate those local files from tracked metadata:

```bash
npm run vercel:sync-links
```

## Configure Vercel project root directories

The imported projects were originally standalone repos, so Vercel currently reports `Root Directory = .` for each project. After connecting these projects to this monorepo through Git integration, each project should point to its app directory:

- `oh-my-codex-docs` → `apps/codex`
- `oh-my-claudecode-docs` → `apps/claudecode`
- `oh-my-openagent-docs` → `apps/openagent`
- `gajae-code-docs` → `apps/gajae-code`
- `lzx-docs` → `apps/lzx`

Dry-run the intended API update:

```bash
npm run vercel:configure:dry
```

Apply it only with a Vercel token that has permission to update the projects:

```bash
VERCEL_TOKEN=... npm run vercel:configure:apply
```

## Deploy from this repo

Preview deployments:

```bash
npm run vercel:deploy:codex
npm run vercel:deploy:claudecode
npm run vercel:deploy:openagent
npm run vercel:deploy:gajae-code
npm run vercel:deploy:lzx
npm run vercel:deploy:all
```

Production deployments are intentionally explicit:

```bash
npm run vercel:deploy:codex:prod
npm run vercel:deploy:claudecode:prod
npm run vercel:deploy:openagent:prod
npm run vercel:deploy:gajae-code:prod
npm run vercel:deploy:lzx:prod
```

For CI, set `VERCEL_TOKEN` in the CI secret store. Do not commit tokens or pulled environment files.
