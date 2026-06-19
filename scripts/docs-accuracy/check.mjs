#!/usr/bin/env node
// scripts/docs-accuracy/check.mjs
//
// Deterministic documentation-accuracy checker for the oh-my-docs monorepo.
// Drives the 6 accuracy checks that the `docs-accuracy-review` GJC skill orchestrates:
//
//   1 upstreamExistence  report  — doc-claimed tokens absent from the upstream source of truth
//   2 leakage            report  — another product's exclusive terms leaking into this app's docs
//   3 versionSync        report  — src/lib/version.ts vs upstream package.json (from cache snapshot)
//   4 localeParity       report  — en/ko/zh/ja page + meta.json page-list symmetry
//   5 brokenLinks        gated   — broken internal routes (reused) + broken heading anchors (new)
//   6 localizedPrefix    autofix — non-English docs linking /docs without a locale prefix (reused)
//
// Checks 5 and 6 reuse the target app's own `scripts/check-localized-doc-links.mjs` (dynamic
// import, {docsDir, rootDir}) so this tool and the build gate share one source of truth.
//
// Safety: dry-run by default (report only). `--fix` rewrites ONLY localized-link-prefix omissions
// (mechanical, check 6). `--apply` additionally rewrites broken internal routes that resolve to a
// single unambiguous candidate (check 5 routes). Broken anchors, factual mis-names, leakage,
// version drift, and locale-parity gaps are ALWAYS report-only, and pages are NEVER deleted —
// those remain human decisions.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const LOCALES = ["ko", "zh", "ja"]; // non-default; "en" is the unprefixed default

// --- Per-app upstream + leakage facts (human-facing mirror: skill references/apps.md) ----------
// forbidden = terms that belong to a DIFFERENT product and must not appear in this app's docs.
export const APP_FACTS = {
  codex: {
    repo: "Yeachan-Heo/oh-my-codex",
    ref: "main",
    versionConst: "OMX_VERSION",
    forbidden: ["ultragoal", "deep-interview", "ralplan", "gajae", "gjc", "lazycodex", "ultrawork"],
  },
  claudecode: {
    repo: "Yeachan-Heo/oh-my-claudecode",
    ref: "main",
    versionConst: "OMC_VERSION",
    forbidden: ["ultragoal", "deep-interview", "ralplan", "gajae", "gjc", "lazycodex", "ultrawork"],
  },
  openagent: {
    repo: "code-yeongyu/oh-my-openagent",
    ref: "dev",
    versionConst: "OMO_VERSION",
    forbidden: ["ultragoal", "deep-interview", "ralplan", "gajae", "gjc", "ultrawork"],
  },
  "gajae-code": {
    repo: "Yeachan-Heo/gajae-code",
    ref: "main",
    versionConst: "GC_VERSION",
    // gjc terms are native here; other products' exclusive terms are the leak risk.
    forbidden: ["lazycodex", "ultrawork", "$ulw-plan", "$start-work", "$ulw-loop"],
  },
  lzx: {
    repo: "code-yeongyu/lazycodex",
    ref: "main",
    versionConst: "LZX_VERSION",
    // lzx packages OmO; gjc-exclusive terms must not appear (ultragoal was removed from these docs).
    forbidden: ["ultragoal", "deep-interview", "ralplan", "gajae", "gjc"],
  },
};

