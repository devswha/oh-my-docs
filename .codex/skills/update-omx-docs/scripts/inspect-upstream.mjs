#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const json = args.includes('--json');
const noFetch = args.includes('--no-fetch');

function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

function run(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function runMaybe(command, commandArgs, options = {}) {
  try {
    return run(command, commandArgs, options);
  } catch {
    return null;
  }
}

function findRepoRoot() {
  const root = runMaybe('git', ['rev-parse', '--show-toplevel']);
  if (root) return root;
  return process.cwd();
}

function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) stack.push(path);
      else out.push(path);
    }
  }
  return out.sort();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readTextIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function parseSupportedLocales(appRoot) {
  const source = readTextIfExists(join(appRoot, 'src/lib/i18n.ts'));
  const match = source.match(/languages:\s*\[([^\]]+)\]/s);
  if (!match) return ['en', 'ko', 'zh', 'ja'];
  const locales = [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
  return locales.length ? locales : ['en', 'ko', 'zh', 'ja'];
}

function localeForMdx(path) {
  const name = path.split('/').pop();
  const match = name.match(/\.([a-z]{2})\.mdx$/);
  return match ? match[1] : 'en';
}

function baseForLocalePath(path) {
  return path.replace(/\.[a-z]{2}\.mdx$/, '.mdx');
}

function countSkillDirs(skillsDir) {
  if (!existsSync(skillsDir)) return 0;
  return readdirSync(skillsDir)
    .map((name) => join(skillsDir, name, 'SKILL.md'))
    .filter((path) => existsSync(path)).length;
}

function pageList(path) {
  if (!existsSync(path)) return null;
  try {
    const json = readJson(path);
    return Array.isArray(json.pages) ? json.pages : null;
  } catch {
    return null;
  }
}

function metaEntryKey(entry) {
  const link = String(entry).match(/\[[^\]]+\]\(([^)]+)\)/);
  if (!link) return { kind: 'page', key: String(entry) };
  const href = link[1].replace(/^\/(ko|ja|zh|en)(?=\/docs)/, '');
  const [pathOnly] = href.split('#');
  return { kind: 'link', key: pathOnly };
}

function compareMetaPages(basePages, siblingPages) {
  const baseKeys = basePages.map(metaEntryKey);
  const siblingKeys = siblingPages.map(metaEntryKey);
  const allLinks = [...baseKeys, ...siblingKeys].every((item) => item.kind === 'link');

  // In-page TOC entries are localized and may use translated anchors, so labels and
  // fragments are intentionally ignored. For these, count + destination page path
  // are the stable structural checks.
  if (allLinks) {
    const baseDestinations = [...new Set(baseKeys.map((item) => item.key))].sort();
    const siblingDestinations = [...new Set(siblingKeys.map((item) => item.key))].sort();
    const missingDestinations = baseDestinations.filter((item) => !siblingDestinations.includes(item));
    const extraDestinations = siblingDestinations.filter((item) => !baseDestinations.includes(item));
    if (basePages.length !== siblingPages.length || missingDestinations.length || extraDestinations.length) {
      return {
        issue: 'localized-link-structure-drift',
        baseCount: basePages.length,
        siblingCount: siblingPages.length,
        missingDestinations,
        extraDestinations,
      };
    }
    return null;
  }

  const base = baseKeys.map((item) => item.key);
  const sibling = siblingKeys.map((item) => item.key);
  const missing = base.filter((page) => !sibling.includes(page));
  const extra = sibling.filter((page) => !base.includes(page));
  return missing.length || extra.length ? { missing, extra } : null;
}

const root = findRepoRoot();
const appPath = argValue('--app', 'apps/codex');
const appRoot = resolve(root, appPath);
const upstreamUrl = argValue('--upstream', 'https://github.com/Yeachan-Heo/oh-my-codex.git');
const branch = argValue('--branch', 'main');
const cachePath = argValue('--cache', '.omx/cache/upstream/oh-my-codex');
const upstreamRoot = resolve(root, cachePath);

