// Guards that the docs-accuracy-review SKILL.md / references/apps.md stay consistent with the
// engine's APP_FACTS, and that the skill is loadable by GJC's discovery.
// Run: node --test scripts/docs-accuracy/skill-consistency.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import { APP_FACTS } from "./check.mjs";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SKILL_DIR = join(REPO_ROOT, ".gjc", "skills", "docs-accuracy-review");
const SKILL_MD = join(SKILL_DIR, "SKILL.md");
const APPS_MD = join(SKILL_DIR, "references", "apps.md");

test("SKILL.md exists with valid frontmatter name/description", () => {
  assert.ok(existsSync(SKILL_MD), "SKILL.md present at the discovery path");
  const text = readFileSync(SKILL_MD, "utf8");
  const fm = /^---\n([\s\S]*?)\n---/.exec(text);
  assert.ok(fm, "frontmatter block present");
  assert.match(fm[1], /name:\s*docs-accuracy-review/, "name is docs-accuracy-review");
  assert.match(fm[1], /description:\s*\S/, "description is non-empty");
});

test("references/apps.md mirrors APP_FACTS (repo, branch, versionConst, forbidden)", () => {
  assert.ok(existsSync(APPS_MD), "apps.md present");
  const md = readFileSync(APPS_MD, "utf8");
  for (const [app, facts] of Object.entries(APP_FACTS)) {
    assert.ok(md.includes(facts.repo), `apps.md must document upstream repo ${facts.repo} for ${app}`);
    assert.ok(md.includes(facts.versionConst), `apps.md must document version const ${facts.versionConst} for ${app}`);
    for (const term of facts.forbidden) {
      assert.ok(md.includes(term), `apps.md must list forbidden term "${term}" for ${app}`);
    }
  }
});

test("SKILL.md documents the safety invariants the engine enforces", () => {
  const text = readFileSync(SKILL_MD, "utf8");
  // never auto-delete pages; dry-run default; CJK punctuation untouched; reuse not reimplement.
  assert.match(text, /[Nn]ever delete a page automatically|페이지를 자동/);
  assert.match(text, /dry-run/i);
  assert.match(text, /CJK/);
  assert.match(text, /check-localized-doc-links\.mjs/);
});

test("documented per-app checker availability matches the filesystem (degraded set)", () => {
  const apps = ["codex", "claudecode", "openagent", "gajae-code", "lzx"];
  const has = (a) => existsSync(join(REPO_ROOT, "apps", a, "scripts", "check-localized-doc-links.mjs"));
  // claudecode is the documented degraded app; the other four ship the checker.
  assert.equal(has("claudecode"), false, "claudecode must lack the checker (documented degraded)");
  for (const a of apps.filter((x) => x !== "claudecode")) {
    assert.equal(has(a), true, `${a} must ship scripts/check-localized-doc-links.mjs`);
  }
  const skill = readFileSync(SKILL_MD, "utf8");
  assert.match(skill, /claudecode/i, "SKILL.md must document the claudecode degraded case");
  assert.match(skill, /degraded/i, "SKILL.md must describe degraded mode");
});