// --- github-slugger-compatible heading slug -----------------------------------------------------
// Mirrors github-slugger semantics (lowercase, strip punctuation, spaces -> hyphens, dedupe with
// -1/-2). Anchor checks are detection-only and --apply is unique-candidate gated, so exact parity
// with Fumadocs' rehype-slug is not safety-critical, but we target the same algorithm.
const SLUG_STRIP = /[\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,./:;<=>?@[\]^`{|}~\u2018\u2019\u201C\u201D]/g;
export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(SLUG_STRIP, "")
    .replace(/\s+/g, "-");
}
export function makeSlugger() {
  const seen = new Map();
  return (text) => {
    let base = slugify(text);
    if (!seen.has(base)) {
      seen.set(base, 0);
      return base;
    }
    let n = seen.get(base) + 1;
    seen.set(base, n);
    let candidate = `${base}-${n}`;
    while (seen.has(candidate)) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    seen.set(candidate, 0);
    return candidate;
  };
}

// --- filesystem + MDX helpers -------------------------------------------------------------------
export function toDirUrl(p) { const s = String(p);
return pathToFileURL(s.endsWith("/") ? s : `${s}/`); }
export function dirUrlToPath(dirUrl) { return fileURLToPath(dirUrl); }
function walkFiles(dir, pattern, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, pattern, acc);
    else if (pattern.test(entry.name)) acc.push(full);
  }
  return acc;
}
export function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) if (text.charCodeAt(i) === 10) line += 1;
  return line;
}
// Strip frontmatter; return body. Also expose frontmatter raw if present.
export function splitFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { frontmatter: "", body: text, bodyOffset: 0 };
  return { frontmatter: m[1], body: text.slice(m[0].length), bodyOffset: m[0].length };
}
// Replace fenced + inline code spans with spaces (preserve offsets) so prose scans skip code.
function maskCode(body) {
  let out = body.replace(/```[\s\S]*?```/g, (s) => " ".repeat(s.length));
  out = out.replace(/`[^`\n]*`/g, (s) => " ".repeat(s.length));
  return out;
}
// File -> docs route (replicates the convention used by check-localized-doc-links.mjs).
export function routeForDocFile(filePath, docsPath) {
  const rel = relative(docsPath, filePath).split(/[\\/]/);
  const fileName = rel.pop();
  let locale = "en";
  let stem = fileName.replace(/\.mdx$/, "");
  for (const loc of LOCALES) {
    const suffix = `.${loc}.mdx`;
    if (fileName.endsWith(suffix)) {
      locale = loc;
      stem = fileName.slice(0, -suffix.length);
      break;
    }
  }
  if (stem !== "index") rel.push(stem);
  const path = `/docs${rel.length ? `/${rel.join("/")}` : ""}`;
  return locale === "en" ? path : `/${locale}${path}`;
}

// --- dynamic import of the app's link checker (single source of truth with the build gate) ------
export async function loadLinkChecker(appDir) {
  const checkerPath = join(appDir, "scripts", "check-localized-doc-links.mjs");
  if (!existsSync(checkerPath)) {
    throw new Error(
      `docs-accuracy: link checker not found at ${checkerPath}. ` +
        `Every docs app must ship scripts/check-localized-doc-links.mjs; cannot reuse the build gate without it.`,
    );
  }
  try {
    return await import(pathToFileURL(checkerPath).href);
  } catch (err) {
    throw new Error(`docs-accuracy: failed to import link checker at ${checkerPath}: ${err.message}`);
  }
}

// =================================================================================================
// Check 2 — cross-product leakage (deterministic forbidden-term scan; report-only)
// =================================================================================================
export function checkLeakage({ docsDir, rootDir, forbidden }) {
  const docsPath = dirUrlToPath(docsDir);
  const rootPath = dirUrlToPath(rootDir);
  const findings = [];
  if (!forbidden || forbidden.length === 0) return findings;
  const terms = forbidden.map((t) => ({
    term: t,
    // word-ish boundary; allow leading $ and internal - for command-like tokens
    regex: new RegExp(`(?<![\\w-])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`, "gi"),
  }));
  for (const file of walkFiles(docsPath, /\.mdx$/)) {
    if (!statSync(file).isFile()) continue;
    const raw = readFileSync(file, "utf8");
    const { body, bodyOffset } = splitFrontmatter(raw);
    const prose = maskCode(body);
    for (const { term, regex } of terms) {
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(prose)) !== null) {
        findings.push({
          check: "leakage",
          severity: "warn",
          file: relative(rootPath, file),
          line: lineAt(raw, bodyOffset + m.index),
          message: `Possible cross-product leakage: "${m[0]}" does not belong to this product`,
          value: m[0],
        });
      }
    }
  }
  return findings;
}

