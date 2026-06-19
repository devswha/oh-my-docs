// Unit tests for the pure/deterministic helpers in check.mjs.
// Run: node --test scripts/docs-accuracy/check.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

import {
  slugify,
  makeSlugger,
  splitFrontmatter,
  extractClaims,
  checkVersionSync,
  checkLeakage,
  routeForDocFile,
  readVersionConst,
  toDirUrl,
  buildLocalRouteSet,
  runAllChecks,
  applyFixes,
  loadLinkChecker,
} from "./check.mjs";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const REAL_CHECKER = pathToFileURL(
  join(REPO_ROOT, "apps", "gajae-code", "scripts", "check-localized-doc-links.mjs"),
).href;

test("slugify mirrors github-slugger basics", () => {
  assert.equal(slugify("Hello, World!"), "hello-world");
  assert.equal(slugify("What it is"), "what-it-is");
  assert.equal(slugify("Pre-Execution Gate"), "pre-execution-gate");
  assert.equal(slugify("  Trim  Me  "), "trim-me");
});

test("makeSlugger dedupes repeated headings", () => {
  const slug = makeSlugger();
  assert.equal(slug("Setup"), "setup");
  assert.equal(slug("Setup"), "setup-1");
  assert.equal(slug("Setup"), "setup-2");
});

test("splitFrontmatter separates frontmatter and body", () => {
  const { frontmatter, body } = splitFrontmatter("---\ntitle: X\n---\n# Body\n");
  assert.match(frontmatter, /title: X/);
  assert.equal(body, "# Body\n");
  const none = splitFrontmatter("# No frontmatter\n");
  assert.equal(none.frontmatter, "");
  assert.equal(none.bodyOffset, 0);
});

test("extractClaims finds flag/command-shaped inline code only", () => {
  const claims = extractClaims("Use `--fake-flag` and `/realcmd` but not `someWord` or `npm run x`.");
  const tokens = claims.map((c) => c.token).sort();
  assert.deepEqual(tokens, ["--fake-flag", "/realcmd"]);
});

test("checkVersionSync: drift, no-upstream, and match", () => {
  const drift = checkVersionSync({ docVersion: "1.0.0", upstreamVersion: "2.0.0", versionFileRel: "v.ts" });
  assert.equal(drift.length, 1);
  assert.equal(drift[0].severity, "warn");
  assert.equal(drift[0].suggestion, "2.0.0");

  const noUpstream = checkVersionSync({ docVersion: "1.0.0", upstreamVersion: null, versionFileRel: "v.ts" });
  assert.equal(noUpstream.length, 1);
  assert.equal(noUpstream[0].severity, "info");

  const match = checkVersionSync({ docVersion: "1.0.0", upstreamVersion: "1.0.0", versionFileRel: "v.ts" });
  assert.equal(match.length, 0);
});

test("routeForDocFile maps locale + index conventions", () => {
  const docs = "/repo/content/docs";
  assert.equal(routeForDocFile("/repo/content/docs/index.mdx", docs), "/docs");
  assert.equal(routeForDocFile("/repo/content/docs/good.mdx", docs), "/docs/good");
  assert.equal(routeForDocFile("/repo/content/docs/good.ko.mdx", docs), "/ko/docs/good");
  assert.equal(routeForDocFile("/repo/content/docs/a/b.ja.mdx", docs), "/ja/docs/a/b");
});

test("checkLeakage scans prose but skips code spans", () => {
  const HERE = fileURLToPath(new URL("./", import.meta.url));
  const docsDir = toDirUrl(join(HERE, "__fixtures__", "sample-app", "content", "docs"));
  const rootDir = toDirUrl(join(HERE, "__fixtures__", "sample-app"));
  const findings = checkLeakage({ docsDir, rootDir, forbidden: ["lazycodex", "ultrawork"] });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].value.toLowerCase(), "lazycodex");
});

test("readVersionConst reads the fixture version", () => {
  const HERE = fileURLToPath(new URL("./", import.meta.url));
  const v = readVersionConst(join(HERE, "__fixtures__", "sample-app", "src", "lib", "version.ts"));
  assert.equal(v, "0.0.1");
});

test("engine routeForDocFile parity with the reused checker's buildDocRouteSet", async () => {
  const docsDir = toDirUrl(
    join(REPO_ROOT, "scripts", "docs-accuracy", "__fixtures__", "sample-app", "content", "docs"),
  );
  const mine = buildLocalRouteSet({ docsDir });
  const checker = await loadLinkChecker(
    join(REPO_ROOT, "scripts", "docs-accuracy", "__fixtures__", "sample-app"),
  );
  const theirs = checker.buildDocRouteSet({ docsDir });
  assert.deepEqual([...mine].sort(), [...theirs].sort(), "route conventions must match for anchor lookup");
});

