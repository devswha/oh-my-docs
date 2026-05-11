# Docs Search & Support — Design

**Date:** 2026-04-19
**Scope:** Add search and support (bug/issue inquiry + future FAQ) to the
OMC documentation site without damaging the existing visual design.
**Repos touched:** `oh-my-claudecode-docs` (content), `oh-my-claudecode-website` (Next.js + Fumadocs app).

> **Historical note (2026-04-20):** The two repos described below were
> consolidated into a single monorepo and the Next.js app repo was
> renamed from `oh-my-claudecode-website` to `oh-my-claudecode-docs`.
> References to the two-repo split are preserved as-authored to keep
> the design rationale intact.

## 1. Goals & Non-Goals

**Goals**
- Full-text search across every doc page with keyboard shortcut (`⌘K` / `Ctrl+K`, `/`).
- Per-page lightweight feedback (👍 / 👎, Edit, Report issue).
- A public Support page (`/docs/support`) that hosts:
  - a "Report a bug / ask a question / suggest" form usable **without a GitHub account**
  - a FAQ section that can grow over time.
- All user-submitted reports land as GitHub Issues in `oh-my-claudecode-docs`.
- Anti-abuse via Cloudflare Turnstile.
- Zero visual regression — styling flows from Fumadocs defaults + existing theme tokens.

**Non-Goals (MVP)**
- Email capture / reply-by-email workflow.
- File/screenshot attachments.
- Vote aggregation dashboard (votes are logged only; aggregation deferred).
- Seeding FAQ with content — page ships empty and grows from real issues.
- Algolia DocSearch, custom search backend, or full-page search UI.

## 2. Architecture

```
oh-my-claudecode-docs                oh-my-claudecode-website
  (MDX content)                        (Next.js 15 + Fumadocs)
  ─────────────                        ───────────────────────
  support/
    index.mdx        ────── renders ──► app/docs/[[...slug]]/page.tsx
    index.ko.mdx                            │
    index.ja.mdx                            ├── <PageFooter />  (new)
    index.zh.mdx                            │      👍 / 👎 / Edit / Report
    meta.json  (adds "support" entry)       │
                                            ├── <ReportForm />  (new, mounted on /support)
                                            │      └── POST /api/report
                                            │
                                            ├── Fumadocs <RootProvider>
                                            │      └── Orama search (header bar)
                                            │
                                            └── app/api/report/route.ts  (new)
                                                   ├── Turnstile verify
                                                   ├── Octokit issues.create
                                                   └── 200 { ok, url }
```

## 3. Content Layer (`oh-my-claudecode-docs`)

### 3.1 New page: `/support/index.mdx`

Structure:

```mdx
---
title: Support
description: Report a bug, ask a question, or browse the FAQ.
---

## FAQ

{/* Empty for MVP — populated from recurring questions. */}

_No entries yet. Be the first to ask below._

## Report an issue or ask a question

<ReportForm />

---

## Other channels

- GitHub Issues: [oh-my-claudecode-docs/issues](https://github.com/devswha/oh-my-claudecode-docs/issues)
- Upstream project: [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
```

`<ReportForm />` is registered via Fumadocs MDX components map (website repo, see §4.3).

### 3.2 Translations