// =================================================================================================
// Check 3 — version sync (report-only; cache-based upstream version resolved by the caller)
// =================================================================================================
export function readVersionConst(versionTsPath, constName = null) {
  if (!existsSync(versionTsPath)) return null;
  const text = readFileSync(versionTsPath, "utf8");
  if (constName) {
    const named = new RegExp(`\\b${constName}\\b\\s*=\\s*["']([^"']+)["']`).exec(text);
    if (named) return named[1];
  }
  const m = /=\s*["']([^"']+)["']/.exec(text);
  return m ? m[1] : null;
}
export function checkVersionSync({ docVersion, upstreamVersion, versionFileRel, upstreamAvailable = true }) {
  const findings = [];
  if (!upstreamAvailable) {
    findings.push({
      check: "versionSync",
      severity: "info",
      file: versionFileRel,
      message: `Upstream cache unavailable; cannot verify version (doc "${docVersion ?? "?"}"). Refresh via the update-*-docs skill.`,
    });
    return findings;
  }
  if (upstreamVersion == null) {
    findings.push({
      check: "versionSync",
      severity: "info",
      file: versionFileRel,
      message: `Upstream exposes no version field; doc version "${docVersion ?? "?"}" uses the committed seed (no drift)`,
    });
    return findings;
  }
  if (docVersion == null) {
    findings.push({
      check: "versionSync",
      severity: "warn",
      file: versionFileRel,
      message: `Could not read documented version; upstream is "${upstreamVersion}"`,
    });
    return findings;
  }
  if (docVersion !== upstreamVersion) {
    findings.push({
      check: "versionSync",
      severity: "warn",
      file: versionFileRel,
      message: `Version drift: docs "${docVersion}" != upstream "${upstreamVersion}"`,
      value: docVersion,
      suggestion: upstreamVersion,
    });
  }
  return findings;
}

// =================================================================================================
// Check 4 — locale parity (report-only): every page in 4 locales + meta page-list symmetry
// =================================================================================================
export function checkLocaleParity({ docsDir, rootDir }) {
  const docsPath = dirUrlToPath(docsDir);
  const rootPath = dirUrlToPath(rootDir);
  const findings = [];

  // 4a. page parity: group mdx by (dir, stem); every group must have en + ko + zh + ja.
  const groups = new Map(); // key -> Set(locale)
  for (const file of walkFiles(docsPath, /\.mdx$/)) {
    if (!statSync(file).isFile()) continue;
    const rel = relative(docsPath, file);
    const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
    const name = basename(rel);
    let locale = "en";
    let stem = name.replace(/\.mdx$/, "");
    for (const loc of LOCALES) {
      if (name.endsWith(`.${loc}.mdx`)) {
        locale = loc;
        stem = name.slice(0, -`.${loc}.mdx`.length);
        break;
      }
    }
    const key = `${dir}/${stem}`;
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key).add(locale);
  }
  for (const [key, locs] of groups) {
    for (const want of ["en", ...LOCALES]) {
      if (!locs.has(want)) {
        findings.push({
          check: "localeParity",
          severity: "warn",
          file: key.replace(/^\//, ""),
          message: `Missing ${want} variant for page "${key.replace(/^\//, "")}" (have: ${[...locs].sort().join(",")})`,
        });
      }
    }
  }

  // 4b. meta page-list parity across locale metas.
  for (const metaFile of walkFiles(docsPath, /^meta\.json$/)) {
    const dir = metaFile.slice(0, metaFile.lastIndexOf("/"));
    const base = readMetaPages(metaFile);
    if (!base) continue;
    for (const loc of LOCALES) {
      const localeMeta = join(dir, `meta.${loc}.json`);
      if (!existsSync(localeMeta)) {
        findings.push({
          check: "localeParity",
          severity: "warn",
          file: relative(rootPath, localeMeta),
          message: `Missing locale meta meta.${loc}.json beside ${relative(rootPath, metaFile)}`,
        });
        continue;
      }
      const localePages = readMetaPages(localeMeta);
      const diff = symmetricDiff(base, localePages || []);
      if (diff.length) {
        findings.push({
          check: "localeParity",
          severity: "warn",
          file: relative(rootPath, localeMeta),
          message: `meta page-list differs from meta.json: ${diff.join(", ")}`,
        });
      }
    }
  }
  return findings;
}
function readMetaPages(metaPath) {
  try {
    const data = JSON.parse(readFileSync(metaPath, "utf8"));
    return Array.isArray(data.pages) ? data.pages : [];
  } catch {
    return null;
  }
}
function symmetricDiff(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  const out = [];
  for (const x of a) if (!sb.has(x)) out.push(`-${x}`);
  for (const x of b) if (!sa.has(x)) out.push(`+${x}`);
  return out;
}

