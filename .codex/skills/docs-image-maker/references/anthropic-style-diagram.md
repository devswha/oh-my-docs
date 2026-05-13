# Anthropic-style technical workflow diagram

Use this recipe when a docs page needs a precise, code-native workflow diagram (states, handoffs, file artifacts, feedback loops) that resembles the diagrams in Anthropic's "Building effective agents" guide — ivory background, muted color-coded boxes, thin gray arrows, sparse labels, single left-to-right backbone.

## When to choose this

- Diagram contains named files, CLI commands, or state labels that must be exact and reusable across EN/KO/JA/ZH locales.
- Layout must stay crisp at any size and survive in the docs UI without raster scaling artifacts.
- Page is conceptual but technical (workflows, lifecycles, multi-agent handoffs).

Don't use it for hero/marketing imagery, conceptual illustrations, or anything that should feel "drawn" rather than diagrammatic. For those, use `god-tibo-imagen` or another image-model surface.

## Visual language

### Background and lines

| Element | Color | Width | Notes |
| --- | --- | --- | --- |
| Canvas bg | `#fdfbf7` | — | Warm ivory; never pure white |
| Solid arrow | `#b3b1a7` | `1.6` | Round caps, marker chevron `M1.5 1.5 L9 5 L1.5 8.5`, markerWidth 10, refX 9 |
| Feedback (dashed) | `#b3b1a7` | `1.5` | `stroke-dasharray: 3 8` |
| Boundary (very subtle) | `#dcdad2` | `1.1` | `stroke-dasharray: 2 7`; only for separating conceptual halves |

### Box colors (semantic)

| Role | Fill | Stroke | Text |
| --- | --- | --- | --- |
| LLM call / command / action | `#f0f7eb` | `#b8dca8` | `#5a913e` |
| Durable state / repo file / tool | `#f5f3ff` | `#b7adf1` | `#6b62aa` |
| Transient bridge artifact | `none` (outline) | `#b7adf1` | `#6b62aa` |
| Boundary input / output (pill only) | `#fff8f5` | `#f0b6a4` | `#c65f40` |
| File row inside a state box | `#ffffff` | `#d6cff0` | `#6b62aa` |

Color rules:
- Orange pills are reserved for true I/O at the canvas edges. Don't use orange mid-flow.
- Two greens = two LLM/action steps. Avoid arbitrary recoloring.
- Outline-only purple = something that exists *between* repo state and active thread (a prompt, a printed payload, a transient bridge).

### Text colors and sizes

- Main box label: `34px`, weight `600`, semantic color above
- Subtitle / axis / arrow label: `22px`, weight `450`, color `#7a7872`
- File row text inside state box: `24px`, weight `500`, purple `#6b62aa`
- Letter-spacing: sans `-0.005em`, mono `0`

### Typography

- **Sans (concept labels)**: Space Grotesk — open-source proxy for Anthropic's Styrene (~72% similar)
- **Mono (CLI / file / code labels)**: JetBrains Mono — matches the codex landing brand

Embed via `@import` inside `<defs><style>` so the SVG renders the same in any context:

```css
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap");
```

Fallback stacks:

```css
font-family: "Space Grotesk", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

### Box geometry

- Pills: `rx=38` (≈ half of 76 height)
- Rectangular boxes: `rx=10`
- Inner file rows: `rx=6`
- Stroke width on all box rects: `1.5`
- Common heights: pill `76`, action/state box `100`, file-listing state box `164` (= 3 file rows + padding)

### Layout

- Single left-to-right backbone. One straight horizontal line of 5–7 nodes. No branches off the backbone.
- Arrows uniform length, typically ~96px between adjacent nodes.
- Subtitle labels sit above their referent with an 18–20px gap.
- Feedback loop runs *below* the backbone, shallow arc that lands on the right edge of the state box it returns to.
- Boundary (`repo artifacts | active thread` etc.) is a vertical dashed line through the diagram. Labels above the line, anchored end (left side) / start (right side).

### Canvas

- Wide aspect: typical `2401 × 440` for a 6-node backbone. Shorter if no feedback loop.
- Vertical padding: ~55px top, ~40px bottom. Avoid >100px on either side — that's what makes early drafts feel empty.
- Backbone center at canvas mid-height.

## Starter template

Copy `assets/svg-templates/anthropic-style-template.svg`. It contains the full CSS palette, `@import`, marker definition, and a placeholder 5-node backbone you can rename and rewire.

## Iteration loop

1. **Draft v1**: one-shot SVG with the visual language above; render to PNG via headless Chrome (see below).
2. **Review against reference** ("Building effective agents" diagrams). Specifically check:
   - Does each color carry the same semantic across the whole diagram?
   - Are orange pills only at boundary I/O?
   - Are box heights uniform enough to read as one row?
   - Is the backbone a single straight line (no T-junctions, no detours)?
   - Do any labels crowd into adjacent arrows or boxes?
3. **Verdict**: keep / revise / reject. If revising, change the *fewest* elements; bumps in version (v2, v3) make A/B comparison easy.
4. **Validate semantics**: every named filename, command, or state in the diagram must match the real workflow code (read the actual implementation, don't trust the docs page alone).
5. **Final crop**: shrink canvas to the smallest size that doesn't crowd labels. Empty top/bottom space is the most common over-sight.

## Rendering to PNG (local preview)

Headless Chrome renders an SVG file directly:

```bash
google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=<W>,<H+120> --virtual-time-budget=4000 \
  --screenshot=preview-raw.png \
  "file://$(pwd)/diagram.svg"
```

**Chrome bottom-clip quirk**: when `--window-size` matches the SVG's intrinsic `width`/`height` exactly, Chrome clips ~90px from the bottom of the rendered image. Always render at `H + 120`, then crop:

```python
from PIL import Image
im = Image.open('preview-raw.png')
im.crop((0, 0, W, H)).save('preview.png')
```

This only affects local preview generation. Browsers render the SVG correctly when it's embedded in a docs page via `<img>` or inline.

## Worked example

`.omx/artifacts/docs-images/ultragoal-anthropic-style/` (gitignored) contains the iteration log used to develop this recipe — v1 → v4, review prompts, decision notes, the final SVG used for Ultragoal docs. Treat it as scratch; don't depend on it surviving across machines or branches.

## Locale handling

A single Anthropic-style SVG ships across EN/KO/JA/ZH because the labels are short technical terms (`Brief`, `Codex`, `handoff`, `verify`, `Done`, plus actual filenames). Translate only the alt text in each MDX file. If a label genuinely needs translation, produce one SVG per locale and suffix the filename with the locale (`*-ko.svg` etc.) — but first ask whether the term should remain in English instead.
