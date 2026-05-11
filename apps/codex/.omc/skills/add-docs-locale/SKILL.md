---
name: add-docs-locale
description: Add a new third-party locale (es, vi, pt, etc.) to the Fumadocs site. Extends i18n config, translates all 105 MDX pages plus 17 meta files with a 3-tier glossary, produces full EN↔KO↔{locale} parity across 6 verifiable commits. Note: ja and zh are already shipped — the next invocation would typically be for es, vi, pt, etc.
> Ported from oh-my-claudecode-docs for the OMX docs site.
triggers:
  - "add locale"
  - "add language"
  - "translate docs to"
  - "localize to"
  - "/add-docs-locale"
type: workflow
scope: project
---

# add-docs-locale

Operational skill for adding a new locale to `content/docs/` + Fumadocs
infrastructure. Modeled on the EN→KO and EN→ZH implementations (commits
`5a54d4a`, `84ba2b0`, `4b34982`, `da981d9`, `6d3f19e`, `48bfe4d`,
`d83ca9d`, `ef88be7`). See the skill's **Prior Art** section below for
commit references.

## When to use

- The user wants `omx.vibetip.help` available in a new language
- Upstream `oh-my-codex/README.{locale}.md` exists (Yeachan-Heo
  maintains ja, zh, es, vi, pt alongside en/ko) and should become the
  landing-page baseline for the new locale
- An existing locale needs to be rebuilt from scratch after drift

## Constants

| Key | Value |
|---|---|
| `I18N_CONFIG` | `src/lib/i18n.ts` (`defineI18n` languages array) |
| `I18N_UI_CONFIG` | `src/app/[lang]/layout.tsx` (`defineI18nUI` translations) |
| `DOCS_NAV_NAMES` | `src/app/[lang]/docs/[[...slug]]/page.tsx` (`navNames`) |
| `MARKETING_TRANSLATIONS` | `src/app/[lang]/page.tsx` (`translations` record) |
| `DOCS_ROOT` | `content/docs/` |
| `UPSTREAM_README_ZH` | `.omc/upstream/oh-my-codex/README.{locale}.md` |
| `EXPECTED_PAGE_COUNT` | 105 (per locale) <!-- Count may drift as upstream adds pages — re-check with `find content/docs` before large locale work. --> |
| `EXPECTED_META_COUNT` | 17 |
| `IN_PAGE_TOC_META` | `getting-started/meta.json`, `concepts/meta.json`, `guides/meta.json` |

## Glossary framework (shared across locales)

### Tier A — NEVER translate (language-agnostic)

Fixed list that applies to any target locale:

- **Brand/product:** `oh-my-codex`, `OMX`, `Codex CLI`, `Claude`,
  `Codex`, `Gemini`, `Fumadocs`, `MDX`, `Next.js`
- **Slash commands:** every `/...` invocation, `/oh-my-codex:*`
  prefix, and named skill invocations (`/team`, `/autopilot`, `/ralph`,
  `/ultrawork`, `/ralplan`, `/ccg`, `/setup`, `/omx-setup`, `/ask`,
  `/deep-interview`, `/hud`, `/trace`, `/cancel`, `/plugin`, ...)
- **Skill proper nouns:** Autopilot, Ralph, Ultrawork, Team, Pipeline,
  Deep Interview, CCG, Sciomc, Deepinit, Ralplan, UltraQA
- **Agent identifiers:** explore, analyst, planner, architect, executor,
  debugger, verifier, tracer, code-reviewer, security-reviewer,
  test-engineer, designer, writer, qa-tester, scientist,
  document-specialist, git-master, code-simplifier, critic
- **Model tiers:** `haiku`, `sonnet`, `opus`, `HIGH`, `MEDIUM`, `LOW`
- **All code fences + inline backtick code** — NEVER touch
- **File paths:** `.omc/`, `~/.claude/`, `content/docs/`,
  `~/.config/claude-omx/config.jsonc`
