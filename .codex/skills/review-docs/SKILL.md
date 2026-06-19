---
name: review-docs
description: Review any docs app in this monorepo (apps/codex, apps/claudecode, apps/openagent, apps/gajae-code, apps/lzx) for FACTUAL accuracy against its upstream product, then humanize prose with Patina, verify, and deploy. Use when the user asks to "review docs", "audit docs", "check docs against upstream", remove content that does not match the product, de-AI / de-slop / humanize the docs, or fact-check a docs app. Verifies commands/skills/CLI/config actually exist upstream and removes leaked or invented content (e.g. another product's features). Patina humanization is English-only; CJK/Korean punctuation is left idiomatic.
---

# Review Docs

Fact-check and polish a documentation app in this npm-workspaces monorepo against the real upstream product, then verify and ship. This generalizes the per-app `sync-*-docs` / `update-lzx-docs` skills into a repeatable review loop that works for every app.

## Apps and their upstream source of truth

Read `references/apps.md` for the full mapping. Summary:

| App | Documents | Upstream repo | Branch | Live domain |
| --- | --- | --- | --- | --- |
| `apps/codex` | Oh My Codex | `Yeachan-Heo/oh-my-codex` | `main` | omx.vibetip.help |
| `apps/claudecode` | Oh My Claude Code | `Yeachan-Heo/oh-my-claudecode` | `main` | (per projects.json) |
| `apps/openagent` | Oh My OpenAgent (OmO) | `code-yeongyu/oh-my-openagent` | `dev` | (per projects.json) |
| `apps/gajae-code` | Gajae-Code (`gjc`) | `Yeachan-Heo/gajae-code` | `main` | (per projects.json) |
| `apps/lzx` | LazyCodex (`lzx`, OmO for Codex) | `code-yeongyu/lazycodex` | `main` | lzx.vibetip.help |

The upstream is the ONLY source of truth for what a feature is, what it is named, and whether it exists. Never carry a feature from one product's docs into another's.

## Workflow

### 0. Preflight

- Confirm the target app with the user if ambiguous. One app per pass.
- `git status --short --branch`. Other apps almost always have unrelated user changes — never touch or revert them; a per-app deploy only uploads that app's directory.
- Decide scope. If the user excludes pages (e.g. "except installation and getting-started"), honor it.

### 1. Factual verification against upstream (the core)

Get the upstream source of truth, then check every concrete claim in the docs against it.

- Prefer the local cache under `.omx/cache/upstream/<repo>` when present; otherwise use the GitHub contents/raw API:
  - List: `curl -s "https://api.github.com/repos/<owner>/<repo>/contents/<path>?ref=<branch>"`
  - Read: `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`
  - **Caches can be stale** — when the cache and live `ref` disagree, the live branch wins (e.g. lzx's `.omx` cache still had an `ultragoal` component that was removed from live `main`).
- Verify, against upstream, that each documented item actually exists and is named correctly:
  - **Commands / CLI** (flags, subcommands, install line).
  - **Skills** (the upstream skills dir, e.g. `plugins/omo/skills/*` for OmO/LazyCodex).
  - **Components / hooks** (e.g. `plugins/omo/components/*`, `hooks.json`).
  - **Config / env / models** referenced in `reference/*`.
  - **Version** (`src/lib/version.ts` is auto-injected from upstream `package.json`).
- **Cross-product leakage is the most common defect.** Grep for terms that belong to a *different* product and should not appear in this app's docs. Example check for non-gjc apps:
  `search "ultragoal|deep-interview|ralplan|gajae|\bgjc\b"` — confirm any hit is genuinely an upstream feature of THIS product; if not, it is leaked content.
- **Delete content that does not match facts.** Remove the page(s) and every reference: the MDX files (all locales), the folder `meta*.json` page-list entry (fix the trailing comma), sidebar cards/tables, and inbound links. Re-check links so nothing dangles.
- When in doubt whether something is real, do not guess — confirm in upstream or ask.

### 2. Humanize prose with Patina (English only)

Patina (`patina`, an AI-text humanizer) is a prose guardrail, not a paraphraser. Use it to find AI tells and improve readability.

- Score / audit before editing: `patina --score --lang en --backend codex-cli --quiet <file>` (add `--audit` for pattern detail; `--batch <files...>` for several). `--backend codex-cli` works without an API key when the Codex CLI is logged in.
- The recurring tell in these docs is **em-dash overuse** (`—`). Fix by reading each sentence and choosing natural punctuation (heading `X — Y` → `X: Y`; inline appositive → `:` / `,`; parenthetical `A — B — C` → `A (B) C`). Do not blindly swap tokens.
- **CRITICAL — English only.** Patina flags em-dash overuse only in English. In Korean, Chinese, and Japanese the em dash / `——` is idiomatic and Patina does NOT flag it (verified: zh 2.0, ja 0.0, ko 1.4, no em-dash signal). **Never strip `—`/`——` from `.ko`/`.zh`/`.ja` files** — that is a context-blind change (see Patina issue devswha/patina#352).
- Also remove genuine AI slop: empty hype ("powerful", "seamless"), repeated marketing memes, near-duplicate sentences. Preserve semantic anchors verbatim: package names, commands, flags, version requirements, URLs.
- **YAML trap:** if an edit puts a colon-space (`: `) inside a frontmatter `description:` value, wrap the whole value in double quotes or the MDX build fails (`fumaMatter`). For zh/ja, fullwidth `：` is safe unquoted.
- For large passes, fan out to `executor` subagents by section (≤5 files each), with explicit "English files only, preserve code/commands/MDX/frontmatter" instructions; verify centrally afterward.

### 3. Locale parity

- Every page ships `page.mdx` + `.ko.mdx` + `.zh.mdx` + `.ja.mdx`. Keep them in sync.
- Non-English links MUST be locale-prefixed (`/ko/docs/...`). The `default-locale` is unprefixed (`/docs/...`).
- Update `meta.json` + `meta.ko/zh/ja.json` page-lists for any added/removed/renamed page. Do NOT list `"index"` in folder metas.

### 4. Verify

```bash
npm run check:localized-links --prefix apps/<app>   # locale-prefix audit (also runs in prebuild)
npm run lint:<app>
npm run build:<app>                                  # compiles MDX; catches frontmatter/JSX/link errors
```

A successful `next build` is the gate. The page count changing is expected when pages are added/removed.

### 5. Visual QA

- Run the dev server: `node apps/<app>/scripts/inject-*-version.mjs >/dev/null 2>&1; (cd apps/<app> && npx next dev -p <freeport> -H 0.0.0.0)`. `next build` and `next dev` share `.next`; stop one before the other, or clear `.next` if dev 500s after a build.
- Use the `browser` tool (or `read` on the rendered URL) to confirm tabs/callouts/tables/icons render and that removed content is actually gone (404 for deleted routes). Grep on rendered HTML over-counts: embedded search/RSC payloads include sibling pages' text, so check the `<article>` body, not raw HTML.
- inotify note: on this host the VS Code server can exhaust `fs.inotify.max_user_watches`, which makes `next dev` 500 with "OS file watch limit reached". Fix via `.vscode/settings.json` `files.watcherExclude` for `**/node_modules`, `**/.next`, `**/.source` (no sudo), or raise the sysctl.

### 6. Deploy

```bash
npm run vercel:deploy:<app>          # preview (Vercel previews are auth-gated; open via your Vercel session)
npm run vercel:deploy:<app>:prod     # production (the live domain)
```

`deploy/vercel/projects.json` is the manifest. The deploy uploads only `apps/<app>` and builds remotely; local git state need not be committed. Treat deploy as an explicit, separate step — confirm prod before promoting.

## Hard rules

- Upstream is the source of truth. Do not invent, carry over, or "improve" features that the product does not have.
- Delete non-factual content fully (files + meta + links), never leave dangling references.
- Patina/em-dash cleanup is **English-only**; leave CJK/Korean punctuation alone.
- Preserve commands, flags, package names, and URLs verbatim.
- Quote frontmatter descriptions that contain `: `.
- Keep all four locales and their `meta*.json` consistent.
- Subagents never run gates/format/deploy; the parent verifies once across the union of changes.

## Report

Report: app + upstream ref used; factual mismatches found and how resolved (deleted/edited); Patina findings and before/after scores; locale parity; lint/link/build outcomes; visual-QA notes; and the deploy target + URL.
