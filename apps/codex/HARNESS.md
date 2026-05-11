# Harness

Documentation site for `omx` (oh-my-codex). Next.js 16 + Fumadocs 16. 4 locales (EN/KO/ZH/JA).

## Stack

- **Main**: `omc` (oh-my-claudecode)
- **Side**: `omx` for code-sample execution verification only
- **Final pass**: `patina` (per-locale: `--lang en`, `--lang ko`, `--lang zh`, `--lang ja`)

## Why

- Docs success metric is *readability*, not "did `omx` write its own docs"
- Claude is strongest at multi-language prose (KO/EN/ZH/JA), especially Korean tone (avoids translation-y stiffness)
- Multi-language translation consistency favors omc

## Dogfooding scope (deliberately narrow)

- **Body text dogfooding**: rejected — would degrade tone
- **Code-sample dogfooding**: kept — every code block in docs SHOULD be executable on `omx` CLI. Use `omx` to write/verify code samples and CLI examples; do not let `omc` invent CLI flags.

## Lane

| Lane | Owner |
|---|---|
| MDX body, prose, translations | omc |
| Code blocks, CLI examples, command reference | omx (write or verify), omc (formatting) |
| Sidebar `meta.{ko,zh,ja}.json` | omc |
| Final humanization pass | patina, per locale |

## No ouroboros

MDX edits are short and spec-drift risk is low. ouroboros overhead exceeds value here.
Exception: schema-level changes (e.g. content layout, frontmatter conventions) MAY use ouroboros if they affect all locales.

## Do NOT

- Do not let `omx` rewrite body prose — Korean tone regresses
- Do not skip `patina` final pass — both omc and omx leave AI patterns
- Do not desync `*.{ko,zh,ja}.mdx` from canonical `*.mdx` — see `docs/CONTRIBUTING-TRANSLATIONS.md`
