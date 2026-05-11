# Repo Rename Status — `oh-my-codex-docs`

- Date: 2026-04-20
- Scope: external rename execution status for GitHub + Vercel

## Completed

### GitHub repository

- Renamed from `devswha/oh-my-codex-website` to `devswha/oh-my-codex-docs` via `gh repo rename`
- Updated local `origin` remote to `https://github.com/devswha/oh-my-codex-docs.git`
- Verified the new remote with `git ls-remote --heads origin`

### Vercel project

- Renamed project `prj_42NS1zANexT6oZCa7U9tdhbvhCVL` from `oh-my-codex-website` to `oh-my-codex-docs`
- Verified the new project name with `vercel project inspect oh-my-codex-docs`
- Local `.vercel/project.json` already matches `projectName: "oh-my-codex-docs"`

## Current follow-up note

- `vercel link --repo --yes` did not refresh the renamed Git repository mapping immediately from the CLI path alone.
- A real push-triggered deployment then reconciled the integration: commit `42b40e577bd02a9d11e001d21ab4d138dd9cd4e7` produced Vercel deployment `dpl_6pjsHK1bvaaWRvuXARRXwZCkaSxn` in READY state, and Vercel now reports `githubRepo: oh-my-codex-docs`.
- Vercel environment variables were updated so `GITHUB_REPORT_REPO_NAME=oh-my-codex-docs` across production/preview/development.
- The previously under-scoped deployed `GITHUB_REPORT_TOKEN` was replaced across production/preview/development, and a production-env local smoke test confirmed `/api/report` created GitHub issue #2 successfully before that verification issue was closed.

## Remaining next checks

1. Optionally inspect Vercel Project Settings -> Git and confirm the dashboard shows the renamed repository slug.