Four locales, same structure: `index.mdx`, `index.ko.mdx`, `index.ja.mdx`, `index.zh.mdx`. Korean first (user's primary language), then zh/ja in follow-up PRs to stay consistent with existing 81/81 translation discipline.

### 3.3 Sidebar

Root `meta.json` (and `meta.{ko,ja,zh}.json`) get `"support"` appended **after** existing entries. Sidebar title localized per meta file ("Support" / "지원" / "支持" / "サポート").

## 4. Website Layer (`oh-my-claudecode-website`)

### 4.1 Search

- Enable Fumadocs search via `next.config.mjs` + `app/api/search/route.ts` using the built-in `createFromSource` helper from `fumadocs-core/search/server`.
- Register multilingual tokenizers on the Orama instance:
  - `@orama/tokenizers/korean`
  - `@orama/tokenizers/mandarin`
  - `@orama/tokenizers/japanese`
- Search bar surfaces via Fumadocs' default `<RootProvider>` — already wired in `src/app/layout.tsx`; no custom UI.
- Keyboard shortcuts: `⌘/Ctrl+K` and `/` (Fumadocs defaults).
- Indexing scope: **current locale only**. Fumadocs `source` loader splits locale variants automatically.

### 4.2 `<PageFooter />`

New client component, rendered at the bottom of every docs page via Fumadocs `DocsPage` footer slot.

Props: `path: string`, `locale: string`, `editUrl: string`.

Behavior:
- **👍 / 👎** — on click, POSTs `{ kind: "vote", path, locale, value: "up" | "down" }` to `/api/report`. UI shows transient "Thanks!" toast. Button disabled after submit (localStorage keyed by path to prevent trivial spam-clicking). No persistence beyond server log in MVP.
- **Edit** — deterministic URL:
  `https://github.com/devswha/oh-my-claudecode-docs/edit/main/<path-to-mdx>`
- **Report issue** — Next.js `<Link>` to `/docs/support?path=<encodeURIComponent(path)>&locale=<locale>`.

Styling: reuses existing muted-foreground text + hover tokens; no new colors introduced.

### 4.3 `<ReportForm />`

Client component, registered in Fumadocs MDX components map so it can be used inside `/support/index.mdx` across all locales.

Fields (plain HTML + native validation, no form library for MVP):

| Field | Type | Required | Notes |
|---|---|---|---|
| `category` | radio | yes | `bug` \| `question` \| `suggestion` |
| `title` | text | yes | 10–120 chars |
| `body`  | textarea | yes | 20–8000 chars, markdown allowed |
| `path`  | hidden | no  | hydrated from `?path=` query param |
| `locale`| hidden | yes | read from Fumadocs i18n context |
| Turnstile token | widget | yes | invisible, `@marsidev/react-turnstile` |

On submit:
1. Client POSTs JSON to `/api/report` with `kind: "report"`.
2. Button disabled + spinner until response.
3. On 200: replace form with success panel containing the returned issue URL ("Tracked as #123 — you can follow progress here, no account needed to read"). On 4xx: inline error. On 5xx: generic error + "try again later".

Accessibility: native labels, `aria-describedby` for help text, focus moves to result panel after submit.

### 4.4 `POST /api/report`

File: `src/app/api/report/route.ts`. Node runtime (not Edge — Octokit does not run clean on Edge).

Request body (discriminated union):

```ts
type Body =
  | { kind: "vote"; path: string; locale: string; value: "up" | "down"; turnstileToken: string }
  | { kind: "report"; category: "bug" | "question" | "suggestion";
      title: string; body: string; path?: string; locale: string; turnstileToken: string };
```

Flow:
1. **Validate** with zod. Reject 400 on schema failure.
2. **Verify Turnstile** — POST token to `https://challenges.cloudflare.com/turnstile/v0/siteverify`. On failure: 403.
3. **Branch on `kind`**:
   - `vote`: `console.log` structured line (`{ ts, kind, path, locale, value }`). Return `{ ok: true }`. (Extension path: Cloudflare KV or Supabase table.)
   - `report`: call Octokit:
     ```ts
     await octokit.rest.issues.create({
       owner: "devswha",
       repo:  "oh-my-claudecode-docs",
       title,
       body: `${body}\n\n---\n- Page: ${path ?? "(none)"}\n- Locale: ${locale}\n- Submitted via: omc.vibetip.help`,
       labels: [`kind/${category}`, "via/web"],
     });
     ```
     Return `{ ok: true, url: issue.html_url }`.
4. **Errors** — 500 with opaque message; details logged server-side only.

Rate limiting: rely on Turnstile for MVP. Add IP-based limiter only if abuse appears.

### 4.5 Environment variables

Added to website repo `.env.example` + deployment:

```
GITHUB_REPORT_TOKEN            # fine-grained PAT, repo scope: issues:write
GITHUB_REPORT_REPO_OWNER       # 'devswha'
GITHUB_REPORT_REPO_NAME        # 'oh-my-claudecode-docs' (test repo during smoke phase)
TURNSTILE_SITE_KEY             # public, exposed via NEXT_PUBLIC_
TURNSTILE_SECRET_KEY           # server only
```

Owner/name are env-driven so the smoke-test phase can target a throwaway repo before flipping to `oh-my-claudecode-docs`.

### 4.6 GitHub labels

Pre-create in `oh-my-claudecode-docs`:
- `kind/bug` (red)
- `kind/question` (blue)
- `kind/suggestion` (green)
- `via/web` (grey)

## 5. Error Handling & Edge Cases

| Case | Behavior |
|---|---|
| Turnstile unavailable / network hiccup | Client shows "Verification failed, refresh and retry." |
| GitHub API 5xx / rate-limited | Server returns 503; client suggests GitHub Issues link as fallback. |
| Empty FAQ | `/support` page shows "No entries yet." without layout shift. |
| User without JS | Form is progressively enhanced: `<form action="/api/report" method="POST">` still submits; success page renders server-side. (Stretch goal; not blocking MVP — see §7.) |
| Vote double-submit | localStorage flag per `(path, value)`; server also treats votes as idempotent (log-only). |
| Missing env vars in dev | API returns 500 with explicit "GITHUB_REPORT_TOKEN missing" log; form shows generic error. |
| Non-EN locale with no translated `/support` yet | Fumadocs fallback renders EN content; sidebar still localized. |

## 6. Testing

**Content (docs repo)**
- MDX lint (existing CI) covers new `/support/*.mdx`.
- `meta.json` entries must round-trip: `JSON.parse` in CI script.

**Website (website repo)**
- Unit: zod schema validates/rejects all field-edge cases.
- Unit: API route handler with mocked Octokit + mocked Turnstile (`msw`).
- E2E (Playwright): happy-path bug report end-to-end with Turnstile mocked to always pass; assert success panel + issue URL format.
- Visual: a single `@playwright/test` screenshot diff of `/docs/getting-started` before/after `<PageFooter />` addition to confirm no regression.

## 7. Rollout

1. **Implementation** — all changes land on branches in both repos but remain **unmerged**.
2. **Local verification gate (MANDATORY)** — run `npm run dev` in the website repo with the docs submodule pointed at the feature branch. Maintainer manually walks through:
   - Search bar appears in header, `⌘K` opens modal, Korean/English/Japanese/Chinese queries return results from the correct locale.
   - Every docs page has `<PageFooter />` with working 👍/👎, `Edit`, `Report` links; visual check vs `main` shows no layout regression.
   - `/docs/support` renders FAQ placeholder + form; Turnstile widget loads; form submit against a **test repo** (not the real `oh-my-claudecode-docs`) succeeds and returns an issue URL.
   - Error paths: bad Turnstile, GitHub API failure, oversized body — all surface readable errors.
   Only proceed to PR merges after maintainer signs off.
3. **PR A (docs repo)** — spec + new `/support` MDX pages + meta updates. Safe to merge first; Fumadocs renders the page even if `<ReportForm />` component isn't yet registered (unknown component = inline warning in dev, empty in prod).
4. **PR B (website repo)** — search enablement + `<PageFooter />` + `<ReportForm />` + API route + Turnstile + env vars. Behind a `NEXT_PUBLIC_ENABLE_SUPPORT=1` flag on first deploy so we can smoke-test in production without exposing a broken form. Env var `GITHUB_REPORT_REPO_NAME` initially points to a throwaway test repo; flip to `oh-my-claudecode-docs` only after the production smoke test.
5. **PR C (docs repo)** — Korean/Japanese/Chinese translations of `/support`.
6. Remove the flag after 24h of clean submissions.

Progressive enhancement (no-JS form) is deferred to a follow-up; MVP requires JS.

## 8. Open Questions

- Should the `Edit` link target `main` or the current ref? → **Main** (docs repo has no PR preview branches).
- Do we need i18n on error strings? → Yes, but sourced from a small locale map in `<ReportForm />` (not from MDX).
- FAQ authoring workflow — maintained by hand as MDX, or generated from labeled issues? → **Hand-authored MDX** for MVP; generation is a separate initiative.

## 9. Success Criteria

- Search returns results for "autopilot", "ralph", "TDD" within 200ms on production.
- A non-technical user can file a bug from `/docs/support` in < 60s without a GitHub account, and receives a link to the created issue.
- `<PageFooter />` adds ≤ 32px of vertical space and uses only existing theme tokens.
- No Lighthouse regression > 2 points on the docs landing page.