// Containment guard: refuse to perform destructive git ops outside the
// .omx/cache/ tree, since this script does `git reset --hard` + `clean -fd`.
// Canonicalize through realpathSync so symlinks inside .omx/cache that point
// elsewhere can't slip the destructive ops onto a sibling tree. The cache
// dir itself may not exist yet, so walk up to the nearest existing parent.
function canonicalizeWithinExisting(target) {
  let current = target;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return realpathSync(current);
}
const cacheRootAllowed = resolve(root, '.omx/cache');
mkdirSync(cacheRootAllowed, { recursive: true });
const cacheRootAllowedReal = realpathSync(cacheRootAllowed);
const upstreamRootReal = canonicalizeWithinExisting(upstreamRoot);
if (
  upstreamRootReal !== cacheRootAllowedReal &&
  !upstreamRootReal.startsWith(`${cacheRootAllowedReal}/`)
) {
  console.error(
    `[inspect-upstream] Refusing to operate on --cache outside .omx/cache/: ${upstreamRoot} (real: ${upstreamRootReal})`,
  );
  process.exit(1);
}

if (!existsSync(appRoot)) {
  console.error(`[inspect-upstream] Missing app root: ${appRoot}`);
  process.exit(1);
}

if (!noFetch) {
  if (!existsSync(join(upstreamRoot, '.git'))) {
    mkdirSync(dirname(upstreamRoot), { recursive: true });
    execFileSync('git', ['clone', '--depth=1', '--branch', branch, upstreamUrl, upstreamRoot], {
      stdio: json ? 'ignore' : 'inherit',
    });
  } else {
    run('git', ['fetch', '--depth=1', 'origin', branch], { cwd: upstreamRoot });
    run('git', ['reset', '--hard', `origin/${branch}`], { cwd: upstreamRoot });
    run('git', ['clean', '-fd'], { cwd: upstreamRoot });
  }
}

if (!existsSync(join(upstreamRoot, '.git'))) {
  console.error(`[inspect-upstream] Missing upstream clone: ${upstreamRoot}`);
  console.error('[inspect-upstream] Run without --no-fetch first, or pass --cache to an existing clone.');
  process.exit(1);
}

const upstreamHead = run('git', ['rev-parse', 'HEAD'], { cwd: upstreamRoot });
const upstreamHeadShort = run('git', ['rev-parse', '--short', 'HEAD'], { cwd: upstreamRoot });
const upstreamPackagePath = join(upstreamRoot, 'package.json');
const upstreamVersion = existsSync(upstreamPackagePath) ? readJson(upstreamPackagePath).version ?? null : null;
const siteVersionText = readTextIfExists(join(appRoot, 'src/lib/version.ts'));
const siteVersion = siteVersionText.match(/OMX_VERSION\s*=\s*["']([^"']+)["']/)?.[1] ?? null;
const locales = parseSupportedLocales(appRoot);