// =================================================================================================
// Check 5 — broken internal routes (reused) + broken heading anchors (new). Gated autofix.
// =================================================================================================
export function buildAnchorIndex({ docsDir }) {
  const docsPath = dirUrlToPath(docsDir);
  const index = new Map(); // route -> Set(anchor)
  for (const file of walkFiles(docsPath, /\.mdx$/)) {
    if (!statSync(file).isFile()) continue;
    const route = routeForDocFile(file, docsPath);
    const { body } = splitFrontmatter(readFileSync(file, "utf8"));
    const slug = makeSlugger();
    const anchors = new Set();
    for (const m of body.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
      anchors.add(slug(m[1]));
    }
    index.set(route, anchors);
  }
  return index;
}
const ANCHOR_LINK = /\]\((\/(?:ko|ja|zh)\/docs[^)\s#]*#[^)\s]+|\/docs[^)\s#]*#[^)\s]+|#[^)\s]+)\)/g;
export function checkBrokenAnchors({ docsDir, rootDir, anchorIndex, routeSet }) {
  const docsPath = dirUrlToPath(docsDir);
  const rootPath = dirUrlToPath(rootDir);
  const findings = [];
  for (const file of walkFiles(docsPath, /\.mdx$/)) {
    if (!statSync(file).isFile()) continue;
    const raw = readFileSync(file, "utf8");
    const masked = maskCode(raw); // skip anchor links that live inside code fences/inline code
    const selfRoute = routeForDocFile(file, docsPath);
    ANCHOR_LINK.lastIndex = 0;
    let m;
    while ((m = ANCHOR_LINK.exec(masked)) !== null) {
      const link = m[1];
      const hashIdx = link.indexOf("#");
      const routePart = link.slice(0, hashIdx) || selfRoute;
      const anchor = link.slice(hashIdx + 1);
      if (routePart !== selfRoute && routeSet && !routeSet.has(routePart)) continue; // route handled by check 5a
      const anchors = anchorIndex.get(routePart);
      if (!anchors || !anchors.has(anchor)) {
        findings.push({
          check: "brokenLinks",
          severity: "warn",
          subkind: "anchor",
          file: relative(rootPath, file),
          line: lineAt(raw, m.index),
          message: `Broken anchor "#${anchor}" -> ${routePart} (no matching heading)`,
          value: link,
        });
      }
    }
  }
  return findings;
}

// =================================================================================================
// Check 1 — upstream existence (report-only): claimed feature tokens absent from the snapshot index
// =================================================================================================
const CLAIM_INLINE = /`([^`\n]+)`/g;
export function extractClaims(body) {
  const claims = [];
  let m;
  CLAIM_INLINE.lastIndex = 0;
  while ((m = CLAIM_INLINE.exec(body)) !== null) {
    const tok = m[1].trim();
    // Treat flags and "<binary> <subcommand>" / "/command" shapes as feature claims.
    if (/^--[\w-]+$/.test(tok) || /^\/[\w-]+$/.test(tok)) claims.push({ token: tok, index: m.index });
  }
  return claims;
}
export function checkUpstreamExistence({ docsDir, rootDir, upstreamTerms }) {
  const docsPath = dirUrlToPath(docsDir);
  const rootPath = dirUrlToPath(rootDir);
  const findings = [];
  if (!upstreamTerms) return findings; // no snapshot index -> skip (caller records "none")
  const known = upstreamTerms instanceof Set ? upstreamTerms : new Set(upstreamTerms);
  for (const file of walkFiles(docsPath, /\.mdx$/)) {
    if (!statSync(file).isFile()) continue;
    const raw = readFileSync(file, "utf8");
    const { body, bodyOffset } = splitFrontmatter(raw);
    for (const claim of extractClaims(body)) {
      if (!known.has(claim.token)) {
        findings.push({
          check: "upstreamExistence",
          severity: "warn",
          file: relative(rootPath, file),
          line: lineAt(raw, bodyOffset + claim.index),
          message: `Doc claims "${claim.token}" but it is absent from the upstream source of truth`,
          value: claim.token,
        });
      }
    }
  }
  return findings;
}

// =================================================================================================
// Orchestration
// =================================================================================================
export async function runAllChecks(opts) {
  const {
    docsDir,
    rootDir,
    forbidden = [],
    docVersion = null,
    upstreamVersion = null,
    versionFileRel = "src/lib/version.ts",
    upstreamTerms = null,
    upstreamSource = null,
    appDir = null,
  } = opts;

  const checks = {};
  // Checks 5 (routes) + 6 reuse the app's own check-localized-doc-links.mjs. Some apps (e.g.
  // claudecode) do not ship it; degrade gracefully (run checks 1-4 + anchors; skip routes + prefix).
  let routeSet = null;
  let checker = null;
  let degraded = null;
  if (appDir) {
    try {
      checker = await loadLinkChecker(appDir);
    } catch (err) {
      degraded = `app link checker unavailable (${err.message}); checks 5-routes and 6 skipped, anchors checked locally`;
    }
  }
  const anchorIndex = buildAnchorIndex({ docsDir });
  if (checker) {
    routeSet = checker.buildDocRouteSet({ docsDir });
    checks.localizedPrefix = {
      id: 6,
      autofix: "fix",
      findings: checker
        .findLocalizedDocLinkFailures({ docsDir, rootDir })
        .map((f) => ({ check: "localizedPrefix", severity: "warn", ...f })),
    };
    const routeFindings = checker
      .findMissingInternalDocRouteFailures({ docsDir, rootDir })
      .map((f) => ({ check: "brokenLinks", subkind: "route", severity: "warn", ...f }));
    const anchorFindings = checkBrokenAnchors({ docsDir, rootDir, anchorIndex, routeSet });
    checks.brokenLinks = { id: 5, autofix: "apply", findings: [...routeFindings, ...anchorFindings] };
  } else {
    routeSet = buildLocalRouteSet({ docsDir });
    const anchorFindings = checkBrokenAnchors({ docsDir, rootDir, anchorIndex, routeSet });
    checks.brokenLinks = {
      id: 5,
      autofix: "apply",
      skipped: appDir ? "routes (no app link checker)" : undefined,
      findings: anchorFindings,
    };
    checks.localizedPrefix = {
      id: 6,
      autofix: "fix",
      skipped: appDir ? "no app link checker" : "standalone",
      findings: [],
    };
  }
  const upstreamAvailable = upstreamSource ? upstreamSource !== "none" : true;
  checks.upstreamExistence = {
    id: 1,
    autofix: "none",
    skipped: upstreamTerms ? undefined : "no upstream snapshot index",
    findings: checkUpstreamExistence({ docsDir, rootDir, upstreamTerms }),
  };
  checks.leakage = { id: 2, autofix: "none", findings: checkLeakage({ docsDir, rootDir, forbidden }) };
  checks.versionSync = {
    id: 3,
    autofix: "none",
    findings: checkVersionSync({ docVersion, upstreamVersion, versionFileRel, upstreamAvailable }),
  };
  checks.localeParity = { id: 4, autofix: "none", findings: checkLocaleParity({ docsDir, rootDir }) };

  const byCheck = {};
  let total = 0;
  for (const [k, v] of Object.entries(checks)) {
    byCheck[k] = v.findings.length;
    total += v.findings.length;
  }
  return { checks, summary: { total, byCheck }, routeSet, degraded };
}
export function buildLocalRouteSet({ docsDir }) {
  const docsPath = dirUrlToPath(docsDir);
  const routes = new Set(["/docs", "/ko/docs", "/ja/docs", "/zh/docs"]);
  for (const file of walkFiles(docsPath, /\.mdx$/)) {
    if (!statSync(file).isFile()) continue;
    routes.add(routeForDocFile(file, docsPath));
  }
  return routes;
}

// =================================================================================================
// Safe autofix application (--fix / --apply). Writes files in place; NEVER deletes pages.
// =================================================================================================
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function localeOfFile(fileRel) {
  for (const loc of LOCALES) if (fileRel.endsWith(`.${loc}.mdx`)) return loc;
  return "en";
}
function localeOfRoute(route) {
  for (const loc of LOCALES) if (route.startsWith(`/${loc}/`)) return loc;
  return "en";
}
function lastSegment(route) {
  return route.split("#")[0].split("?")[0].split("/").filter(Boolean).pop();
}
export function applyFixes({ checks, rootDir, routeSet, fix, apply }) {
  const rootPath = dirUrlToPath(rootDir);
  const applied = [];
  const skipped = [];
  const edits = new Map(); // absFile -> [{from,to}]
  const queue = (absFile, from, to) => {
    if (!edits.has(absFile)) edits.set(absFile, []);
    edits.get(absFile).push({ from, to });
  };

  // Check 6 — localized-link prefix (mechanical): run under --fix or --apply.
  if (fix || apply) {
    for (const f of checks.localizedPrefix.findings) {
      const loc = localeOfFile(f.file);
      if (loc === "en") {
        skipped.push({ ...f, reason: "not a locale file" });
        continue;
      }
      const to = f.value.replace(/^\/docs/, `/${loc}/docs`);
      if (to === f.value) {
        skipped.push({ ...f, reason: "no prefix change" });
        continue;
      }
      queue(join(rootPath, f.file), f.value, to);
      applied.push({ check: "localizedPrefix", file: f.file, from: f.value, to });
    }
  }

  // Check 5 routes — unique-candidate only: run under --apply.
  if (apply && routeSet) {
    const routes = [...routeSet];
    for (const f of checks.brokenLinks.findings.filter((x) => x.subkind === "route")) {
      const loc = localeOfRoute(f.value);
      const seg = lastSegment(f.value);
      const base = f.value.split("#")[0].split("?")[0];
      const cands = routes.filter((r) => localeOfRoute(r) === loc && lastSegment(r) === seg);
      if (cands.length === 1 && cands[0] !== base) {
        queue(join(rootPath, f.file), base, cands[0]);
        applied.push({ check: "brokenLinks", subkind: "route", file: f.file, from: base, to: cands[0] });
      } else {
        skipped.push({ ...f, reason: cands.length === 0 ? "no candidate route" : "ambiguous candidate" });
      }
    }
  }

  // Anchors, factual mis-names, leakage, version, locale-parity, page deletion -> never auto-applied.
  const changed = new Set();
  for (const [absFile, list] of edits) {
    let content = readFileSync(absFile, "utf8");
    for (const { from, to } of list) {
      // left boundary (lookbehind) prevents double-prefixing an already-correct /loc/docs/X that
      // contains `from` as a substring; right boundary (lookahead) bounds it to a link target.
      const re = new RegExp(`(?<![\\w/-])${escapeRegExp(from)}(?=[)"'\\s#?\\]])`, "g");
      content = content.replace(re, to);
    }
    writeFileSync(absFile, content);
    changed.add(relative(rootPath, absFile));
  }
  return { applied, skipped, changedFiles: [...changed] };
}

