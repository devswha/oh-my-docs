#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = resolve(SKILL_ROOT, '..', '..', '..');

const APPS = {
  codex: { root: 'apps/codex', port: 3101, locales: ['en', 'ko', 'ja', 'zh'], label: 'OMX / Codex docs' },
  claudecode: { root: 'apps/claudecode', port: 3102, locales: ['en', 'ko', 'ja', 'zh'], label: 'Claude Code docs' },
  openagent: { root: 'apps/openagent', port: 3103, locales: ['en', 'ko', 'ja', 'zh'], label: 'OpenAgent docs' },
};

function usage() {
  console.log(`Usage: node make-doc-review-sheet.mjs --app <app> --page <mdx-file> [options]

Create a self-contained HTML review sheet for docs rewrite/update/review work.

Options:
  --app <codex|claudecode|openagent>  Docs app. Default: codex.
  --page <file>                       Source MDX page to review. Required.
  --proposal-file <file>              Optional proposed MDX rewrite to compare against the source.
  --output <path>                     Output HTML. Default: .omx/artifacts/docs-review/<page-slug>.html.
  --locales                           Include locale sibling matrix for EN/KO/JA/ZH.
  --base-url <url>                    Preview base URL to include. Repeatable. Default: http://127.0.0.1:<port>.
  --tailscale                         Add Tailscale/MagicDNS candidate preview URLs when available.
  --allow-outside-omx                 Allow output outside .omx/artifacts/docs-review.
  --help                              Show this help.
`);
}

function parseArgs(argv) {
  const out = { app: 'codex', locales: false, baseUrls: [], tailscale: false, allowOutsideOmx: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--app') out.app = argv[++i];
    else if (arg === '--page') out.page = argv[++i];
    else if (arg === '--proposal-file') out.proposalFile = argv[++i];
    else if (arg === '--output') out.output = argv[++i];
    else if (arg === '--locales') out.locales = true;
    else if (arg === '--base-url') out.baseUrls.push(argv[++i]);
    else if (arg === '--tailscale') out.tailscale = true;
    else if (arg === '--allow-outside-omx') out.allowOutsideOmx = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!APPS[out.app]) throw new Error(`Unknown app '${out.app}'. Expected one of: ${Object.keys(APPS).join(', ')}`);
  return out;
}

function abs(value) {
  return path.isAbsolute(value) ? value : resolve(REPO_ROOT, value);
}

