# Harness

Documentation site for `omc` (oh-my-claudecode). Next.js + Fumadocs. Multi-locale.

## Stack

- **Main**: `omc` (oh-my-claudecode)
- **Side**: —
- **Final pass**: `patina` (per-locale: `--lang en`, `--lang ko`, etc.)

## Why

- OMC ecosystem dogfooding (this project IS omc's docs)
- Claude prose strength + Korean tone naturalness
- Single-harness simplicity reduces context-switching overhead

## patina final pass (mandatory)

Claude leaves AI patterns too — `patina` removes them.
Bonus: dogfoods the user's own `patina` skill.

## Lane

| Lane | Owner |
|---|---|
| MDX body, prose, translations | omc |
| Code blocks (omc skill examples) | omc |
| Sidebar `meta.*.json` | omc |
| Final humanization pass | patina, per locale |

## No ouroboros

MDX edits are short and spec-drift risk is low. ouroboros overhead exceeds value here.
Exception: schema-level changes that affect every locale MAY use ouroboros.

## Do NOT

- Do not skip `patina` final pass — Claude output still has AI patterns
- Do not switch primary harness — defeats dogfooding
- Do not desync localized siblings from canonical `*.mdx`