- **Env vars:** `OMX_STATE_DIR`, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`,
  `OMX_PLUGIN_ROOT`, `ANTHROPIC_API_KEY`, `DISABLE_OMX`, `OMX_SKIP_HOOKS`
- **Config keys:** `roleRouting`, `tierModels`, `magicKeywords`,
  `routing`, `agents`, `features`, `permissions`
- **Tech acronyms:** CLI, API, MCP, JSON, JSONC, HTTP, tmux, npm, git,
  LSP, AST, REST, CI, PR, SSR, CSS, DOM, YAML, CJK, IME
- **Package names:** `oh-my-claude-sisyphus`, `fumadocs-ui`,
  `fumadocs-core`, `fumadocs-mdx`

### Tier B — translate consistently (locale-specific; confirm with user)

These terms must be translated per locale. Before starting, the skill
**proposes** a Tier B mapping from `README.{locale}.md` (where upstream
has already translated them) and **asks the user** to confirm each
ambiguous entry before applying it to all 105 pages.

Canonical English → locale mapping slots:

| English | Example (ko) | Example (zh) |
|---|---|---|
| agent (generic) | 에이전트 | 智能体 |
| skill (generic) | 스킬 | 技能 |
| hook (generic) | 훅 | 钩子 |
| orchestration | 오케스트레이션 | 编排 |
| workflow | 워크플로우 | 工作流 |
| task | 작업 | 任务 |
| mode | 모드 | 模式 |
| parallel | 병렬 | 并行 |
| sequential | 순차 | 顺序 |
| verification | 검증 | 验证 |
| pipeline | 파이프라인 | 流水线 |
| magic keyword | 매직 키워드 | 魔法关键词 |
| state management | 상태 관리 | 状态管理 |
| context | 컨텍스트 | 上下文 |
| provider | 프로바이더 | 提供方 |
| worker | 워커 | 工作进程 |
| session | 세션 | 会话 |
| plan / planning | 계획 / 계획 수립 | 计划 / 规划 |

Always-ambiguous items to confirm with user: **pipeline**,
**magic keyword**, **provider**, **worker**. Upstream README may leave
them English or translate — follow upstream where possible, then
confirm.

### Tier C — prose rules

- Translate body text naturally.
- Preserve MDX JSX verbatim (`<Callout>`, `<Steps>`, `<Step>`, `<Cards>`,
  `<Card>`, `<Tabs>`, `<Tab>`, `<Mermaid>`). Only translate child text.
- Translate frontmatter `title` and `description` **only**. Other keys
  untouched.
- Translate table headers and prose cells; keep identifier cells
  (commands, env vars, model names, agent names, paths) in English.
- Preserve `/docs/...` internal links verbatim. Fumadocs prefixes the
  active locale at runtime.
- Keep `<Mermaid chart={...}>` literal content untouched, including
  `\n` escapes.
- Preserve blank-line structure between MDX blocks.

## Workflow

### Step 1 — Pre-flight

```bash
# Working tree MUST be clean.
git status
# Expected: "nothing to commit, working tree clean"
```

```bash
# Upstream README for the target locale (if available).
ls .omc/upstream/oh-my-codex/README.{locale}.md
```

If the upstream README is absent, flag to the user that the landing
page must be translated from `README.md` without a baseline — quality
risk is higher.

Also confirm the upstream clone is fresh by running the bootstrap step
from `sync-omx-docs` if the clone is older than a few days.

### Step 2 — Confirm Tier B glossary with the user

**Priority order for Tier B sources:**

1. **Codex CLI official docs** (target locale) — authoritative for
   `agent`, `sub-agent`, `skill`, `hook`, `plugin`, `slash command`,
   `memory`, `context window`. URLs follow the pattern
   `https://codex.openai.com/docs/{locale}/...`. For terms Codex CLI
   uses, adopt their rendering even when it conflicts with upstream
   `README.{locale}.md`.
2. **Claude API docs** (`https://platform.claude.com/docs/{locale}/...`)
   when Codex CLI is silent.
3. **Upstream `README.{locale}.md`** for prose terms Codex CLI
   doesn't cover (e.g. `orchestration`, `workflow`, `pipeline`,
   `magic keyword`).
