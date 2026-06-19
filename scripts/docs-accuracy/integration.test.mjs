// Integration test: run the full 6-check engine against the seeded fixture mini-app and assert
// that every check detects its planted error exactly. Real apps/* is never touched (read-only).
//
// Run: node --test scripts/docs-accuracy/integration.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import { runAllChecks, toDirUrl, readVersionConst } from "./check.mjs";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const APP_DIR = join(HERE, "__fixtures__", "sample-app");
const DOCS_DIR = join(APP_DIR, "content", "docs");
const SNAPSHOT = join(HERE, "__fixtures__", "upstream-snapshot");

function loadResult() {
  const upstreamVersion = JSON.parse(readFileSync(join(SNAPSHOT, "package.json"), "utf8")).version;
  const upstreamTerms = new Set(JSON.parse(readFileSync(join(SNAPSHOT, "known-terms.json"), "utf8")));
  const docVersion = readVersionConst(join(APP_DIR, "src", "lib", "version.ts"));
  return runAllChecks({
    appDir: APP_DIR,
    docsDir: toDirUrl(DOCS_DIR),
    rootDir: toDirUrl(APP_DIR),
    forbidden: ["lazycodex", "ultrawork"],
    docVersion,
    upstreamVersion,
    upstreamTerms,
  });
}

test("fixture is isolated: docs dir lives under __fixtures__, not apps/", () => {
  assert.ok(DOCS_DIR.includes("__fixtures__"), "fixture must be under __fixtures__");
  assert.ok(!DOCS_DIR.includes(`${join("/apps")}/`), "must not point at a real app");
});

test("all 6 checks detect their seeded error (100% fixture detection)", async () => {
  const { checks, summary } = await loadResult();
  const count = (k) => checks[k].findings.length;

  assert.equal(count("upstreamExistence"), 1, "①: --fake-flag absent from upstream index");
  assert.equal(count("leakage"), 1, "②: lazycodex leakage in prose");
  assert.equal(count("versionSync"), 1, "③: version drift 0.0.1 != 9.9.9");
  assert.equal(count("localeParity"), 2, "④: missing good.ja + meta.ja page-list drift");
  assert.equal(count("brokenLinks"), 2, "⑤: 1 broken route + 1 broken anchor");
  assert.equal(count("localizedPrefix"), 1, "⑥: ko page links /docs without prefix");
  assert.equal(summary.total, 8, "exactly 8 seeded findings");
});

test("findings carry the right evidence", async () => {
  const { checks } = await loadResult();

  assert.equal(checks.upstreamExistence.findings[0].value, "--fake-flag");
  assert.equal(checks.leakage.findings[0].value.toLowerCase(), "lazycodex");

  const ver = checks.versionSync.findings[0];
  assert.equal(ver.severity, "warn");
  assert.equal(ver.suggestion, "9.9.9");

  const subkinds = checks.brokenLinks.findings.map((f) => f.subkind).sort();
  assert.deepEqual(subkinds, ["anchor", "route"], "⑤ covers both route and anchor");

  const localeMsgs = checks.localeParity.findings.map((f) => f.message).join(" | ");
  assert.match(localeMsgs, /ja/, "④ flags a ja gap");
});

test("known-good tokens and routes produce no false positives", async () => {
  const { checks } = await loadResult();
  // --real-flag and /docs/good#real-heading are valid and must NOT be flagged.
  assert.ok(
    !checks.upstreamExistence.findings.some((f) => f.value === "--real-flag"),
    "valid --real-flag must not be flagged",
  );
  assert.ok(
    !checks.brokenLinks.findings.some((f) => String(f.value).includes("#real-heading")),
    "valid anchor must not be flagged",
  );
});
