# Shared Upstash KV with OMC — Follow-up

**Date**: 2026-04-19
**Status**: Intentionally deferred

## State

`oh-my-codex-docs` currently shares the Upstash Redis instance
(`fitting-dassie-67293.upstash.io`) with `oh-my-claudecode-website`.
Both projects' `report-form` rate-limit counters live in the same
namespace.

## Rationale for not splitting now

- Traffic on both docs sites is low (sub-1k req/day expected).
- `@upstash/ratelimit` buckets by IP, so cross-project interference
  requires the same IP to hit both sites within the same window.
- Free-tier budget (10k req/day) has large headroom.
- Creating a separate DB via Upstash direct console (not Vercel
  Marketplace) is free and takes 2 minutes — easy to do later.

## When to split

Split off a dedicated `oh-my-codex-docs-kv` DB if any of these trigger:

- Rate-limit false positives reported by users.
- Upstash dashboard shows commands >5k/day combined.
- Debugging requires per-project request isolation.
- Vercel Marketplace lists Upstash Free tier again (currently paid-only
  via that path).

## Split procedure (when needed)

1. https://console.upstash.com/redis → Create Database (`oh-my-codex-docs-kv`,
   Regional, same region as current).
2. Copy `.env`-format block from the DB detail page.
3. Replace the 5 `KV_*` / `REDIS_URL` values in Vercel env for
   `oh-my-codex-docs` project (production/preview/development).
4. Update `.env.local` locally.
5. Empty commit + push to trigger redeploy.
6. Verify `report-form` submission against `devswha/oh-my-codex-docs`
   issues still works end-to-end.