4. **Existing locale precedent** in `content/docs/**/*.{other-locale}.mdx`.

Why: OMX sits on top of Codex CLI. OMX users reading
`omx.vibetip.help/{locale}/docs` are Codex CLI users in that
language. Aligning jargon with Codex CLI's own docs avoids
whiplash when they context-switch between the two sites. See
the repo's localization policy note if one exists. If it does not, rely on
the source README plus current repo precedent and record the chosen terms in
the commit/report.

**Extract candidates:**

From Codex CLI docs (use WebSearch — `openai.com` returns 403 for
WebFetch; the CLAUDE.md rule bans WebFetch on external corp sites):

```
WebSearch: Codex CLI documentation {locale} terminology
  agent skill hook サブエージェント スキル フック
```

Replace the locale-specific tokens per target.

From upstream README:

```bash
for term in agent skill hook orchestration workflow pipeline "magic keyword"; do
  echo "=== $term ==="
  grep -i "$term" .omc/upstream/oh-my-codex/README.{locale}.md | head -3
done
```

Present the candidates to the user as a table showing both sources
side-by-side, highlighting the always-ambiguous items
(**pipeline**, **magic keyword**, **provider**, **worker**). Wait for
explicit confirmation before applying to downstream tasks.

### Step 3 — i18n infrastructure (5 edits in a single commit)

Touch these files, in order:

1. **`src/lib/i18n.ts`** — append `'{locale}'` to `languages`:
   ```ts
   languages: ['en', 'ko', 'zh', '{locale}'],
   ```

2. **`src/app/[lang]/layout.tsx`** — append to `defineI18nUI`
   `translations`:
   ```ts
   {locale}: {
     displayName: '<native-name>',   // e.g. '日本語' for ja, 'Español' for es
     search: '<translated>',
     searchNoResult: '<translated>',
     toc: '<translated>',
     previousPage: '<translated>',
     nextPage: '<translated>',
   },
   ```
   `displayName` is the label shown in the language switcher. Use the
   native endonym (日本語, not "Japanese").

3. **`src/app/[lang]/docs/[[...slug]]/page.tsx`** — append to `navNames`:
   ```ts
   {locale}: {
     docs: '<translated "Docs">',
     gettingStarted: '<translated "Getting Started">',
     concepts: '<translated "Core Concepts">',
     guides: '<translated "Guides">',
     agents: '<translated "Agents">',
   },
   ```

4. **`src/app/[lang]/page.tsx`** — append a `{locale}` entry to the
   `translations` record, mirroring the shape of the existing `en` and
   `ko` entries. Use `README.{locale}.md` wording for the hero and CTA
   copy; translate the rest following the glossary.

5. **Write `content/docs/index.{locale}.mdx`** — docs landing page,
   modeled on `content/docs/index.mdx`. Use `README.{locale}.md` as the
   prose baseline where the two overlap (Quick Start, Team Mode, tmux
   workers, Why OMX, Updating).

### Step 4 — Commit 1 and push

```bash
npm run build 2>&1 | tail -15     # confirm exit 0 and increased page count
git add src/lib/i18n.ts 'src/app/[lang]/docs/[[...slug]]/page.tsx' 'src/app/[lang]/page.tsx' 'src/app/[lang]/layout.tsx' content/docs/index.{locale}.mdx
git commit -m "feat(i18n): add {locale-display-name} ({locale}) locale — infra + landing"
git push origin main
```

### Step 5 — Commits 2 through 6 via parallel `writer` subagents

Keep each commit small, verifiable, and independently revertable. Use
parallel `Agent(subagent_type="writer")` dispatches per batch. The
subagent prompt **must** contain the full Tier A/B/C glossary inline
(do not reference this file — subagents do not load it).

**Commit 2 — Entry pages (3 files):**
- `content/docs/getting-started/index.mdx` → `.{locale}.mdx`
- `content/docs/concepts/index.mdx` → `.{locale}.mdx`
- `content/docs/guides/index.mdx` → `.{locale}.mdx`

One subagent, all three files. These have the highest user-facing
impact — inspect the output before committing.

