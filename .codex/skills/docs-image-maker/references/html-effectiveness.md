# HTML-first docs review pattern

Use this pattern when a docs page, rewrite, update, or image needs review before the final MDX/assets are committed.

## Why

A self-contained HTML artifact is a practical intermediate format for docs work because it can combine page structure, source/proposal snapshots, locale status, links, images, preview URLs, prompts, alt text, and review checklists in one page. This is especially useful when the success criterion is reader clarity, not just code correctness.

## Document review workflow

1. Generate a review sheet under `.omx/artifacts/docs-review/<page-slug>.html`.
2. Include the current outline, section scan, locale matrix, image/link audit, and preview URLs.
3. If testing a rewrite, pass a proposed MDX draft with `--proposal-file` so the sheet can compare outlines and source snapshots.
4. Apply approved changes in the real MDX files, not in the generated HTML.
5. Run docs validation and preview smoke checks before claiming completion.

## Image review workflow

1. Generate a review sheet under `.omx/artifacts/docs-images/<topic>.html`.
2. Include multiple visual candidates on one page.
3. Show each candidate with:
   - purpose and intended page placement
   - visual preview
   - draft alt text
   - model prompt for future raster generation
   - MDX insertion snippet for the selected asset
4. Pick one candidate and export only that asset into `apps/<app>/public/images/docs/`.
5. Wire the selected asset into locale sibling MDX files with localized alt text.
6. Run docs validation and preview smoke checks before claiming completion.

## Rules of thumb

- Prefer SVG/HTML for exact workflows, state machines, comparisons, and diagrams.
- Prefer model-generated PNGs for mood, hero, or conceptual art where exact structure is less important.
- Prefer docs review sheets before large rewrites, upstream syncs, locale alignment, or image placement decisions.
- Keep final shared images language-neutral; localize the MDX alt text instead.
- Treat `.omx/artifacts/` sheets as scratch/review outputs, not committed docs assets, unless the user asks for history.
