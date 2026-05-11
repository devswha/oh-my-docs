# Contributing translations

Thank you for helping translate the oh-my-codex docs. This guide is enough to submit a PR without needing to understand the full Next.js app shell.

## Quick start (GitHub web UI only)

1. Find the English file you want to translate, e.g.
   [`content/docs/skills/utility/hud.mdx`](../content/docs/skills/utility/hud.mdx).
2. Click the pencil icon on GitHub to edit. GitHub will ask you to fork; accept.
3. **Rename** the file to add the locale suffix before `.mdx`:
   - `content/docs/skills/utility/hud.mdx` → `content/docs/skills/utility/hud.es.mdx`
   - (Use the "Rename" option when editing the file.)
4. Replace the content with your translation, following the glossary below.
5. Commit with a message like `docs(es): translate hud skill`.
6. Open a Pull Request.

That's it. A maintainer will review the PR. After merge, the live site picks up the change automatically.

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

These rules keep translations consistent across the site and aligned with Codex / OpenAI terminology.

### Tier A — ALWAYS keep English verbatim

- **Brand / product:** oh-my-codex, OMX, Codex CLI, OpenAI Codex CLI, OpenAI, Claude, Gemini, Fumadocs, MDX, Next.js
- **Workflow / utility names:** `$autopilot`, `$ralph`, `$ultrawork`, `$ralplan`, `$team`, `$deep-interview`, `$plan`, `$ultraqa`, `$visual-verdict`, `$web-clone`, `$wiki`, `omx setup`, `omx doctor`, `omx team`, and other literal command invocations
- **Agent identifiers:** explore, analyst, planner, architect, executor, debugger, verifier, explore-harness, code-reviewer, security-reviewer, quality-reviewer, style-reviewer, api-reviewer, performance-reviewer, test-engineer, designer, writer, qa-tester, researcher, git-master, build-fixer, code-simplifier, critic, team-orchestrator, team-executor, sisyphus-lite, and other exact role IDs
- **Model names / families:** GPT-5, gpt-5.4, gpt-5.4-mini, Codex, Gemini
- **All code fences and inline backtick code** — NEVER touch
- **File paths:** `.omx/`, `.codex/`, `content/docs/`, `src/`, `~/.codex/config.toml`
- **Env vars:** `OPENAI_API_KEY`, `OMX_OPENCLAW`, `OMX_STATE_DIR`, `HOOKS_TOKEN`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
- **Config keys:** `codex_hooks`, `approval_policy`, `custom-prompts`, `routing`, `features`, `permissions`, `roleRouting`
- **Tech acronyms:** CLI, API, MCP, JSON, TOML, HTTP, tmux, npm, git, LSP, AST, REST, CI, PR, CSS, DOM, YAML, CJK, IME

### Tier B — translate consistently

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

For a new locale, draft the Tier B table first and ask a maintainer to review before translating the rest of the content.

### Tier C — prose

- Translate body text naturally in your target language's docs tone (polite / formal style appropriate for technical documentation).
- Preserve MDX JSX components verbatim (`<Callout>`, `<Steps>`, `<Step>`, `<Cards>`, `<Card>`, `<Tabs>`, `<Tab>`, `<Mermaid>`, `<ReportForm>`). Only translate the child text inside these components.
- Keep `<Mermaid chart={...}>` literal content UNTOUCHED.
- Translate frontmatter `title` and `description` only. Do not touch other frontmatter fields.
- Translate table headers and prose cells; keep identifier cells (commands, env vars, model names, agent names, paths) in English.
- Preserve internal links (`/docs/...`) verbatim. Fumadocs adds the locale prefix automatically.
- Keep blank-line structure between MDX blocks.

## Special files: `meta.json` and friends

Some directories have `meta.json` (plus per-locale variants like `meta.ko.json`) that control sidebar title and page order.

For most directories, `meta.{locale}.json` is a near-clone of `meta.json` — you only translate the `title` field. The `pages` array must stay identical so the sidebar tree lines up.

**Three exceptions:** [`getting-started/`](../content/docs/getting-started/), [`concepts/`](../content/docs/concepts/), and [`guides/`](../content/docs/guides/). These are single-page sections where `pages` is a list of `[label](#anchor)` entries referencing in-page H2 headings. For these, **both** the label and the anchor must match your locale's H2 text, because `rehype-slug` generates the anchor from the translated heading. Ask a maintainer if you're not sure.

## Section headings

Translate every `## Section` and `### Subsection` to your target language. Do not skip them — they become sidebar sub-items on the three pages above and TOC items on every page.

Proper nouns inside headings stay English: `## Autopilot の設定` is correct for Japanese; `## オートパイロットの設定` is not.

## OMC tone reference

When you are translating or restructuring OMX docs to feel closer to the sibling OMC docs, read [`OMC-DOCS-TONE-REFERENCE.md`](./OMC-DOCS-TONE-REFERENCE.md) first.

That note captures the observed tone differences across English, Korean, Japanese, and Chinese OMC pages so you can copy the **reader experience** without copying OMC-only facts.

## Questions / stuck?

Open an issue in [this repo](https://github.com/devswha/oh-my-codex-docs/issues) or ping a maintainer. Content and website code live in the same repository, so there is no separate place to file build issues.
