#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

const APPS = {
  codex: 'apps/codex',
  claudecode: 'apps/claudecode',
  openagent: 'apps/openagent',
};

const LOCALES = ['en', 'ko', 'ja', 'zh'];
const LOCALE_RE = /\.(ko|ja|zh)\.mdx?$/;

function usage() {
  console.log(`Usage: node plan-doc-images.mjs [--app codex|claudecode|openagent] [--from-git] [--purpose hero|concept|flow|comparison] [--json] [mdx files...]

Suggest docs image placements, output paths, routes, alt text, and prompt skeletons.
`);
}

function parseArgs(argv) {
  const out = { app: 'codex', fromGit: false, json: false, purpose: 'concept', files: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--from-git') out.fromGit = true;
    else if (arg === '--json') out.json = true;
    else if (arg === '--app') out.app = argv[++i];
    else if (arg === '--purpose') out.purpose = argv[++i];
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else out.files.push(arg);
  }
  if (!APPS[out.app]) throw new Error(`Unknown app '${out.app}'. Expected one of: ${Object.keys(APPS).join(', ')}`);
  return out;
}

function findRepoRoot() {
  // Always resolve relative to the script's location so cwd doesn't matter.
  return execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: SCRIPT_DIR,
    encoding: 'utf8',
  }).trim();
}

