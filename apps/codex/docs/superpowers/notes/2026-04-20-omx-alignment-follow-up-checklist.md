# Follow-up Checklist — OMC Alignment / OMX Docs Site

- Date: 2026-04-20
- Scope: follow-up work after the OMC-alignment + site/runtime fixes pass

## A. Product / ownership decisions

- [ ] Decide the canonical destination for support submissions:
  - site repo issues
  - upstream OMX repo issues
  - split model (site bugs vs upstream product bugs)
- [ ] Document that destination clearly in:
  - `content/docs/support/index.mdx`
  - localized support pages
  - any deployment/env setup docs
- [ ] Decide whether `Edit this page` should always point to the current docs repo or eventually move to a content-only repo model

## B. Support/report flow hardening

- [ ] Add explicit docs for required env vars for `/api/report`
- [ ] Verify `report` path end-to-end in a deployed environment with real Turnstile + GitHub credentials
- [ ] Add regression coverage for `vote` vs `report` request-shape handling
- [ ] Decide whether vote submissions should remain unauthenticated / Turnstile-free or adopt a lighter anti-abuse control
- [ ] Confirm support-page issue tracker wording matches the real filing target in production

## C. Version / build hygiene

- [ ] Decide whether `src/lib/version.ts` should remain checked in or become fully generated-only in CI
- [ ] Reduce version-file churn during local/team verification runs if possible
- [ ] Confirm `next.config.mjs` worktree root resolution still behaves correctly in:
  - normal repo root runs
  - nested OMX team worktrees
  - CI / Vercel builds
- [ ] Add a small note near `next.config.mjs` explaining why ancestor root resolution exists

## D. Docs IA follow-through

- [ ] Review whether additional locale index pages beyond integrations should receive the same expanded structure as English
- [ ] Audit section landing pages for tone consistency after the new overview tables
- [ ] Confirm all newly expanded index pages preserve OMX-specific facts and counts
- [ ] Review whether `README.md` should also mention the docs comparison baseline and maintenance workflow

## E. QA / verification improvements

- [ ] Add a lightweight script or documented checklist for post-change verification:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- [ ] Add a targeted check for edit-link correctness across localized docs routes
- [ ] Add a targeted check for support page links across all locales
- [ ] Add a targeted check that `.omx/` runtime artifacts remain excluded from lint

## F. Repo / workflow considerations

- [ ] Decide whether to keep the current mixed site-shell + docs-content repo structure long term
- [ ] If not, evaluate a future split into:
  - content-only docs repo
  - separate site-shell repo
- [ ] If yes, document clearly why OMX intentionally differs from the OMC repo model
- [ ] Optionally squash or reorganize the execution-heavy local history before external publication if cleaner history is preferred

## G. Nice-to-have follow-ups

- [ ] Add a small maintainer guide for running OMC-vs-OMX comparison refreshes in the future
- [ ] Add a drift-tracking note linking changed docs sections back to upstream OMX surfaces
- [ ] Consider generating the comparison summary/checklist from a repeatable script if this workflow will recur