function rel(value) {
  return path.relative(REPO_ROOT, value).replace(/\\/g, '/');
}

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return { attrs: {}, frontmatter: '', body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { attrs: {}, frontmatter: '', body: text };
  const frontmatter = text.slice(3, end).trim();
  const attrs = {};
  for (const line of frontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*["']?(.*?)["']?\s*$/);
    if (match) attrs[match[1]] = match[2];
  }
  return { attrs, frontmatter, body: text.slice(end + 4).replace(/^\n/, '') };
}

function localeForFile(file) {
  const match = path.basename(file).match(/\.([a-z]{2})\.mdx?$/);
  return match ? match[1] : 'en';
}

function baseLocaleFile(file) {
  return file.replace(/\.([a-z]{2})\.mdx?$/, '.mdx');
}

function localeVariantFile(baseFile, locale) {
  if (locale === 'en') return baseFile;
  return baseFile.replace(/\.mdx?$/, `.${locale}.mdx`);
}

function appRoot(appName) {
  return resolve(REPO_ROOT, APPS[appName].root);
}

function routeForFile(file, appName) {
  const root = appRoot(appName);
  let relative = path.relative(resolve(root, 'content/docs'), file).replace(/\\/g, '/');
  relative = relative.replace(/\.mdx?$/, '');
  const localeMatch = relative.match(/^(.*)\.([a-z]{2})$/);
  const locale = localeMatch ? localeMatch[2] : 'en';
  if (localeMatch) relative = localeMatch[1];
  relative = relative.replace(/(^|\/)index$/, '$1').replace(/\/$/, '');
  const route = `/docs${relative ? `/${relative}` : ''}`;
  return locale === 'en' ? route : `/${locale}${route}`;
}

function pageSlug(file, appName) {
  const root = appRoot(appName);
  let relative = path.relative(resolve(root, 'content/docs'), file).replace(/\\/g, '/');
  relative = relative.replace(/\.mdx?$/, '').replace(/\.([a-z]{2})$/, '').replace(/\/index$/, '').replace(/^index$/, 'home');
  return relative.replace(/[^A-Za-z0-9/.-]/g, '-').replace(/\//g, '-').replace(/-+/g, '-').toLowerCase();
}

function normalizeOutput(args, pageFile) {
  const output = args.output
    ? abs(args.output)
    : resolve(REPO_ROOT, '.omx/artifacts/docs-review', `${pageSlug(pageFile, args.app)}.html`);
  if (!args.allowOutsideOmx) {
    const allowed = resolve(REPO_ROOT, '.omx/artifacts/docs-review');
    if (!(output === allowed || output.startsWith(`${allowed}${path.sep}`))) {
      throw new Error(`Refusing output outside ${rel(allowed)}. Pass --allow-outside-omx for scratch output.`);
    }
  }
  mkdirSync(path.dirname(output), { recursive: true });
  return output;
}

function headings(body) {
  return body
    .split('\n')
    .map((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (!match) return null;
      return { level: match[1].length, text: cleanupInline(match[2].trim()), line: index + 1 };
    })
    .filter(Boolean);
}

function cleanupInline(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function extractImages(text) {
  const images = [];
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  for (const match of text.matchAll(re)) {
    images.push({ alt: match[1], url: match[2].trim() });
  }
  return images;
}

function extractLinks(text) {
  const links = [];
  const re = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  for (const match of text.matchAll(re)) {
    links.push({ label: cleanupInline(match[1]), url: match[2].trim() });
  }
  return links;
}

function countCodeFences(text) {
  return (text.match(/^```/gm) ?? []).length;
}

function sectionCards(body) {
  const lines = body.split('\n');
  const cards = [];
  let current = { title: 'Intro', level: 1, lines: [] };
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      if (current.lines.join('\n').trim()) cards.push(current);
      current = { title: cleanupInline(match[2]), level: match[1].length, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.join('\n').trim()) cards.push(current);
  return cards.slice(0, 12).map((card) => ({
    ...card,
    excerpt: card.lines.join('\n').trim().split('\n').filter(Boolean).slice(0, 6).join('\n'),
  }));
}

function imageExists(url, appName) {
  if (!url.startsWith('/images/')) return null;
  return existsSync(resolve(appRoot(appName), 'public', url.replace(/^\//, '')));
}

function routeTargetExists(url, appName) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean.startsWith('/docs') && !clean.match(/^\/[a-z]{2}\/docs(\/|$)/)) return null;
  const localeMatch = clean.match(/^\/([a-z]{2})\/docs(?:\/(.*))?$/);
  const locale = localeMatch ? localeMatch[1] : 'en';
  const slug = localeMatch ? (localeMatch[2] ?? '') : clean.replace(/^\/docs\/?/, '');
  const normalized = slug.replace(/\/$/, '');
  const root = resolve(appRoot(appName), 'content/docs');
  const candidates = normalized
    ? [
        resolve(root, `${normalized}${locale === 'en' ? '' : `.${locale}`}.mdx`),
        resolve(root, normalized, `index${locale === 'en' ? '' : `.${locale}`}.mdx`),
      ]
    : [resolve(root, `index${locale === 'en' ? '' : `.${locale}`}.mdx`)];
  return candidates.some((candidate) => existsSync(candidate));
}

function audit(doc, appName) {
  const warnings = [];
  for (const image of doc.images) {
    const exists = imageExists(image.url, appName);
    if (exists === false) warnings.push(`Missing image asset: ${image.url}`);
    if (image.alt.trim().length < 24) warnings.push(`Short image alt text: ${image.url}`);
  }
  for (const link of doc.links) {
    const exists = routeTargetExists(link.url, appName);
    if (exists === false) warnings.push(`Missing docs link target: ${link.url}`);
  }
  if (doc.headings.length === 0) warnings.push('No Markdown headings found.');
  if (doc.codeFenceCount % 2 !== 0) warnings.push('Unbalanced fenced code block markers.');
  if (!doc.attrs.title) warnings.push('Missing frontmatter title.');
  if (!doc.attrs.description) warnings.push('Missing frontmatter description.');
  return warnings;
}

function loadDoc(file, appName) {
  const source = readFileSync(file, 'utf8');
  const parsed = stripFrontmatter(source);
  const doc = {
    file,
    locale: localeForFile(file),
    route: routeForFile(file, appName),
    source,
    attrs: parsed.attrs,
    frontmatter: parsed.frontmatter,
    body: parsed.body,
    headings: headings(parsed.body),
    images: extractImages(source),
    links: extractLinks(source),
    codeFenceCount: countCodeFences(source),
    sections: sectionCards(parsed.body),
  };
  doc.warnings = audit(doc, appName);
  return doc;
}

function siblingDocs(pageFile, appName, includeLocales) {
  if (!includeLocales) return [loadDoc(pageFile, appName)];
  const baseFile = baseLocaleFile(pageFile);
  const docs = [];
  for (const locale of APPS[appName].locales) {
    const candidate = localeVariantFile(baseFile, locale);
    if (existsSync(candidate)) docs.push(loadDoc(candidate, appName));
    else docs.push({ file: candidate, locale, missing: true, route: routeForFile(candidate, appName), warnings: ['Locale sibling file is missing.'] });
  }
  return docs;
}

function normalizeBaseUrl(value) {
  if (!value) return null;
  return value.replace(/\/+$/, '');
}

function envPublicUrl(appName) {
  const specific = `DOCS_PREVIEW_${appName.toUpperCase()}_PUBLIC_URL`;
  return process.env[specific] ?? process.env.DOCS_PREVIEW_PUBLIC_URL ?? process.env.PREVIEW_PUBLIC_URL ?? null;
}

function isTailscaleIpv4(value) {
  const parts = value.split('.').map(Number);
  return parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) && parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function tailscaleCandidates() {
  const candidates = [];
  const status = spawnSync('tailscale', ['status', '--json'], { encoding: 'utf8' });
  if (status.status === 0 && status.stdout) {
    try {
      const parsed = JSON.parse(status.stdout);
      const dnsName = parsed.Self?.DNSName?.replace(/\.$/, '');
      if (dnsName) {
        candidates.push(dnsName);
        candidates.push(dnsName.split('.')[0]);
      }
      for (const ip of parsed.Self?.TailscaleIPs ?? []) {
        if (isTailscaleIpv4(ip)) candidates.push(ip);
      }
    } catch {
      // Fall through to tailscale ip and network interfaces.
    }
  }
  const ip = spawnSync('tailscale', ['ip', '-4'], { encoding: 'utf8' });
  if (ip.status === 0) {
    for (const line of ip.stdout.split('\n').map((item) => item.trim()).filter(Boolean)) {
      if (isTailscaleIpv4(line)) candidates.push(line);
    }
  }
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal && isTailscaleIpv4(address.address)) candidates.push(address.address);
    }
  }
  return unique(candidates);
}

function previewBases(args) {
  const app = APPS[args.app];
  const bases = [];
  bases.push(...args.baseUrls.map(normalizeBaseUrl));
  const envUrl = normalizeBaseUrl(envPublicUrl(args.app));
  if (envUrl) bases.push(envUrl);
  if (args.tailscale) {
    bases.push(...tailscaleCandidates().map((host) => `http://${host}:${app.port}`));
    if (bases.length === 0) bases.push(`http://<tailscale-host>:${app.port}`);
  }
  if (bases.length === 0) bases.push(`http://127.0.0.1:${app.port}`);
  return unique(bases);
}

function compareProposal(sourceDoc, proposalFile, appName) {
  if (!proposalFile) return null;
  const file = abs(proposalFile);
  if (!existsSync(file)) throw new Error(`Proposal file not found: ${proposalFile}`);
  const proposal = loadDoc(file, appName);
  const before = sourceDoc.headings.map((item) => `${'#'.repeat(item.level)} ${item.text}`);
  const after = proposal.headings.map((item) => `${'#'.repeat(item.level)} ${item.text}`);
  return { file, proposal, before, after };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderOutline(items) {
  if (!items?.length) return '<p class="muted">No headings found.</p>';
  return `<ol class="outline">${items.map((item) => `<li class="h${item.level}"><span>H${item.level}</span>${escapeHtml(item.text)}</li>`).join('')}</ol>`;
}

function renderDocTable(docs) {
  return `<table>
    <thead><tr><th>Locale</th><th>File</th><th>Route</th><th>Title</th><th>H2/H3</th><th>Images</th><th>Links</th><th>Warnings</th></tr></thead>
    <tbody>
      ${docs.map((doc) => `<tr class="${doc.missing || doc.warnings?.length ? 'warn' : ''}">
        <td><strong>${escapeHtml(doc.locale)}</strong></td>
        <td><code>${escapeHtml(rel(doc.file))}</code></td>
        <td><code>${escapeHtml(doc.route)}</code></td>
        <td>${doc.missing ? '<span class="pill danger">missing</span>' : escapeHtml(doc.attrs.title ?? '')}</td>
        <td>${doc.missing ? '-' : doc.headings.filter((h) => h.level === 2 || h.level === 3).length}</td>
        <td>${doc.missing ? '-' : doc.images.length}</td>
        <td>${doc.missing ? '-' : doc.links.length}</td>
        <td>${doc.warnings?.length ? `<ul>${doc.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>` : '<span class="ok">OK</span>'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function renderCards(doc) {
  return doc.sections.map((section) => `<article class="section-card">
    <h3>${escapeHtml(section.title)}</h3>
    <p class="muted">Heading level H${section.level}</p>
    <pre>${escapeHtml(section.excerpt || '(empty section)')}</pre>
  </article>`).join('');
}

function renderAssets(doc, appName) {
  const rows = [
    ...doc.images.map((image) => ({ type: 'image', label: image.alt || '(empty alt)', url: image.url, status: imageExists(image.url, appName) })),
    ...doc.links.map((link) => ({ type: 'link', label: link.label, url: link.url, status: routeTargetExists(link.url, appName) })),
  ];
  if (!rows.length) return '<p class="muted">No Markdown images or links found.</p>';
  return `<table><thead><tr><th>Type</th><th>Label / alt</th><th>URL</th><th>Local status</th></tr></thead><tbody>${rows.map((row) => {
    const status = row.status === null ? 'not checked' : row.status ? 'OK' : 'missing';
    return `<tr class="${row.status === false ? 'warn' : ''}"><td>${escapeHtml(row.type)}</td><td>${escapeHtml(row.label)}</td><td><code>${escapeHtml(row.url)}</code></td><td>${escapeHtml(status)}</td></tr>`;
  }).join('')}</tbody></table>`;
}

function reviewPrompts(doc, appName) {
  const title = doc.attrs.title || pageSlug(doc.file, appName);
  return [
    `Rewrite ${title} for a reader who needs to decide when to use it. Preserve commands, links, frontmatter, and MDX validity.`,
    `Review ${title} for missing prerequisites, confusing handoffs, outdated commands, and places where an image or diagram would reduce cognitive load.`,
    `Synchronize locale siblings for ${title}; keep the English source structure aligned while localizing alt text and prose naturally.`,
  ];
}

function sheetHtml(args, sourceDoc, docs, proposal, output) {
  const warningCount = docs.reduce((sum, doc) => sum + (doc.warnings?.length ?? 0), 0);
  const bases = previewBases(args);
  const previewUrls = bases.flatMap((base) => docs.filter((doc) => !doc.missing).map((doc) => `${base}${doc.route}`));
  const generated = new Date().toISOString();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Docs review sheet — ${escapeHtml(sourceDoc.attrs.title || rel(sourceDoc.file))}</title>
  <style>
    :root { color-scheme: dark; --bg:#050915; --panel:#0b1220; --panel2:#07101f; --line:#23344f; --text:#e5edf9; --muted:#9fb0c8; --accent:#67e8f9; --warn:#fbbf24; --ok:#86efac; --danger:#fb7185; }
    * { box-sizing: border-box; }
    body { margin:0; padding:32px; background:radial-gradient(circle at 20% 0%, rgba(37,99,235,.18), transparent 34%), var(--bg); color:var(--text); font:15px/1.55 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    h1 { margin:0 0 10px; font-size:clamp(28px,4vw,46px); line-height:1.05; }
    h2 { margin:0 0 14px; font-size:24px; }
    h3 { margin:0 0 8px; font-size:18px; }
    p { margin:0 0 10px; }
    a { color:#a5f3fc; }
    code, pre, textarea { font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    pre, textarea { white-space:pre-wrap; word-break:break-word; }
    header, section { max-width:1320px; margin:0 auto 22px; }
    .panel, .metric, .section-card { border:1px solid var(--line); background:rgba(11,18,32,.86); border-radius:22px; box-shadow:0 18px 50px rgba(0,0,0,.25); }
    .panel { padding:20px; }
    .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px; margin-top:18px; }
    .metric { padding:16px; }
    .metric strong { display:block; font-size:24px; }
    .muted { color:var(--muted); }
    .pill { display:inline-flex; align-items:center; padding:4px 9px; border-radius:999px; border:1px solid rgba(103,232,249,.45); color:#cffafe; font-size:12px; text-transform:uppercase; letter-spacing:.06em; }
    .danger { border-color:rgba(251,113,133,.6); color:#fecdd3; }
    .ok { color:var(--ok); }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(360px,1fr)); gap:16px; }
    .section-card { padding:16px; }
    .section-card pre, .source pre, textarea { border:1px solid #263957; border-radius:14px; background:var(--panel2); color:#dbeafe; padding:12px; margin:10px 0 0; max-height:360px; overflow:auto; }
    table { width:100%; border-collapse:collapse; overflow:hidden; border-radius:16px; }
    th, td { border-bottom:1px solid #21324d; padding:10px; text-align:left; vertical-align:top; }
    th { color:#bfdbfe; background:#0b1628; position:sticky; top:0; }
    tr.warn td { background:rgba(251,191,36,.06); }
    td ul { margin:0; padding-left:18px; }
    .outline { margin:0; padding-left:0; list-style:none; }
    .outline li { padding:6px 0 6px calc((var(--level, 1) - 1) * 16px); border-bottom:1px solid rgba(35,52,79,.5); }
    .outline li span { display:inline-block; min-width:34px; margin-right:8px; color:#93c5fd; font-size:12px; }
    .outline .h1 { --level:1; } .outline .h2 { --level:2; } .outline .h3 { --level:3; } .outline .h4 { --level:4; } .outline .h5 { --level:5; } .outline .h6 { --level:6; }
    .columns { display:grid; grid-template-columns:repeat(auto-fit,minmax(420px,1fr)); gap:18px; }
    textarea { width:100%; min-height:120px; resize:vertical; }
    .checklist li { margin:6px 0; }
  </style>
</head>
<body>
  <header>
    <span class="pill">HTML docs review sheet</span>
    <h1>${escapeHtml(sourceDoc.attrs.title || rel(sourceDoc.file))}</h1>
    <p class="muted">Generated ${escapeHtml(generated)} for ${escapeHtml(APPS[args.app].label)}. Use this as a temporary review artifact before editing MDX; keep source-of-truth in docs files.</p>
    <div class="metrics">
      <div class="metric"><span class="muted">Source file</span><br><code>${escapeHtml(rel(sourceDoc.file))}</code></div>
      <div class="metric"><span class="muted">Route</span><br><code>${escapeHtml(sourceDoc.route)}</code></div>
      <div class="metric"><span class="muted">Headings</span><strong>${sourceDoc.headings.length}</strong></div>
      <div class="metric"><span class="muted">Warnings</span><strong>${warningCount}</strong></div>
      <div class="metric"><span class="muted">Output</span><br><code>${escapeHtml(rel(output))}</code></div>
    </div>
  </header>

  <section class="panel">
    <h2>Review checklist</h2>
    <ul class="checklist">
      <li>□ Does the first screen explain who should use this page and when?</li>
      <li>□ Are commands, paths, links, and warnings still current?</li>
      <li>□ Are images/diagrams placed where they reduce cognitive load?</li>
      <li>□ Are locale siblings structurally aligned while keeping natural localized prose?</li>
      <li>□ After applying MDX changes, run link check, lint, build, and Tailnet preview smoke checks.</li>
    </ul>
  </section>

  <section class="panel">
    <h2>Locale and route matrix</h2>
    ${renderDocTable(docs)}
  </section>

  <section class="columns">
    <div class="panel">
      <h2>Current outline</h2>
      ${renderOutline(sourceDoc.headings)}
    </div>
    <div class="panel">
      <h2>${proposal ? 'Proposed outline' : 'Rewrite prompts'}</h2>
      ${proposal ? renderOutline(proposal.proposal.headings) : reviewPrompts(sourceDoc, args.app).map((prompt) => `<textarea readonly>${escapeHtml(prompt)}</textarea>`).join('')}
    </div>
  </section>

  <section class="panel">
    <h2>Section scan</h2>
    <div class="grid">${renderCards(sourceDoc)}</div>
  </section>

  <section class="panel">
    <h2>Images and links audit</h2>
    ${renderAssets(sourceDoc, args.app)}
  </section>

  ${proposal ? `<section class="columns">
    <div class="panel source"><h2>Before source</h2><pre>${escapeHtml(sourceDoc.source)}</pre></div>
    <div class="panel source"><h2>After proposal</h2><pre>${escapeHtml(proposal.proposal.source)}</pre></div>
  </section>` : `<section class="panel source">
    <h2>Source MDX snapshot</h2>
    <p class="muted">Use this for review only. Apply edits in the real MDX files, not in this generated HTML artifact.</p>
    <pre>${escapeHtml(sourceDoc.source)}</pre>
  </section>`}

  <section class="panel">
    <h2>Preview URLs</h2>
    ${previewUrls.length ? `<ul>${previewUrls.map((url) => `<li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`).join('')}</ul>` : '<p class="muted">No preview URLs configured.</p>'}
  </section>
</body>
</html>`;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  if (!args.page) throw new Error('--page is required');
  const pageFile = abs(args.page);
  if (!existsSync(pageFile)) throw new Error(`Page file not found: ${args.page}`);
  const expectedRoot = resolve(appRoot(args.app), 'content/docs');
  if (!pageFile.startsWith(`${expectedRoot}${path.sep}`)) {
    throw new Error(`Page must live under ${rel(expectedRoot)}`);
  }
  const output = normalizeOutput(args, pageFile);
  const docs = siblingDocs(pageFile, args.app, args.locales);
  const sourceDoc = docs.find((doc) => !doc.missing && doc.file === pageFile) ?? loadDoc(pageFile, args.app);
  const proposal = compareProposal(sourceDoc, args.proposalFile, args.app);
  writeFileSync(output, sheetHtml(args, sourceDoc, docs, proposal, output), 'utf8');
  console.log(`[make-doc-review-sheet] wrote ${rel(output)}`);
  console.log(`[make-doc-review-sheet] route ${sourceDoc.route}`);
  console.log(`[make-doc-review-sheet] warnings ${docs.reduce((sum, doc) => sum + (doc.warnings?.length ?? 0), 0)}`);
} catch (error) {
  console.error(`[make-doc-review-sheet] ${error.message}`);
  process.exit(1);
}
