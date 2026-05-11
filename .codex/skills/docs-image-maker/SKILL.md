---
name: docs-image-maker
description: Plan, generate, and wire reader-friendly images for documentation pages in this monorepo. Use when Codex needs to add illustrations, workflow diagrams, concept art, hero/social images, or generated raster assets to apps/codex, apps/claudecode, or apps/openagent docs; when a user asks to make docs easier to read with images; when using god-tibo-imagen/gti, Codex image generation, or image prompt planning for docs; or when updating MDX image references and previewing them on the local/Tailscale docs server.
---

# Docs Image Maker

## Overview

Create docs-ready image assets and MDX placements for the three docs apps. Prefer helpful explanatory visuals over decoration, keep generated files under each app's `public/images/`, and keep locale siblings synchronized.

## Quick start

1. Identify target app and page. Defaults: OMX/Codex → `codex`, Claude Code → `claudecode`, OpenAgent → `openagent`.
2. Run the planner when placement/path is not obvious:

```bash
node .codex/skills/docs-image-maker/scripts/plan-doc-images.mjs --app codex --from-git
node .codex/skills/docs-image-maker/scripts/plan-doc-images.mjs --app codex apps/codex/content/docs/guides/index.mdx
```

3. For precise workflow images, create an HTML-first review sheet before committing the final asset:

```bash
node .codex/skills/docs-image-maker/scripts/make-image-sheet.mjs \
  --app codex \
  --topic ultragoal \
  --pick rail \
  --sheet .omx/artifacts/docs-images/ultragoal.html \
  --asset apps/codex/public/images/docs/skills-workflow-ultragoal-flow.svg
```

4. Read `references/doc-image-style.md` before writing prompts or inserting images.
5. If using `god-tibo-imagen`, read `references/god-tibo-imagen.md`, dry-run first, then generate only when the user clearly wants repo image assets created:

```bash
node .codex/skills/docs-image-maker/scripts/generate-with-gti.mjs \
  --app codex \
  --prompt "clean conceptual illustration of multi-agent documentation workflow, no text" \
  --output apps/codex/public/images/docs/guides-ultragoal-flow.png \
  --size 1536x1024 \
  --dry-run
```

Use `--live` instead of `--dry-run` for actual generation. If `gti` is unavailable, report the install/auth gap or use another available image-generation surface.

## Workflow

### 1. Choose image purpose

Use images where they reduce cognitive load:

- **Hero/context** — top-of-page visual that sets the mental model.
- **Concept** — one abstract idea, no tiny labels.
- **Flow** — sequence, lifecycle, state machine, or orchestration path.
- **Comparison** — two-mode tradeoff, before/after, or selection guide.
- **Screenshot** — only when real UI proof matters; prefer generated illustrations for conceptual docs.

Do not add images only to fill space.

### 2. Place assets consistently

Use these repo paths:

| App | Public image directory | MDX URL prefix |
| --- | --- | --- |
| `codex` | `apps/codex/public/images/` | `/images/...` |
| `claudecode` | `apps/claudecode/public/images/` | `/images/...` |
| `openagent` | `apps/openagent/public/images/` | `/images/...` |

For new generated docs art, prefer `public/images/docs/<page-slug>-<purpose>.png`. Reuse one image across locale siblings; localize alt text and captions in each MDX file.

### 3. Write safe prompts

Use language-neutral prompts unless the image intentionally contains UI text. Prefer:

- no embedded words, labels, logos, or code snippets
- clear composition with one focal idea
- docs-site-friendly aspect ratio (`1536x1024` or `2048x1152` for wide content)
- accessible contrast and enough whitespace
- style continuity with the app brand, but no trademark imitation

### 4. Generate or create the image

Provider choice:

1. **HTML-first review sheet** — use when structure, layout, or explanatory clarity matters. Generate a self-contained `.omx/artifacts/docs-images/<topic>.html` sheet with candidates, prompts, alt text, and the selected SVG export.
2. **Existing vector/code-native diagram** — use when exact structure matters or text labels are required.
3. **`god-tibo-imagen` / `gti`** — use for committed PNG assets when installed and authenticated; dry-run first. This uses an unsupported private Codex/ChatGPT backend path, so never commit auth files or debug dumps.
4. **Built-in `imagegen` skill/tool** — use for conversational bitmap generation or when the environment supports saving the generated asset.
5. **Fallback** — create an SVG/diagram placeholder and report that live raster generation is blocked.

### 4a. HTML-first workflow

Use the HTML-first path for workflow diagrams and concept comparisons:

- Generate a portable review sheet under `.omx/artifacts/docs-images/`.
- Put each candidate's visual, purpose, image prompt, alt text, and MDX snippet next to each other.
- Keep the committed final image language-neutral when one asset is shared across locales.
- Export the selected SVG or use the selected prompt as the input for `gti`/imagegen raster generation.
- Do not commit `.omx/artifacts/` review sheets unless the user explicitly asks for artifact history.

### 5. Wire MDX

Insert Markdown image syntax near the section it explains:

```mdx
![Accessible alt text for the visual](/images/docs/example-flow.png)
```

Keep alt text meaningful and localized. If the same image is shared across EN/KO/JA/ZH pages, update all existing locale sibling pages unless the user requested one locale only.

### 6. Verify

For Codex/OMX docs, run:

```bash
npm --prefix apps/codex run check:localized-links
npm run lint:codex
npm run build:codex
```

Then use `preview-docs-local` for the app, usually with `--tailscale`, and smoke-check the changed routes. Report image paths, MDX pages updated, preview URLs, and any generation/provider gaps.

## References

- `references/doc-image-style.md` — prompt, placement, accessibility, and locale guidance.
- `references/god-tibo-imagen.md` — optional `gti` provider notes based on `NomaDamas/god-tibo-imagen`.
- `references/html-effectiveness.md` — HTML-first review-sheet pattern for visual iteration.