function gitFiles(absAppRoot, repoRoot) {
  // NUL-separated so renames (R old<NUL>new) and quoted/non-ASCII paths
  // are preserved verbatim. Combine tracked-modified + untracked.
  const tracked = execFileSync('git', ['diff', '--name-only', '-z', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const docsPrefix =
    path.relative(repoRoot, path.join(absAppRoot, 'content/docs')).replace(/\\/g, '/') + '/';
  return [...tracked.split('\0'), ...untracked.split('\0')]
    .filter(Boolean)
    .filter((file) => file.startsWith(docsPrefix) && /\.mdx?$/.test(file))
    .map((file) => path.resolve(repoRoot, file));
}

function docsRoot(absAppRoot) {
  return path.resolve(absAppRoot, 'content/docs');
}

function localeFor(file) {
  const match = path.basename(file).match(LOCALE_RE);
  return match ? match[1] : 'en';
}

function docsRelative(file, absAppRoot) {
  const absolute = path.resolve(file);
  const root = docsRoot(absAppRoot);
  if (!(absolute === root || absolute.startsWith(`${root}${path.sep}`))) {
    throw new Error(`File must live under ${path.relative(process.cwd(), root).replace(/\\/g, '/')}: ${file}`);
  }
  return path.relative(root, absolute).replace(/\\/g, '/');
}

function pageKey(file, absAppRoot) {
  return docsRelative(file, absAppRoot)
    .replace(/\.mdx?$/, '')
    .replace(/\.(ko|ja|zh)$/, '');
}

function groupLocaleSiblings(files, absAppRoot) {
  const groups = new Map();
  for (const file of files) {
    if (!/\.mdx?$/.test(file)) throw new Error(`Expected an MDX file: ${file}`);
    const key = pageKey(file, absAppRoot);
    const group = groups.get(key) ?? [];
    group.push(file);
    groups.set(key, group);
  }
  return [...groups.values()].map((groupFiles) => {
    const siblings = groupFiles
      .map((file) => ({ file, locale: localeFor(file), route: routeFor(file, absAppRoot) }))
      .sort((a, b) => LOCALES.indexOf(a.locale) - LOCALES.indexOf(b.locale) || a.file.localeCompare(b.file));
    const primary = siblings.find((item) => item.locale === 'en') ?? siblings[0];
    return { primary: primary.file, siblings };
  });
}

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return { attrs: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { attrs: {}, body: text };
  const fm = text.slice(3, end).trim();
  const attrs = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*["']?(.*?)["']?\s*$/);
    if (m) attrs[m[1]] = m[2];
  }
  return { attrs, body: text.slice(end + 4) };
}

function routeFor(file, absAppRoot) {
  let rel = path.relative(path.join(absAppRoot, 'content/docs'), file).replace(/\\/g, '/');
  rel = rel.replace(/\.mdx?$/, '');
  const localeMatch = rel.match(/^(.*)\.(ko|ja|zh)$/);
  const locale = localeMatch ? localeMatch[2] : 'en';
  if (localeMatch) rel = localeMatch[1];
  rel = rel.replace(/(^|\/)index$/, '$1').replace(/\/$/, '');
  const route = `/docs${rel ? `/${rel}` : ''}`;
  return locale === 'en' ? route : `/${locale}${route}`;
}

function slugFor(file, absAppRoot) {
  let rel = path.relative(path.join(absAppRoot, 'content/docs'), file).replace(/\\/g, '/');
  rel = rel.replace(/\.mdx?$/, '').replace(/\.(ko|ja|zh)$/, '').replace(/\/index$/, '').replace(/^index$/, 'home');
  return rel.replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').toLowerCase();
}

function firstHeadings(body) {
  return body
    .split('\n')
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/)?.[2]?.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function suggestion(group, app, absAppRoot, purpose, repoRoot) {
  const { primary: file, siblings } = group;
  const text = readFileSync(file, 'utf8');
  const { attrs, body } = stripFrontmatter(text);
  const title = attrs.title || firstHeadings(body)[0] || path.basename(file).replace(/\.mdx?$/, '');
  const headings = firstHeadings(body);
  const slug = slugFor(file, absAppRoot);
  const imageRel = `images/docs/${slug}-${purpose}.png`;
  const outputPath = `${path.relative(repoRoot, absAppRoot).replace(/\\/g, '/')}/public/${imageRel}`;
  const imageUrl = `/${imageRel}`;
  const route = routeFor(file, absAppRoot);
  const prompt = `Create a docs-ready illustration for ${app} explaining '${title}'. Use a clean technical editorial style with simple shapes, high contrast, generous whitespace, and no embedded text, labels, logos, screenshots, or watermark. Suggested concepts from headings: ${headings.join(' / ') || title}.`;
  return {
    file: path.relative(repoRoot, file).replace(/\\/g, '/'),
    route,
    routes: siblings.map((item) => item.route),
    siblings: siblings.map((item) => ({
      file: path.relative(repoRoot, item.file).replace(/\\/g, '/'),
      locale: item.locale,
      route: item.route,
    })),
    title,
    purpose,
    outputPath,
    mdxUrl: imageUrl,
    markdown: `![${title} concept illustration](${imageUrl})`,
    prompt,
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  const repoRoot = findRepoRoot();
  const absAppRoot = path.resolve(repoRoot, APPS[args.app]);
  // Resolve explicit file args first against cwd (the natural shell meaning),
  // then fall back to repo root so the script also works from outside the
  // repo with a repo-relative path.
  let files = args.files.map((file) => {
    if (path.isAbsolute(file)) return file;
    const cwdResolved = path.resolve(file);
    if (existsSync(cwdResolved)) return cwdResolved;
    return path.resolve(repoRoot, file);
  });
  if (args.fromGit) files.push(...gitFiles(absAppRoot, repoRoot));
  files = [...new Set(files)].filter((file) => existsSync(file));
  if (files.length === 0) {
    console.error('No MDX files found. Pass files or use --from-git.');
    process.exit(2);
  }
  const groups = groupLocaleSiblings(files, absAppRoot);
  const suggestions = groups.map((group) => suggestion(group, args.app, absAppRoot, args.purpose, repoRoot));
  if (args.json) {
    console.log(JSON.stringify({ app: args.app, suggestions }, null, 2));
  } else {
    for (const item of suggestions) {
      console.log(`## ${item.file}`);
      console.log(`Routes: ${item.routes.join(', ')}`);
      console.log(`Locale siblings: ${item.siblings.map((sibling) => `${sibling.locale}:${sibling.file}`).join(', ')}`);
      console.log(`Title: ${item.title}`);
      console.log(`Output: ${item.outputPath}`);
      console.log(`MDX: ${item.markdown}`);
      console.log(`Prompt: ${item.prompt}`);
      console.log('');
    }
  }
} catch (error) {
  console.error(`[plan-doc-images] ${error.message}`);
  process.exit(1);
}