**Commit 3 — Agents (20 files) via 3 parallel subagents:**
- Subagent A: `agents/index.mdx` + `agents/build-analysis/*.mdx` (9
  files)
- Subagent B: `agents/review/*.mdx` + `agents/coordination/critic.mdx`
  (3 files)
- Subagent C: `agents/domain/*.mdx` (8 files)

**Commit 4 — Skills utility + skills/index (23 files) via 2 parallel
subagents:**
- Subagent A: `skills/index.mdx` + `skills/utility/a-m*` (12 files)
- Subagent B: `skills/utility/n-z*` (11 files)

**Commit 5 — Skills workflow (15 files) via 2 parallel subagents:**
- Subagent A: `skills/workflow/{autopilot, ccg, deep-dive, deepinit,
  deep-interview, external-context, omx-teams, plan}.mdx` (8 files)
- Subagent B: `skills/workflow/{ralph, ralplan, sciomc, self-improve,
  team, ultraqa, ultrawork}.mdx` (7 files)

**Commit 6 — Hooks + reference + tools + all meta.{locale}.json via 3
parallel subagents + one Node script:**
- Subagent A: `hooks/*.mdx` (5 files)
- Subagent B: `reference/*.mdx` (7 files)
- Subagent C: `tools/*.mdx` (7 files)
- Node script for the 15 `meta.{locale}.json` files (see Step 6).

### Subagent prompt template

```text
Translate N English docs pages to {locale} and write them as `.{locale}.mdx`.

Working directory: /home/devswha/workspace/oh-my-codex-docs

Input → Output pairs:
1. `content/docs/…/foo.mdx` → `content/docs/…/foo.{locale}.mdx`
2. …

Reference: `content/docs/index.{locale}.mdx` (already translated — read
first for glossary examples).

Tier A — ALWAYS keep English verbatim:
<paste the full Tier A list here>

Tier B — translate consistently per the confirmed glossary:
<paste the confirmed Tier B table here>

Tier C — prose:
<paste the Tier C rules here>

Do NOT run git commands. Only write the files.

Report in under 100 words:
- Line count per file (EN vs {locale}, must match within ±5%).
- Any phrasing you were unsure about (flag with file path + line).
```

### Step 6 — Create `meta.{locale}.json` for 15 directories

Two sub-steps.

**6a. Standard meta files (12 directories)** — titles translate to
locale, pages array stays identical:

Run this Node snippet (adjust the `titles` map per locale):

```bash
node -e '
const fs = require("fs");
const titles = {
  "content/docs/meta.{locale}.json": "<translated OMX Docs>",
  "content/docs/agents/meta.{locale}.json": "<translated Agents>",
  "content/docs/agents/build-analysis/meta.{locale}.json": "<translated Build & Analysis>",
  "content/docs/agents/coordination/meta.{locale}.json": "<translated Coordination>",
  "content/docs/agents/domain/meta.{locale}.json": "<translated Domain>",
  "content/docs/agents/review/meta.{locale}.json": "<translated Review>",
  "content/docs/hooks/meta.{locale}.json": "<translated Hooks>",
  "content/docs/reference/meta.{locale}.json": "<translated Reference>",
  "content/docs/skills/meta.{locale}.json": "<translated Skills>",
  "content/docs/skills/utility/meta.{locale}.json": "<translated Utility Skills>",
  "content/docs/skills/workflow/meta.{locale}.json": "<translated Workflow Skills>",
  "content/docs/tools/meta.{locale}.json": "<translated Tools>",
};
for (const [f, t] of Object.entries(titles)) {
  // Copy from meta.ko.json (preserves pages array) then override title
  const src = f.replace(".{locale}.json", ".ko.json");
  const j = JSON.parse(fs.readFileSync(src, "utf8"));
  j.title = t;
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  console.log(`${f} → ${t}`);
}
'
```

**6b. In-page TOC meta files (3 directories) — the special case**

`getting-started/`, `concepts/`, and `guides/` have single-page sections
whose meta uses Fumadocs' `[label](#anchor)` syntax to surface H2
headings as sidebar sub-items. The anchors **MUST** match the actual H2
IDs produced by `rehype-slug` on the translated `.{locale}.mdx` file,
not the original EN or the `.ko.mdx`.

