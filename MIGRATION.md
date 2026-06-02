# Migration record

This repository was initialized as a monorepo for three previously separate documentation repositories.

## Imported sources

| App prefix | Source repo | Source ref imported | Notes |
| --- | --- | --- | --- |
| `apps/codex` | `/home/devswha/workspace/oh-my-codex-docs` | `4a70e78ca29f93bfbed9653c324f60352530f29c` | imported from committed `HEAD` |
| `apps/claudecode` | `/home/devswha/workspace/oh-my-claudecode-docs` | `b5955764b99e07d9f00008c462b2252b662edc65` | imported from committed `HEAD`; local uncommitted/generated files were intentionally excluded |
| `apps/openagent` | `/home/devswha/workspace/oh-my-openagent-docs` | `e2668564936c9744d26d700014169565a6663ef5` | imported from committed `HEAD` |
| `apps/gajae-code` | `https://github.com/devswha/gajae-code-docs` | `3b92c585d4c4752ab9f2a29ef2292313c45c36d5` | scaffolded from `apps/openagent` template; `git subtree split` pushed to `gajae-code-docs@main`; Vercel project git-connected (auto-deploy on push) |
| `apps/lzx` | `https://github.com/devswha/lzx-docs` | `ba57a343300be5671a9daf5793c1b5ee5700b6aa` | scaffolded from `apps/gajae-code` template; documents upstream `code-yeongyu/lazycodex` (LazyCodex / LZX); `git subtree split` pushed to `lzx-docs@main`; Vercel project git-connected (auto-deploy on push); domain `lzx.vibetip.help` |

The imports use `git subtree` without `--squash`, so source commit history remains available in this monorepo.

## Directory contract

```text
apps/
  codex/       # oh-my-codex-docs
  claudecode/  # oh-my-claudecode-docs
  openagent/   # oh-my-openagent-docs
  gajae-code/  # gajae-code-docs
  lzx/         # lzx-docs (LazyCodex)
```

Keep product-specific docs, routes, public assets, and deployment configuration inside the matching `apps/*` directory. Extract shared tooling only when all three apps can use it without changing behavior.

## Follow-up update commands

To pull later changes from a source repo into the matching subtree:

```bash
git subtree pull --prefix=apps/codex /home/devswha/workspace/oh-my-codex-docs <ref>
git subtree pull --prefix=apps/claudecode /home/devswha/workspace/oh-my-claudecode-docs <ref>
git subtree pull --prefix=apps/openagent /home/devswha/workspace/oh-my-openagent-docs <ref>
git subtree pull --prefix=apps/gajae-code /home/devswha/workspace/gajae-code-docs <ref>
git subtree pull --prefix=apps/lzx /home/devswha/workspace/lzx-docs <ref>
```

> Note: `apps/gajae-code` was scaffolded in this monorepo (not imported from a docs repo). Its `devswha/gajae-code-docs` deploy repo starts empty, so the first sync is a `git subtree split` + push (below) rather than a pull.

To split an app subtree back out for upstream synchronization:

```bash
git subtree split --prefix=apps/codex -b split/codex
git subtree split --prefix=apps/claudecode -b split/claudecode
git subtree split --prefix=apps/openagent -b split/openagent
git subtree split --prefix=apps/gajae-code -b split/gajae-code
git subtree split --prefix=apps/lzx -b split/lzx
```

## Validation checklist

- `git status --short --branch` is clean after migration commits.
- Each app has its original `package.json`, `package-lock.json`, `next.config.mjs`, `source.config.ts`, and `content/docs` tree under `apps/*`.
- Root scripts can address all apps independently: `npm run lint:*`, `npm run build:*`, `npm run dev:*`.
- App builds are validated after dependencies are installed in each app.
