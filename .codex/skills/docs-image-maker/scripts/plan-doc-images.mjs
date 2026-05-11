#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const APPS = {
  codex: 'apps/codex',
  claudecode: 'apps/claudecode',
  openagent: 'apps/openagent',
};

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

function gitFiles(appRoot) {
  const status = execFileSync('git', ['status', '--short', '--porcelain'], { encoding: 'utf8' });
  return status
    .split('\n')
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .filter((file) => file.startsWith(`${appRoot}/content/docs/`) && /\.mdx?$/.test(file));
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

function routeFor(file, appRoot) {
  let rel = path.relative(path.join(appRoot, 'content/docs'), file).replace(/\\/g, '/');
  rel = rel.replace(/\.mdx?$/, '');
  const localeMatch = rel.match(/^(.*)\.(ko|ja|zh)$/);
  const locale = localeMatch ? localeMatch[2] : 'en';
  if (localeMatch) rel = localeMatch[1];
  rel = rel.replace(/(^|\/)index$/, '$1').replace(/\/$/, '');
  const route = `/docs${rel ? `/${rel}` : ''}`;
  return locale === 'en' ? route : `/${locale}${route}`;
}

function slugFor(file, appRoot) {
  let rel = path.relative(path.join(appRoot, 'content/docs'), file).replace(/\\/g, '/');
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

function suggestion(file, app, appRoot, purpose) {
  const text = readFileSync(file, 'utf8');
  const { attrs, body } = stripFrontmatter(text);
  const title = attrs.title || firstHeadings(body)[0] || path.basename(file).replace(/\.mdx?$/, '');
  const headings = firstHeadings(body);
  const slug = slugFor(file, appRoot);
  const imageRel = `images/docs/${slug}-${purpose}.png`;
  const outputPath = `${appRoot}/public/${imageRel}`;
  const imageUrl = `/${imageRel}`;
  const route = routeFor(file, appRoot);
  const prompt = `Create a docs-ready illustration for ${app} explaining '${title}'. Use a clean technical editorial style with simple shapes, high contrast, generous whitespace, and no embedded text, labels, logos, screenshots, or watermark. Suggested concepts from headings: ${headings.join(' / ') || title}.`;
  return {
    file,
    route,
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
  const appRoot = APPS[args.app];
  let files = [...args.files];
  if (args.fromGit) files.push(...gitFiles(appRoot));
  files = [...new Set(files)].filter((file) => existsSync(file));
  if (files.length === 0) {
    console.error('No MDX files found. Pass files or use --from-git.');
    process.exit(2);
  }
  const suggestions = files.map((file) => suggestion(file, args.app, appRoot, args.purpose));
  if (args.json) {
    console.log(JSON.stringify({ app: args.app, suggestions }, null, 2));
  } else {
    for (const item of suggestions) {
      console.log(`## ${item.file}`);
      console.log(`Route: ${item.route}`);
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
