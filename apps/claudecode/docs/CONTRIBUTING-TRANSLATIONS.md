# Contributing translations

Thank you for helping translate the oh-my-claudecode docs. This guide
is enough to submit a PR without installing Node.js or running a build.

## Quick start (GitHub web UI only)

1. Find the English file you want to translate, e.g.
   [`content/docs/skills/utility/hud.mdx`](../content/docs/skills/utility/hud.mdx).
2. Click the pencil icon on GitHub to edit. GitHub will ask you to
   fork; accept.
3. **Rename** the file to add the locale suffix before `.mdx`:
   - `content/docs/skills/utility/hud.mdx` → `content/docs/skills/utility/hud.es.mdx`
   - (Use the "Rename" option when editing the file.)
4. Replace the content with your translation, following the glossary
   below.
5. Commit with a message like `docs(es): translate hud skill`.
6. Open a Pull Request.

That's it. A maintainer will review the PR. After merge, the live site
picks up the change automatically.

## File naming convention

| Locale | Code | Example |
|---|---|---|
| English | (none) | `foo.mdx` |
| Korean | `ko` | `foo.ko.mdx` |
| Chinese (Simplified) | `zh` | `foo.zh.mdx` |
| Japanese | `ja` | `foo.ja.mdx` |
| Spanish | `es` | `foo.es.mdx` |
| Vietnamese | `vi` | `foo.vi.mdx` |
| Portuguese | `pt` | `foo.pt.mdx` |

Other ISO 639-1 codes follow the same pattern.

## The 3-tier glossary

These rules keep translations consistent across the site and aligned
with Claude Code's own docs.

### Tier A — ALWAYS keep English verbatim

- **Brand / product:** oh-my-claudecode, OMC, Claude Code, Claude,
  Codex, Gemini, Fumadocs, MDX, Next.js
- **Slash commands:** `/team`, `/autopilot`, `/ralph`, `/ultrawork`,
  `/ralplan`, `/ccg`, `/setup`, `/omc-setup`, `/omc-doctor`, `/ask`,
  `/deep-interview`, `/hud`, `/trace`, `/cancel`, `/plugin`, and any
  other `/...` or `/oh-my-claudecode:*` invocation
- **Skill / mode proper nouns:** Autopilot, Ralph, Ultrawork, Team,
  Pipeline, Deep Interview, CCG, Sciomc, Deepinit, Ralplan, UltraQA
- **Agent identifiers:** explore, analyst, planner, architect, executor,
  debugger, verifier, tracer, code-reviewer, security-reviewer,
  test-engineer, designer, writer, qa-tester, scientist,
  document-specialist, git-master, code-simplifier, critic
- **Model tiers:** haiku, sonnet, opus, HIGH, MEDIUM, LOW
- **All code fences and inline backtick code** — NEVER touch
- **File paths:** `.omc/`, `~/.claude/`, `content/docs/`,
  `~/.config/claude-omc/config.jsonc`
- **Env vars:** `OMC_STATE_DIR`, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`,
  `OMC_PLUGIN_ROOT`, `ANTHROPIC_API_KEY`, `DISABLE_OMC`, `OMC_SKIP_HOOKS`
- **Config keys:** `roleRouting`, `tierModels`, `magicKeywords`,
  `routing`, `agents`, `features`, `permissions`
- **Tech acronyms:** CLI, API, MCP, JSON, JSONC, HTTP, tmux, npm, git,
  LSP, AST, REST, CI, PR, CSS, DOM, YAML, CJK, IME
- **Package names:** `oh-my-claude-sisyphus`, `fumadocs-ui`,
  `fumadocs-core`, `fumadocs-mdx`

### Tier B — translate consistently

Cross-reference Claude Code's official docs in your target language
first. When Claude Code disagrees with the wording in the upstream
`oh-my-claudecode/README.{locale}.md`, follow Claude Code.

| English | 한국어 | 中文 | 日本語 |
|---|---|---|---|
| agent (generic) | 에이전트 | 智能体 | エージェント |
| sub-agent | 서브에이전트 | 子智能体 | サブエージェント |
| skill (generic) | 스킬 | 技能 | スキル |
| hook (generic) | 훅 | 钩子 | フック |
| orchestration | 오케스트레이션 | 编排 | オーケストレーション |
| workflow | 워크플로우 | 工作流 | ワークフロー |
| task | 작업 | 任务 | タスク |
| mode | 모드 | 模式 | モード |
| parallel | 병렬 | 并行 | 並列 |
| verification | 검증 | 验证 | 検証 |
| pipeline | 파이프라인 | 流水线 | パイプライン |
| magic keyword | 매직 키워드 | 魔法关键词 | マジックキーワード |
| state management | 상태 관리 | 状态管理 | 状態管理 |
| context | 컨텍스트 | 上下文 | コンテキスト |
| provider | 프로바이더 | 提供方 | プロバイダー |
| worker | 워커 | 工作进程 | ワーカー |
| session | 세션 | 会话 | セッション |
| plan / planning | 계획 | 计划 / 规划 | 計画 |

For a new locale, first draft the Tier B table, then ask a maintainer
to review before you start translating the rest of the content.

### Tier C — prose

- Translate body text naturally in your target language's docs tone
  (polite / formal style appropriate for technical documentation).
- Preserve MDX JSX components verbatim (`<Callout>`, `<Steps>`,
  `<Step>`, `<Cards>`, `<Card>`, `<Tabs>`, `<Tab>`, `<Mermaid>`). Only
  translate the child text inside these components.
- Keep `<Mermaid chart={...}>` literal content UNTOUCHED.
- Translate frontmatter `title` and `description` only. Don't touch
  other frontmatter fields.
- Translate table headers and prose cells; keep identifier cells
  (commands, env vars, model names, agent names, paths) in English.
- Preserve internal links (`/docs/...`) verbatim. Fumadocs adds the
  locale prefix automatically.
- Keep blank-line structure between MDX blocks.

## Special files: `meta.json` and friends

Some directories have `meta.json` (plus per-locale variants like
`meta.ko.json`) that control sidebar title and page order.

For most directories, the `meta.{locale}.json` is a near-clone of
`meta.json` — you only translate the `title` field. The `pages` array
must stay identical so the sidebar tree lines up.

**Three exceptions**:
[`getting-started/`](../content/docs/getting-started/),
[`concepts/`](../content/docs/concepts/), and [`guides/`](../content/docs/guides/). These are
single-page sections where `pages` is a list of
`[label](#anchor)` entries referencing in-page H2 headings. For these,
**both** the label AND the anchor must match your locale's H2 text,
because `rehype-slug` generates the anchor from the translated
heading. Ask a maintainer if you're not sure.

## Section headings

Translate every `## Section` and `### Subsection` to your target
language. Don't skip them — they become sidebar sub-items on the three
pages above and TOC items on every page.

Proper nouns inside headings stay English: `## Autopilot の設定` is
correct for Japanese; `## オートパイロットの設定` is not.

## Questions / stuck?

Open an issue in
[this repo](https://github.com/devswha/oh-my-claudecode-docs/issues)
or ping a maintainer. Content and website code now live in the same
monorepo, so there is no longer a separate place to file build issues.