// =================================================================================================
// Upstream snapshot resolution (cache-based; no live network fetch) + version
// =================================================================================================
export function resolveSnapshotDir(repo) {
  // cache-first: .omx/cache/upstream/<repo-leaf>
  const leaf = repo.split("/").pop();
  const cacheDir = join(REPO_ROOT, ".omx", "cache", "upstream", leaf);
  if (existsSync(cacheDir)) return { dir: cacheDir, source: "cache" };
  return { dir: null, source: "none" };
}
export function readUpstreamVersionFromSnapshot(snapshotDir) {
  if (!snapshotDir) return null;
  const pkg = join(snapshotDir, "package.json");
  if (!existsSync(pkg)) return null;
  try {
    const data = JSON.parse(readFileSync(pkg, "utf8"));
    return typeof data.version === "string" ? data.version : null;
  } catch {
    return null;
  }
}
// Build a conservative known-term index from the upstream snapshot: every --flag / /command token
// that appears anywhere in the snapshot is "known". Doc claims absent from this set are flagged.
// Conservative by design (low false positives); report-only per the approved plan.
export function buildUpstreamTermIndex(snapshotDir, { maxDepth = 2, maxFiles = 300 } = {}) {
  if (!snapshotDir || !existsSync(snapshotDir)) return null;
  const exts = /\.(md|mdx|json|ts|js|mjs|cjs|toml|ya?ml|txt)$/i;
  const files = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth || files.length >= maxFiles) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (files.length >= maxFiles) break;
      if (e.name === "node_modules" || e.name === ".git") continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full, depth + 1);
      else if (exts.test(e.name)) files.push(full);
    }
  };
  walk(snapshotDir, 0);
  const terms = new Set();
  for (const f of files) {
    let text;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    for (const m of text.matchAll(/--[\w-]+/g)) terms.add(m[0]);
    for (const m of text.matchAll(/(?<![\w/])\/[\w-]+/g)) terms.add(m[0]);
  }
  return terms.size ? terms : null;
}

