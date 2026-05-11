# HTML-first visual review pattern

Use this pattern when a docs image needs layout judgment before the final asset is committed.

## Why

A self-contained HTML artifact is a practical intermediate format for docs visuals because it can combine the image, context, prompts, alt text, and insertion snippets in one reviewable page. This is especially useful for workflow diagrams where the success criterion is clarity, not just image quality.

## Workflow

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
- Keep final shared images language-neutral; localize the MDX alt text instead.
- Treat `.omx/artifacts/` sheets as scratch/review outputs, not committed docs assets, unless the user asks for history.
