// Adversarial / red-team tests for check.mjs robustness.
// Pure node:test + node:assert. Temp trees live under os.tmpdir() and are cleaned up.
// Real apps/* is NEVER touched.
// Run: node --test scripts/docs-accuracy/redteam.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  slugify,
  splitFrontmatter,
  extractClaims,
  checkVersionSync,
  checkLeakage,
  checkBrokenAnchors,
  buildAnchorIndex,
  loadLinkChecker,
  runAllChecks,
  toDirUrl,
} from "./check.mjs";

// Create an isolated temp app: <tmp>/content/docs with the given { relPath: contents } files.
// Returns { root, docsDir, rootDir, cleanup }.
function makeTmpDocs(files) {
  const root = mkdtempSync(join(tmpdir(), "docs-accuracy-redteam-"));
  const docsPath = join(root, "content", "docs");
  mkdirSync(docsPath, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = join(docsPath, rel);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, content, "utf8");
  }
  return {
    root,
    docsPath,
    docsDir: toDirUrl(docsPath),
    rootDir: toDirUrl(root),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

test("1. empty docsDir (no .mdx), standalone runAllChecks → no crash, doc findings 0", async () => {
  const t = makeTmpDocs({}); // no files at all
  try {
    // matching versions isolate the assertion to doc-derived findings (versionSync emits an
    // informational finding only when upstream is null — that is intentional, not a doc finding).
    const { summary } = await runAllChecks({
      docsDir: t.docsDir,
      rootDir: t.rootDir,
      docVersion: "1.0.0",
      upstreamVersion: "1.0.0",
    });
    assert.equal(summary.total, 0, "empty docs tree must yield zero findings");
    for (const [k, n] of Object.entries(summary.byCheck)) {
      assert.equal(n, 0, `${k} must be 0 for an empty docs tree`);
    }
  } finally {
    t.cleanup();
  }
});

test("2. .mdx without frontmatter → bodyOffset 0 and checks do not crash", async () => {
  const body = "# Just a body\n\nNo frontmatter here.\n";
  const sf = splitFrontmatter(body);
  assert.equal(sf.bodyOffset, 0);
  assert.equal(sf.frontmatter, "");
  assert.equal(sf.body, body);

  const t = makeTmpDocs({ "plain.mdx": body });
  try {
    const { summary } = await runAllChecks({
      docsDir: t.docsDir,
      rootDir: t.rootDir,
      docVersion: "1.0.0",
      upstreamVersion: "1.0.0",
    });
    assert.equal(typeof summary.total, "number");
  } finally {
    t.cleanup();
  }
});

test("3. duplicate '## Setup' headings → anchor index has setup AND setup-1", () => {
  const t = makeTmpDocs({ "dup.mdx": "# Title\n\n## Setup\n\na\n\n## Setup\n\nb\n" });
  try {
    const idx = buildAnchorIndex({ docsDir: t.docsDir });
    const anchors = idx.get("/docs/dup");
    assert.ok(anchors, "route /docs/dup must be indexed");
    assert.ok(anchors.has("setup"), "first Setup → setup");
    assert.ok(anchors.has("setup-1"), "second Setup → setup-1");
  } finally {
    t.cleanup();
  }
});

test("4. unicode/CJK heading slugify is stable, deterministic, no crash", () => {
  const a = slugify("설정 Guide!");
  const b = slugify("설정 Guide!");
  assert.equal(a, b, "slugify must be deterministic");
  assert.equal(a, "설정-guide", "CJK kept, punctuation stripped, spaces hyphenated, lowercased");
  // does not throw on emoji / combining / empty
  assert.doesNotThrow(() => slugify("🚀 Ünïçödé — Test"));
  assert.equal(slugify(""), "");
});

test("5. query+anchor link ](/docs/x?a=1#sec) → parsed anchor 'sec', no crash", () => {
  const t = makeTmpDocs({ "q.mdx": "See [link](/docs/x?a=1#sec) here.\n" });
  try {
    // Route set + index include the query-bearing route so the link is not skipped as 5a's job.
    const routeSet = new Set(["/docs/q", "/docs/x?a=1"]);
    const anchorIndex = new Map([["/docs/x?a=1", new Set(["other"])]]);
    let findings;
    assert.doesNotThrow(() => {
      findings = checkBrokenAnchors({ docsDir: t.docsDir, rootDir: t.rootDir, anchorIndex, routeSet });
    });
    assert.equal(findings.length, 1, "anchor sec is missing → exactly one finding");
    assert.match(findings[0].message, /#sec/, "anchor parsed as 'sec'");
    assert.equal(findings[0].value, "/docs/x?a=1#sec");
  } finally {
    t.cleanup();
  }
});

test("6. forbidden term in code fence / inline code is NOT flagged; in prose IS flagged", () => {
  const fenced = makeTmpDocs({
    "code.mdx": "```\nlazycodex inside a fence\n```\n\nAlso `lazycodex` inline.\n",
  });
  try {
    const findings = checkLeakage({ docsDir: fenced.docsDir, rootDir: fenced.rootDir, forbidden: ["lazycodex"] });
    assert.equal(findings.length, 0, "code-span occurrences must be masked out");
  } finally {
    fenced.cleanup();
  }

  const prose = makeTmpDocs({ "prose.mdx": "This mentions lazycodex in plain prose.\n" });
  try {
    const findings = checkLeakage({ docsDir: prose.docsDir, rootDir: prose.rootDir, forbidden: ["lazycodex"] });
    assert.equal(findings.length, 1, "prose occurrence must be flagged");
    assert.equal(findings[0].value.toLowerCase(), "lazycodex");
  } finally {
    prose.cleanup();
  }
});

test("7. forbidden term as substring of a longer token is NOT flagged (word boundary)", () => {
  const t = makeTmpDocs({ "b.mdx": "The gjcfoo widget and gjc-bar are unrelated tokens.\n" });
  try {
    const findings = checkLeakage({ docsDir: t.docsDir, rootDir: t.rootDir, forbidden: ["gjc"] });
    assert.equal(findings.length, 0, "gjcfoo / gjc-bar must not match bare 'gjc'");
  } finally {
    t.cleanup();
  }

  // sanity: a standalone occurrence still matches.
  const standalone = makeTmpDocs({ "c.mdx": "The gjc product is separate.\n" });
  try {
    const findings = checkLeakage({ docsDir: standalone.docsDir, rootDir: standalone.rootDir, forbidden: ["gjc"] });
    assert.equal(findings.length, 1, "standalone 'gjc' must match");
  } finally {
    standalone.cleanup();
  }
});

test("8. loadLinkChecker(nonexistent appDir) throws a clear Error containing the path", async () => {
  const t = makeTmpDocs({});
  try {
    await assert.rejects(
      () => loadLinkChecker(t.root),
      (err) => {
        assert.ok(err instanceof Error, "must be an Error");
        assert.match(err.message, /link checker not found/);
        assert.ok(err.message.includes(t.root), "message must include the offending path");
        return true;
      },
    );
  } finally {
    t.cleanup();
  }
});

test("9. checkVersionSync boundaries: null/null, equal, differing", () => {
  const bothNull = checkVersionSync({ docVersion: null, upstreamVersion: null, versionFileRel: "v.ts" });
  assert.equal(bothNull.length, 1, "no upstream → single info finding");
  assert.equal(bothNull[0].severity, "info");

  const equal = checkVersionSync({ docVersion: "3.1.4", upstreamVersion: "3.1.4", versionFileRel: "v.ts" });
  assert.equal(equal.length, 0, "matching versions → no finding");

  const differ = checkVersionSync({ docVersion: "1.0.0", upstreamVersion: "2.0.0", versionFileRel: "v.ts" });
  assert.equal(differ.length, 1, "drift → single warn finding");
  assert.equal(differ[0].severity, "warn");
  assert.equal(differ[0].suggestion, "2.0.0");

  const docNull = checkVersionSync({ docVersion: null, upstreamVersion: "2.0.0", versionFileRel: "v.ts" });
  assert.equal(docNull.length, 1, "missing doc version against known upstream → warn");
  assert.equal(docNull[0].severity, "warn");
});

test("10. extractClaims ignores ordinary words and multi-token commands", () => {
  const claims = extractClaims(
    "Run `npm run x` and read `Word` or `some text`, but `--real-flag` and `/cmd` are claims.",
  );
  const tokens = claims.map((c) => c.token).sort();
  assert.deepEqual(tokens, ["--real-flag", "/cmd"]);
});