// =================================================================================================
// CLI
// =================================================================================================
function parseArgs(argv) {
  const out = { fix: false, apply: false, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--app") out.app = argv[++i];
    else if (a === "--dir") out.dir = argv[++i];
    else if (a === "--root-dir") out.rootDir = argv[++i];
    else if (a === "--fix") out.fix = true;
    else if (a === "--apply") out.apply = true;

    else if (a === "--json") out.json = true;
  }
  return out;
}

async function cli(argv) {
  const args = parseArgs(argv);
  let docsDir;
  let rootDir;
  let appDir = null;
  let forbidden = [];
  let docVersion = null;
  let upstreamVersion = null;
  let upstreamTerms = null;
  let upstreamSource = "none";

  if (args.app) {
    const facts = APP_FACTS[args.app];
    if (!facts) {
      console.error(`docs-accuracy: unknown app "${args.app}". Known: ${Object.keys(APP_FACTS).join(", ")}`);
      return 2;
    }
    appDir = join(REPO_ROOT, "apps", args.app);
    if (!existsSync(appDir)) {
      console.error(`docs-accuracy: app dir not found: ${appDir}`);
      return 2;
    }
    docsDir = toDirUrl(join(appDir, "content", "docs"));
    rootDir = toDirUrl(appDir);
    forbidden = facts.forbidden;
    docVersion = readVersionConst(join(appDir, "src", "lib", "version.ts"), facts.versionConst);
    const snap = resolveSnapshotDir(facts.repo);
    upstreamSource = snap.source;
    upstreamVersion = readUpstreamVersionFromSnapshot(snap.dir);
    upstreamTerms = buildUpstreamTermIndex(snap.dir);
  } else if (args.dir) {
    if (!args.rootDir) {
      console.error("docs-accuracy: --dir requires --root-dir (both must be provided together).");
      return 2;
    }
    docsDir = toDirUrl(args.dir);
    rootDir = toDirUrl(args.rootDir);
  } else {
    console.error("docs-accuracy: provide --app <name> OR (--dir <docsDir> --root-dir <rootDir>).");
    return 2;
  }

  const result = await runAllChecks({
    docsDir,
    rootDir,
    appDir,
    forbidden,
    docVersion,
    upstreamVersion,
    upstreamTerms,
    upstreamSource,
  });

  let fixResult = null;
  let residual = result;
  if (args.fix || args.apply) {
    fixResult = applyFixes({
      checks: result.checks,
      rootDir,
      routeSet: result.routeSet,
      fix: args.fix,
      apply: args.apply,
    });
    if (fixResult.changedFiles.length > 0) {
      residual = await runAllChecks({
        docsDir,
        rootDir,
        appDir,
        forbidden,
        docVersion,
        upstreamVersion,
        upstreamTerms,
        upstreamSource,
      });
    }
  }

  const { routeSet: _routeSet, ...residualReport } = residual;
  const report = {
    app: args.app ?? null,
    docsDir: dirUrlToPath(docsDir),
    rootDir: dirUrlToPath(rootDir),
    upstream: { source: upstreamSource },
    mode: { fix: args.fix, apply: args.apply, dryRun: !(args.fix || args.apply) },
    ...residualReport,
    fixes: fixResult,
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report);
  }
  // exit non-zero when actionable findings remain (warn-level), zero when only info/none.
  const actionable = Object.values(residual.checks).some((c) =>
    c.findings.some((f) => f.severity === "warn"),
  );
  return actionable ? 1 : 0;
}