**Copying `meta.ko.json` verbatim is a bug.** The sidebar will show KO
labels and broken anchors on the new locale. This was discovered
during the ZH implementation (commit `ef88be7`). Fix:

```bash
# Extract H2s from each translated file:
for f in content/docs/{getting-started,concepts,guides}/index.{locale}.mdx; do
  echo "=== $f ==="
  grep -nE '^## ' "$f"
done
```

Then hand-write `meta.{locale}.json` for the three directories, mapping
each EN sidebar label to the locale-translated label and the
rehype-slug-generated anchor of the matching H2 in the translated file.

**Rehype-slug behavior to know:**
- Lowercases ASCII letters
- Replaces spaces with hyphens
- Strips punctuation (including full-width `？`, `。`, `，`)
- Preserves CJK characters as-is
- So `## 什么是智能体？` becomes `id="什么是智能体"`.

**Verification** — confirm every anchor resolves by running:

```bash
LANG=C.UTF-8 npx next start -p 3007 &
sleep 6
curl -sL http://localhost:3007/{locale}/docs/getting-started \
  | python3 -c "import sys,re; html=sys.stdin.read(); print('\n'.join(re.findall(r'<h[23][^>]*id=\"([^\"]+)\"', html)))"
kill %1
```

Every href target from `getting-started/meta.{locale}.json` `pages[]`
must appear in the list of rendered H2 IDs.

### Step 7 — Verify final parity

```bash
echo "Locale parity:"
echo "EN: $(find content/docs -name '*.mdx' -not -name '*.ko.mdx' -not -name '*.zh.mdx' -not -name '*.{locale}.mdx' | wc -l)"
echo "KO: $(find content/docs -name '*.ko.mdx' | wc -l)"
echo "ZH: $(find content/docs -name '*.zh.mdx' | wc -l)"
echo "{LOCALE}: $(find content/docs -name '*.{locale}.mdx' | wc -l)"
```

All four counts must equal `EXPECTED_PAGE_COUNT` (105).

```bash
echo "meta.{locale}.json: $(find content/docs -name 'meta.{locale}.json' | wc -l)"   # expect 17
```

Final build and parity of pages[]:

```bash
npm run build 2>&1 | tail -5
for dir in $(find content/docs -name "meta.json" -printf '%h\n'); do
  en="$dir/meta.json"; new="$dir/meta.{locale}.json"
  [ -f "$new" ] && diff <(node -e "console.log(JSON.parse(require('fs').readFileSync('$en')).pages.join('\n'))") \
                       <(node -e "console.log(JSON.parse(require('fs').readFileSync('$new')).pages.join('\n'))")
done
```

Empty diff for every standard meta dir (the 3 in-page TOC metas will
differ — that is correct; they point to locale-specific anchors).

### Step 8 — Commit 6 and push

```bash
git add content/docs/hooks content/docs/reference content/docs/tools content/docs/*.{locale}.json content/docs/**/*.{locale}.json
git commit -m "docs(i18n): translate {locale} for hooks + reference + tools + meta"
git push origin main
```

## Hard rules

1. **Never commit empty or partial batches.** Each of the 6 commits
   must be independently buildable (lint + build both pass).
2. **Never let a subagent run git commands.** Enforce "Do NOT run git
   commands. Only write the files." in every subagent prompt.
3. **Never copy `meta.ko.json` verbatim into
   `getting-started/meta.{locale}.json`,
   `concepts/meta.{locale}.json`, or `guides/meta.{locale}.json`.** The
   `[label](#anchor)` entries must be regenerated against the actual
   H2 IDs of the new locale's `.mdx` file (see Step 6b).
4. **Never translate code fences, inline code, or file paths.** They
   are Tier A by rule.
5. **Never translate slash commands or agent/skill identifiers.**
   `/team`, `code-reviewer`, `autopilot` stay English.
6. **Never run this skill on a dirty working tree** — `git status` must
   be clean before Step 3.
