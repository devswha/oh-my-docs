# god-tibo-imagen provider notes

Source: https://github.com/NomaDamas/god-tibo-imagen

## What to rely on

`god-tibo-imagen` provides a Node CLI (`gti`) and Python SDK for generating PNG images by reusing local Codex ChatGPT authentication. The upstream README states that it:

- reuses local Codex ChatGPT auth from `~/.codex/auth.json`
- reads `~/.codex/installation_id` when available
- sends a request to `https://chatgpt.com/backend-api/codex/responses`
- requests the built-in `image_generation` tool with `output_format: png`
- parses streamed SSE output and saves the resulting PNG
- supports dry-run, sanitized debug dumps, image inputs, size selection, and a `codex exec` fallback provider

## Caveats

- This is not a supported public API integration. Treat it as best-effort and unstable.
- Do not commit `~/.codex/auth.json`, `installation_id`, cookies, bearer tokens, debug dumps, or raw response bodies.
- Use dry-run first for prompt/path validation.
- If `gti` is not installed or the Codex auth mode is not ChatGPT-backed, report the gap instead of trying to bypass auth.

## CLI patterns

```bash
gti --provider auto --prompt "flat blue square icon" --output ./out.png

gti --provider auto \
  --prompt "a clean docs illustration, no text" \
  --size 1536x1024 \
  --output apps/codex/public/images/docs/example.png

gti --provider auto \
  --prompt "Make this UI screenshot more friendly" \
  --image ./input.png \
  --output ./out.png
```

Supported image input formats listed upstream: `png`, `jpg`/`jpeg`, `gif`, `webp`.

Useful sizes listed upstream:

- `auto`
- `1024x1024`, `2048x2048`
- `1536x1024`, `2048x1152`, `3840x2160`
- `1024x1536`, `2160x3840`
