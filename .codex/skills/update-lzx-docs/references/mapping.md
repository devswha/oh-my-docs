# LazyCodex docs update mapping

Use this reference after running `scripts/inspect-upstream.mjs` when deciding which docs to edit.

## Repository roots

- Monorepo docs app: `apps/lzx`
- Docs content root: `apps/lzx/content/docs`
- Upstream source of truth: `https://github.com/code-yeongyu/lazycodex.git`, default branch `main`
- Local upstream cache: `.omx/cache/upstream/lazycodex` from the monorepo root
- LazyCodex packages OmO (oh-my-openagent) for Codex; OmO depth lives in `.omx/cache/upstream/oh-my-openagent` and `apps/openagent`.

## Common upstream-to-site mapping

| Upstream path | Site target |
| --- | --- |
| `package.json` version | `apps/lzx/src/lib/version.ts` (`LZX_VERSION`) — auto-refreshed by `inject-lzx-version.mjs` |
| `README.md` | Landing/overview: `content/docs/index*.mdx`, `content/docs/getting-started/index*.mdx` |
| `packages/web/content/docs/installation.md` | `content/docs/getting-started/index*.mdx` |
| `packages/web/content/docs/overview.md` | `content/docs/index*.mdx`, `content/docs/concepts/index*.mdx` |
| `packages/web/content/docs/ulw-plan.md` / `start-work.md` / `ulw-loop.md` | `content/docs/commands/*.mdx` |
| `packages/web/content/docs/ultrawork.md` | `content/docs/concepts/ultrawork*.mdx` |
| `packages/web/content/docs/skills.md` + `plugins/omo/skills/*/SKILL.md` | `content/docs/skills/*.mdx`; update category `meta*.json` |
| `plugins/omo/hooks/hooks.json`, `components/*` | `content/docs/concepts/hooks*.mdx` |
| README model-routing section | `content/docs/concepts/model-routing*.mdx`, `content/docs/reference/*` |

## Locale rules

The app ships English plus `.ko.mdx`, `.ja.mdx`, `.zh.mdx` siblings. Keep page-lists in every directory's `meta.json` + `meta.ko/zh/ja.json` consistent. Do NOT list `"index"` in folder metas (Fumadocs uses the folder index automatically; listing it duplicates the sidebar entry).

## Content rules

- Identity: LazyCodex / LZX / `lazycodex-ai` / Codex. Never `gajae-code`/`gjc`/`oh-my-*` in product copy.
- Keep commands, flags, code blocks verbatim from the README and `packages/web/content/docs/*`.
- LZX is a thin distribution layer over OmO; reference OmO for harness internals rather than re-deriving them.
- Record unmapped upstream changes in the final report.
