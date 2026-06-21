# LZX Docs Design System

## 1. Atmosphere & Identity

LazyCodex docs should feel like a restrained technical operations manual: clear, quiet, and trustworthy, with enough structure to make agent workflows easy to scan. The signature is monochrome procedural clarity: small diagrams, command-shaped labels, and subtle muted accents that explain orchestration without turning the docs into a marketing page.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | `--color-fd-background` | Fumadocs token | Fumadocs token | Page background |
| Surface/secondary | `--color-fd-card` | Fumadocs token | Fumadocs token | Cards, diagram panels |
| Surface/muted | `--color-fd-muted` | Fumadocs token | Fumadocs token | Soft fills and inactive steps |
| Text/primary | `--color-fd-foreground` | Fumadocs token | Fumadocs token | Body, headings, diagram labels |
| Text/secondary | `--color-fd-muted-foreground` | Fumadocs token | Fumadocs token | Captions, supporting labels |
| Border/default | `--color-fd-border` | Fumadocs token | Fumadocs token | Dividers, cards, diagram strokes |
| Accent/subtle | muted blue-gray | `#64748b` | `#94a3b8` | Small highlights inside static assets |
| Accent/command | technical indigo | `#4f46e5` | `#818cf8` | Command labels and focus points |

### Rules

- Default to Fumadocs tokens for page UI; static SVG assets may use the documented fallback hex values because they render outside CSS inheritance.
- Keep accents narrow and functional: one emphasized path, lane, or command group per asset.
- Do not introduce broad gradients, saturated decorative backgrounds, or product-redesign colors.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Page title | Fumadocs default | 700 | Fumadocs default | 0 | Existing MDX headings |
| H2/H3 | Fumadocs default | 600 | Fumadocs default | 0 | Existing docs hierarchy |
| Body | Fumadocs default | 400 | Fumadocs default | 0 | MDX prose |
| Caption | 12px | 500 | 1.4 | 0 | SVG annotations |
| Diagram label | 13-16px | 600 | 1.3 | 0 | SVG node and lane labels |
| Command mono | 13-15px | 600 | 1.3 | 0 | Slash and dollar commands |

### Font Stack

- Primary: inherit from Fumadocs UI and the app shell.
- Mono: inherit the app monospace stack for command text.
- SVG labels: system sans with monospace only for command tokens.

### Rules

- Keep text labels short enough to survive responsive scaling.
- Do not add custom web fonts for docs assets.
- Letter spacing stays at `0`.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a 4px base.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight icon/label relationships |
| `--space-2` | 8px | Compact inline groups |
| `--space-3` | 12px | Diagram internal padding |
| `--space-4` | 16px | Node padding and prose rhythm |
| `--space-6` | 24px | Asset section spacing |
| `--space-8` | 32px | Diagram group separation |
| `--space-12` | 48px | Major docs section separation |

### Grid

- Max content width: inherit the Fumadocs docs content column.
- Asset width: responsive image with intrinsic `viewBox`; avoid fixed pixel-only sizing.
- Breakpoints: use the existing app and Fumadocs responsive behavior.

### Rules

- Assets should read at full docs-column width and remain legible when scaled down.
- Keep diagrams horizontal or lightly branched; avoid dense dashboards inside docs prose.

## 5. Components

### Static Explainer SVG

- **Structure**: `svg` with `viewBox`, `title`, `desc`, grouped shapes, short text labels, and no scripts.
- **Variants**: workflow loop, command pipeline, model routing, external link list.
- **Spacing**: 4px-derived padding and gaps.
- **States**: static only; no hover or animation required.
- **Accessibility**: meaningful Markdown alt text in MDX plus internal `title` and `desc`.
- **Motion**: none.

### Docs Prose Image Placement

- **Structure**: one short bridge sentence, then standard Markdown image syntax.
- **Variants**: overview diagram near the concept it explains; command diagram near command list.
- **Spacing**: rely on MDX/Fumadocs prose rhythm.
- **Accessibility**: localized alt text matching the page locale.
- **Motion**: none.

### External Link Button List

- **Structure**: a vertical group of full-width anchors with a left icon, one visible label, and a right external-link arrow.
- **Usage**: official/community links at the end of overview pages.
- **Spacing**: 12px gaps, 16px horizontal padding, 14px vertical padding, 36px icon cells.
- **Accessibility**: real `<a href>` elements with visible destination labels; icons are decorative.
- **Color**: light mode uses softened brand tints for button surfaces; dark mode may use filled brand treatments. Both modes need explicit contrast for icon cells, labels, and arrows.
- **Tone**: button-like enough to invite clicking, with no subtitles or explanatory body copy.

### Install Path Panels

- **Structure**: a two-column responsive grid of bordered `section` panels, each with a small line icon, a short label, one explanatory sentence, and one command block.
- **Usage**: getting-started install choices where users need to compare Codex App and Codex CLI paths.
- **Spacing**: 12px grid gap, 16px panel padding, 8px icon-label gap.
- **Accessibility**: icons are decorative; the visible label must name the install path.
- **Color**: use Fumadocs `fd-card`, `fd-muted`, `fd-border`, and `fd-muted-foreground` tokens only.
- **Tone**: operational and compact, not marketing cards.

### Animated Terminal Capture

- **Structure**: one GIF or image inside a bordered docs figure with explicit `width` and `height`.
- **Usage**: installation or command-flow demonstrations that are safer to replay than to run against the user's real config.
- **Spacing**: align with docs prose images; no caption unless it adds information not already in surrounding prose.
- **Accessibility**: provide localized `alt` text describing the flow.
- **Color**: terminal capture may use the documented muted slate and indigo accent family.
- **Motion**: short looping progress only; no distracting decorative motion.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Static asset | 0ms | none | Current docs explainer SVGs |
| Existing UI microinteraction | Fumadocs default | Fumadocs default | Navigation and theme behavior |

### Rules

- Do not add animation to static docs explainers in this pass.
- Preserve Fumadocs interaction behavior.
- If future diagrams animate, animate only `transform` and `opacity` and provide reduced-motion behavior.

## 7. Depth & Surface

### Strategy

Tonal-shift with thin borders. Surfaces are separated by subtle muted fills and low-contrast strokes, not shadows.

| Type | Value | Usage |
|------|-------|-------|
| Diagram panel | muted surface fill with 1px border | Outer SVG containers |
| Node | white or dark surface fill with 1px border | Workflow steps, lanes, command chips |
| Connector | muted stroke, 1.5-2px | Arrows and routes |
| Emphasis | accent stroke/fill used sparingly | Current step, command spine, selected lane |

### Rules

- Avoid decorative shadows, bokeh, glossy effects, and broad gradients.
- Use rounded corners modestly: 6-8px for nodes, up to 12px for the overall SVG panel.
- Diagrams should look native beside Fumadocs cards and code blocks.