let diffBase = null;
let changedFiles = [];
if (siteVersion) {
  const candidates = [`v${siteVersion}`, siteVersion];
  for (const candidate of candidates) {
    if (!runMaybe('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${candidate}`], { cwd: upstreamRoot })) {
      runMaybe('git', ['fetch', '--depth=1', 'origin', `refs/tags/${candidate}:refs/tags/${candidate}`], { cwd: upstreamRoot });
    }
    if (runMaybe('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${candidate}`], { cwd: upstreamRoot })) {
      diffBase = candidate;
      break;
    }
  }
}

if (diffBase) {
  const diff = runMaybe(
    'git',
    [
      'diff',
      '--name-only',
      `${diffBase}..HEAD`,
      '--',
      'README.md',
      'README.*.md',
      'CHANGELOG.md',
      'package.json',
      'docs',
      'prompts',
      'skills',
      'src',
    ],
    { cwd: upstreamRoot },
  );
  changedFiles = diff ? diff.split('\n').filter(Boolean) : [];
} else {
  const files = runMaybe('git', ['ls-files', 'README.md', 'README.*.md', 'CHANGELOG.md', 'package.json', 'docs', 'prompts', 'skills'], { cwd: upstreamRoot });
  changedFiles = files ? files.split('\n').filter(Boolean) : [];
}

const promptFiles = walkFiles(join(upstreamRoot, 'prompts')).filter((path) => /\.mdx?$/.test(path));
const upstreamDocs = walkFiles(join(upstreamRoot, 'docs')).filter((path) => /\.mdx?$/.test(path));
const upstreamSkillCount = countSkillDirs(join(upstreamRoot, 'skills'));
const docsRoot = join(appRoot, 'content/docs');
const mdxFiles = walkFiles(docsRoot).filter((path) => path.endsWith('.mdx'));
const localeCounts = Object.fromEntries(locales.map((locale) => [locale, 0]));
for (const file of mdxFiles) {
  const locale = localeForMdx(file);
  localeCounts[locale] = (localeCounts[locale] ?? 0) + 1;
}

const missingLocaleSiblings = [];
for (const file of mdxFiles.filter((path) => localeForMdx(path) === 'en')) {
  const base = file.replace(/\.mdx$/, '');
  for (const locale of locales.filter((item) => item !== 'en')) {
    const expected = `${base}.${locale}.mdx`;
    if (!existsSync(expected)) {
      missingLocaleSiblings.push({ source: relative(root, file), missing: relative(root, expected) });
    }
  }
}

const metaDrift = [];
for (const meta of walkFiles(docsRoot).filter((path) => path.endsWith('/meta.json'))) {
  const basePages = pageList(meta);
  if (!basePages) continue;
  for (const locale of locales.filter((item) => item !== 'en')) {
    const sibling = meta.replace(/meta\.json$/, `meta.${locale}.json`);
    const siblingPages = pageList(sibling);
    if (!siblingPages) {
      metaDrift.push({ base: relative(root, meta), locale, issue: 'missing-locale-meta' });
      continue;
    }
    const drift = compareMetaPages(basePages, siblingPages);
    if (drift) {
      metaDrift.push({
        base: relative(root, meta),
        locale,
        ...drift,
      });
    }
  }
}

const result = {
  root,
  appPath,
  upstream: {
    url: upstreamUrl,
    branch,
    cachePath,
    head: upstreamHead,
    headShort: upstreamHeadShort,
    version: upstreamVersion,
    promptCount: promptFiles.length,
    skillCount: upstreamSkillCount,
    docsFileCount: upstreamDocs.length,
    diffBase,
    changedFiles,
  },
  site: {
    version: siteVersion,
    locales,
    localeCounts,
    missingLocaleSiblings,
    metaDrift,
  },
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log('# OMX upstream inspection');
  console.log('');
  console.log(`- App: \`${appPath}\``);
  console.log(`- Upstream: \`${upstreamUrl}\` \`${branch}\` @ \`${upstreamHeadShort}\``);
  console.log(`- Upstream version: \`${upstreamVersion ?? 'unknown'}\``);
  console.log(`- Site version: \`${siteVersion ?? 'unknown'}\``);
  console.log(`- Version drift: ${upstreamVersion && siteVersion && upstreamVersion !== siteVersion ? `\`${siteVersion}\` → \`${upstreamVersion}\`` : 'none detected'}`);
  console.log('');
  console.log('## Upstream inventory');
  console.log(`- Prompt files: ${promptFiles.length}`);
  console.log(`- Skill directories: ${upstreamSkillCount}`);
  console.log(`- Docs files: ${upstreamDocs.length}`);
  console.log('');
  console.log(`## Candidate upstream changes ${diffBase ? `since \`${diffBase}\`` : '(no tag base found; showing relevant upstream files)'}`);
  if (changedFiles.length) {
    for (const file of changedFiles.slice(0, 100)) console.log(`- ${file}`);
    if (changedFiles.length > 100) console.log(`- ... ${changedFiles.length - 100} more`);
  } else {
    console.log('- No relevant upstream changes detected.');
  }
  console.log('');
  console.log('## Site locale parity');
  for (const locale of locales) console.log(`- ${locale}: ${localeCounts[locale] ?? 0} MDX pages`);
  if (missingLocaleSiblings.length) {
    console.log('');
    console.log('### Missing locale siblings');
    for (const item of missingLocaleSiblings.slice(0, 50)) {
      console.log(`- ${item.source} -> missing ${item.missing}`);
    }
    if (missingLocaleSiblings.length > 50) console.log(`- ... ${missingLocaleSiblings.length - 50} more`);
  }
  if (metaDrift.length) {
    console.log('');
    console.log('### Meta page-list drift');
    for (const item of metaDrift.slice(0, 50)) {
      console.log(`- ${item.base} (${item.locale}): ${item.issue ?? 'page-list-drift'} ${JSON.stringify(item)}`);
    }
    if (metaDrift.length > 50) console.log(`- ... ${metaDrift.length - 50} more`);
  }
  console.log('');
  console.log('## Next actions');
  console.log('- Read changed upstream files that map to docs pages.');
  console.log('- Update commands/code blocks verbatim; adapt prose to the docs tone.');
  console.log('- Update all existing locale siblings or report explicit translation gaps.');
  console.log('- Run `npm --prefix apps/codex run check:localized-links`, `npm run lint:codex`, and `npm run build:codex`.');
}