test("applyFixes rewrites localized prefix (--fix) and unique-candidate route (--apply), idempotently", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "docs-accuracy-fix-"));
  try {
    const docs = join(tmp, "content", "docs");
    mkdirSync(join(docs, "guides"), { recursive: true });
    mkdirSync(join(tmp, "scripts"), { recursive: true });
    // reused checker via absolute re-export (works outside the repo tree)
    writeFileSync(join(tmp, "scripts", "check-localized-doc-links.mjs"), `export * from ${JSON.stringify(REAL_CHECKER)};\n`);
    // valid target page -> route /docs/guides/setup
    writeFileSync(join(docs, "guides", "setup.mdx"), "---\ntitle: Setup\n---\n\n# Setup\n");
    writeFileSync(join(docs, "guides", "setup.ko.mdx"), "---\ntitle: 설정\n---\n\n# 설정\n");
    // en page with a broken route link whose basename uniquely matches /docs/guides/setup
    writeFileSync(join(docs, "index.mdx"), "---\ntitle: Index\n---\n\n[go](/docs/setup)\n");
    // ko page linking /docs/... without the locale prefix
    writeFileSync(join(docs, "index.ko.mdx"), "---\ntitle: 인덱스\n---\n\n[가이드](/docs/guides/setup)\n");

    const docsDir = toDirUrl(docs);
    const rootDir = toDirUrl(tmp);
    const before = await runAllChecks({ appDir: tmp, docsDir, rootDir, forbidden: [] });
    assert.equal(before.checks.localizedPrefix.findings.length, 1, "⑥ violation present before fix");
    assert.ok(
      before.checks.brokenLinks.findings.some((f) => f.subkind === "route"),
      "⑤ broken route present before fix",
    );

    const fixed = applyFixes({
      checks: before.checks,
      rootDir,
      routeSet: before.routeSet,
      fix: true,
      apply: true,
    });
    assert.ok(fixed.applied.some((a) => a.check === "localizedPrefix"), "prefix fix applied");
    assert.ok(fixed.applied.some((a) => a.check === "brokenLinks"), "route fix applied");

    assert.match(readFileSync(join(docs, "index.ko.mdx"), "utf8"), /\(\/ko\/docs\/guides\/setup\)/);
    assert.match(readFileSync(join(docs, "index.mdx"), "utf8"), /\(\/docs\/guides\/setup\)/);

    const after = await runAllChecks({ appDir: tmp, docsDir, rootDir, forbidden: [] });
    assert.equal(after.checks.localizedPrefix.findings.length, 0, "⑥ resolved after fix");
    assert.equal(
      after.checks.brokenLinks.findings.filter((f) => f.subkind === "route").length,
      0,
      "⑤ route resolved after fix",
    );

    // idempotent: a second apply changes nothing
    const again = applyFixes({ checks: after.checks, rootDir, routeSet: after.routeSet, fix: true, apply: true });
    assert.equal(again.changedFiles.length, 0, "no further changes on rerun");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("applyFixes does NOT double-prefix an already-correct co-located link", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "docs-accuracy-dup-"));
  try {
    const docs = join(tmp, "content", "docs");
    mkdirSync(join(docs, "guides"), { recursive: true });
    mkdirSync(join(tmp, "scripts"), { recursive: true });
    writeFileSync(join(tmp, "scripts", "check-localized-doc-links.mjs"), `export * from ${JSON.stringify(REAL_CHECKER)};\n`);
    writeFileSync(join(docs, "guides", "setup.mdx"), "---\ntitle: Setup\n---\n\n# Setup\n");
    writeFileSync(join(docs, "guides", "setup.ko.mdx"), "---\ntitle: 설정\n---\n\n# 설정\n");
    // ko page: one WRONG (/docs/...) and one ALREADY-CORRECT (/ko/docs/...) link to the same target.
    writeFileSync(
      join(docs, "page.ko.mdx"),
      "---\ntitle: 페이지\n---\n\n[wrong](/docs/guides/setup) and [right](/ko/docs/guides/setup)\n",
    );

    const docsDir = toDirUrl(docs);
    const rootDir = toDirUrl(tmp);
    const before = await runAllChecks({ appDir: tmp, docsDir, rootDir, forbidden: [] });
    assert.equal(before.checks.localizedPrefix.findings.length, 1, "only the unprefixed link is flagged");

    applyFixes({ checks: before.checks, rootDir, routeSet: before.routeSet, fix: true, apply: false });
    const out = readFileSync(join(docs, "page.ko.mdx"), "utf8");
    assert.ok(!out.includes("/ko/ko/docs/"), "must not double-prefix");
    assert.equal((out.match(/\(\/ko\/docs\/guides\/setup\)/g) || []).length, 2, "both links now correctly prefixed");

    const after = await runAllChecks({ appDir: tmp, docsDir, rootDir, forbidden: [] });
    assert.equal(after.checks.localizedPrefix.findings.length, 0, "resolved, no new breakage");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("runAllChecks degrades gracefully when the app has no link checker (e.g. claudecode)", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "docs-accuracy-degraded-"));
  try {
    const docs = join(tmp, "content", "docs");
    mkdirSync(docs, { recursive: true });
    // NOTE: intentionally NO scripts/check-localized-doc-links.mjs
    writeFileSync(join(docs, "index.mdx"), "---\ntitle: Index\n---\n\n# Index\n\n[bad anchor](/docs#nope)\n");

    const docsDir = toDirUrl(docs);
    const rootDir = toDirUrl(tmp);
    const res = await runAllChecks({ appDir: tmp, docsDir, rootDir, forbidden: ["lazycodex"] });

    assert.ok(res.degraded, "degraded note set when checker missing");
    assert.equal(res.checks.localizedPrefix.skipped, "no app link checker");
    assert.equal(res.checks.brokenLinks.skipped, "routes (no app link checker)");
    // anchors still checked locally; checks 1-4 still run (no throw)
    assert.ok(res.checks.brokenLinks.findings.some((f) => f.subkind === "anchor"), "anchors still detected");
    assert.ok("leakage" in res.checks && "localeParity" in res.checks, "checks 1-4 ran");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("checkVersionSync distinguishes 'cache unavailable' from 'no version field'", () => {
  const noCache = checkVersionSync({ docVersion: "1.0.0", upstreamVersion: null, versionFileRel: "v.ts", upstreamAvailable: false });
  assert.equal(noCache.length, 1);
  assert.match(noCache[0].message, /cache unavailable/i);
  const noField = checkVersionSync({ docVersion: "1.0.0", upstreamVersion: null, versionFileRel: "v.ts", upstreamAvailable: true });
  assert.match(noField[0].message, /no version field/i);
});