function printHuman(report) {
  console.log(`docs-accuracy: app=${report.app ?? "(dir)"} upstream=${report.upstream.source} mode=${report.mode.dryRun ? "dry-run" : report.mode.apply ? "apply" : "fix"}`);
  if (report.degraded) console.log(`  ⚠ degraded: ${report.degraded}`);
  for (const [name, c] of Object.entries(report.checks)) {
    const head = `  [${c.id}] ${name}: ${c.findings.length} finding(s)${c.skipped ? ` (skipped: ${c.skipped})` : ""}`;
    console.log(head);
    for (const f of c.findings.slice(0, 50)) {
      const loc = f.line ? `${f.file}:${f.line}` : f.file;
      console.log(`      - (${f.severity}) ${loc} ${f.message}`);
    }
  }
  if (report.fixes) {
    console.log(
      `  fixes: applied ${report.fixes.applied.length}, skipped ${report.fixes.skipped.length}, files changed ${report.fixes.changedFiles.length}`,
    );
    for (const a of report.fixes.applied.slice(0, 50)) {
      console.log(`      ~ ${a.check}${a.subkind ? `/${a.subkind}` : ""} ${a.file}: ${a.from} -> ${a.to}`);
    }
  }
  console.log(`  total (residual): ${report.summary.total}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  cli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
