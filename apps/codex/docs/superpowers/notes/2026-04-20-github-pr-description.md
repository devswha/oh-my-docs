# GitHub PR Description — Final Draft

## Summary
- align the top-level OMX docs flow with the OMC reference structure while preserving OMX-only sections and facts
- fix docs/site mismatches around edit links, support/vote request handling, and support-form localization
- stabilize Next.js 16 verification for OMX team worktrees by switching `middleware` to `proxy`, resolving `turbopack.root` from the nearest install root, and excluding `.omx/` runtime artifacts from lint

## What changed

### Docs / IA alignment
- expanded the top-level docs landing pages from placeholder blurbs into structured section overviews
- added a clearer repository-structure explanation to `README.md`
- upgraded the integrations section index pages (`en/ko/ja/zh`) to match the same navigational pattern
- clarified support page wording so the public site issue tracker and upstream project are distinct

### Site behavior fixes
- fixed `Edit this page` links to point at the real `content/docs/...` source path
- split `vote` and `report` request handling so page votes no longer depend on a fake Turnstile token
- localized the support-form disabled state copy across all four languages

### Verification / runtime fixes
- renamed `src/middleware.ts` to `src/proxy.ts` for Next.js 16
- made `next.config.mjs` resolve the Turbopack root from the nearest ancestor with `node_modules/next`
- excluded `.omx/` runtime/worktree artifacts from ESLint so post-team lint stays clean

## Why
The current OMX docs site already followed the broad OMC information architecture, but it still diverged in two important ways:

1. the docs entry pages were much thinner than the OMC reference and did less to guide readers into the right section
2. the site shell had a few real contract/runtime bugs that only show up in practice: broken edit links, vote/report mismatch, Next.js 16 deprecation drift, and `$team`-related lint/build friction

This change closes those gaps without forcing OMX into OMC-only concepts or removing OMX-specific surface area.

## Validation
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- verified vote POST path returns `200 {"ok":true}` after the vote/report contract fix
- verified OMX team runtime reached `completed=3, failed=0` and shut down cleanly after the comparison/fix run

## Reviewer guide
Please focus on these areas:

1. `src/app/api/report/route.ts` — confirm the vote/report split matches intended anti-abuse policy
2. `src/app/[lang]/docs/[[...slug]]/page.tsx` — confirm the edit-link target matches the real maintenance workflow
3. `next.config.mjs` and `src/proxy.ts` — confirm the Next.js 16/worktree verification fix is the right scope
4. `content/docs/*/index.mdx` — confirm the added structure improves navigation without drifting from OMX facts
5. `content/docs/support/index*.mdx` — confirm the issue-tracker wording is clear enough for users

## Follow-ups (not required for this PR)
- decide whether support issue filing should permanently target the site repo, upstream repo, or a documented split model
- consider normalizing version-file churn around `src/lib/version.ts`
- optionally clean up the team auto-checkpoint/merge-heavy history before public merge if commit hygiene matters more than preserving execution trace