7. **Never push without running `npm run build`** — build exit 0 is a
   gate, not optional.
8. **Never skip Step 6b's verification.** The sidebar anchor bug is
   silent at build time.
9. **Never finalize Tier B terminology without consulting Codex CLI
   official docs for the target locale.** When Codex CLI and upstream
   `README.{locale}.md` disagree on a core term (agent/skill/hook/
   plugin/command/memory/context), Codex CLI wins. See
   the repo's localization policy note when one exists; otherwise record the
   chosen glossary in the task output.

## Idempotency contract

Running this skill for a locale that already exists with full parity
MUST produce:
- Zero file modifications
- Zero git changes
- A `Locale {locale} already has 105/105 parity` report

If the second run wants to write anything, it means previous output
drifted — inspect which files differ and decide whether to refresh
translations or back out.

## Known gotchas

### Rehype-slug CJK anchor IDs (from 2026-04-17 zh run)

Fumadocs uses `rehype-slug` + `remark-rehype`. Behavior:

- `## Overview` → `id="overview"`
- `## 快速开始` → `id="快速开始"` (CJK preserved, no transliteration)
- `## 什么是 Autopilot？` → `id="什么是-autopilot"` (space→hyphen,
  lowercase ASCII, full-width `？` stripped)
- `## OMX 调试工具` → `id="omx-调试工具"` (mixed: ASCII lowercased,
  CJK preserved)

This matters for Step 6b — the anchors you hand-write must exactly
match rehype-slug's output.

### `defineI18nUI` vs `defineI18n` (from 2026-04-17 d83ca9d)

The language switcher label is controlled by
`src/app/[lang]/layout.tsx`'s `defineI18nUI({ translations: { X: {
displayName } } })` — NOT by `src/lib/i18n.ts`. If you only add the
locale to `defineI18n` languages, the switcher shows the bare locale
code (`zh`, `ja`) instead of the native endonym.

### EN/KO meta titles are English by project convention (from 2026-04-17 48bfe4d)

The KO project convention was to keep meta.ko.json titles in English
("Agents", "Hooks") and rely on page frontmatter titles for the
actual localized sidebar labels. **ZH broke from this** and localized
them (智能体, 钩子) — which the user preferred. For future locales,
ask the user whether to follow the ZH pattern (translate titles) or
the KO pattern (keep English).

### `meta.ko.json` pages arrays for getting-started/concepts/guides use KR anchors (from 2026-04-17 ef88be7)

A single-page section where meta has `pages: ["[LABEL](#anchor)",
...]` uses the LOCALE's anchor IDs. Copying meta.ko.json into
meta.{locale}.json yields Korean anchor IDs that don't exist in the
translated page. Always regenerate these three files from the
translated `.mdx`'s actual H2s.

### `(closes #NNNN)` GitHub notation leaks into prose (from 2026-04-17 d4fb309)

When porting changelog-style content into user-facing prose, strip
`(closes #NNNN)` PR references. They are changelog metadata, not
reader content.

### Subagent line count variance

Subagents reliably produce ±0–1% line count compared to EN source
(verified against ko and zh runs). If a subagent's output is more than
5% off, inspect manually — most common causes are collapsed code
blocks (tag stripped) or dropped sections.

## Prior art

| Locale | Pages | Commits (oldest→newest) | Notes |
|---|---|---|---|
| en | 105 | — | Source of truth |
| ko | 105 | `9403248` (initial), various syncs | Meta titles left in English |
| zh | 105 | `5a54d4a` → `84ba2b0` → `4b34982` → `da981d9` → `6d3f19e` → `48bfe4d` → `d83ca9d` → `ef88be7` | Full run used as template for this skill |
| ja | 105 | (shipped) | Already available — do not re-add |

## Cross-references

- `.omc/skills/sync-omx-docs/SKILL.md` — keeps EN content aligned with
  upstream; run after this skill completes if upstream has drifted
- `.omc/upstream/oh-my-codex/README.{locale}.md` — primary
  translation baseline for the docs landing
- Historical zh-run plan docs under `.omc/plans/` — optional reference only
  if those files exist in the repo
