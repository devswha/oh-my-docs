# Docs image style guide

## Placement rules

- Add an image only when it explains a concept, sequence, relationship, or decision faster than prose.
- Put a hero/context image near the top only when it helps orient the reader.
- Put flow or concept images immediately before or after the section they explain.
- Do not put separate copies of the same generated image under locale-specific paths unless the pixels contain localized text.

## File naming

Use lowercase hyphenated names:

```text
apps/<app>/public/images/docs/<page-slug>-<purpose>.png
```

Examples:

```text
apps/codex/public/images/docs/guides-ultragoal-flow.png
apps/codex/public/images/docs/skills-ralph-loop.png
apps/openagent/public/images/docs/agents-orchestration-map.png
```

Reference from MDX as `/images/docs/<file>.png`.

## Prompt pattern

Use this structure:

```text
Create a docs-ready illustration for <project/app> explaining <concept>.
Scene: <objects and relationship>.
Style: clean documentation diagram, minimal line/card layout, neutral borders, subtle accent color, generous whitespace.
Constraints: no text, no labels, no logos, no screenshots, no watermark, accessible contrast, composition works at 16:9 and docs-column widths.
Mood: helpful, calm, technical, modern.
```

For flow images, describe the motion without asking for words inside the image:

```text
Show three connected zones representing clarify, plan, execute. Use abstract cards, arrows, and agent nodes, but no readable text.
```

## Accessibility

- Alt text should describe the information conveyed, not the art style.
- Captions are optional; use them when a visual introduces a new mental model.
- Avoid color-only meaning. If the diagram needs status distinctions, use shape, position, or icons as well.
- Keep images decorative-free in screen-reader terms only when they are truly decorative; most docs images need useful alt text.

## Locale guidance

- Prefer no embedded text in generated images so EN/KO/JA/ZH pages can reuse the same file.
- Localize alt text and captions in MDX.
- If a visual must contain text, generate one file per locale and name it with locale suffixes, e.g. `guides-flow-ko.png`.

## App visual notes

- `codex`: match the Fumadocs site: rounded cards, thin neutral borders, muted backgrounds, sparse blue accent, and minimal line diagrams. Avoid heavy hero-art gradients unless the target is a social/landing image.
- `claudecode`: coding assistant, Claude Code workflows, concise IDE-like visual language.
- `openagent`: orchestration and multi-agent metaphors; existing docs use Sisyphus/orchestrator imagery.
