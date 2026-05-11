#!/usr/bin/env node
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = resolve(SKILL_ROOT, '..', '..', '..');

const APPS = {
  codex: { path: 'apps/codex', port: 3101, label: 'OMX / Codex docs' },
  claudecode: { path: 'apps/claudecode', port: 3102, label: 'Claude Code docs' },
  openagent: { path: 'apps/openagent', port: 3103, label: 'OpenAgent docs' },
};

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('-'));
const appName = positional[0];

function hasFlag(name) {
  return args.includes(name);
}

function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

function printHelp() {
  console.log(`Usage: node scripts/preview-docs.mjs <codex|claudecode|openagent> [options]

Options:
  --host <host>          Hostname for Next dev server (default: 127.0.0.1)
  --port <port>          Port override (defaults: codex=3101, claudecode=3102, openagent=3103)
  --path <url-path>      Add a path to smoke-check. Repeatable.
  --from-git            Derive smoke paths from changed docs files in git diff/status.
  --smoke-only          Do not start Next; smoke-check an already running server.
  --exit-after-smoke    Start server, smoke-check, then stop and exit.
  --dry-run             Print the command and URLs without starting or checking.
  --timeout-ms <ms>     Server readiness timeout (default: 90000)
  --help                Show this help.

Examples:
  node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --from-git
  node .codex/skills/preview-docs-local/scripts/preview-docs.mjs codex --path /docs/getting-started --exit-after-smoke
  node .codex/skills/preview-docs-local/scripts/preview-docs.mjs claudecode --smoke-only --port 3102
`);
}

if (hasFlag('--help') || !appName) {
  printHelp();
  process.exit(appName ? 0 : 1);
}

const app = APPS[appName];
if (!app) {
  console.error(`[preview-docs] Unknown app: ${appName}`);
  console.error(`[preview-docs] Known apps: ${Object.keys(APPS).join(', ')}`);
  process.exit(1);
}

const appRoot = join(REPO_ROOT, app.path);
if (!existsSync(join(appRoot, 'package.json'))) {
  console.error(`[preview-docs] Missing app package.json: ${join(appRoot, 'package.json')}`);
  process.exit(1);
}

const host = argValue('--host', '127.0.0.1');
const port = Number(argValue('--port', app.port));
const timeoutMs = Number(argValue('--timeout-ms', 90_000));
const baseUrl = `http://${host}:${port}`;
const dryRun = hasFlag('--dry-run');
const smokeOnly = hasFlag('--smoke-only');
const exitAfterSmoke = hasFlag('--exit-after-smoke');
const fromGit = hasFlag('--from-git');

function normalizePath(path) {
  if (!path) return null;
  const value = path.startsWith('/') ? path : `/${path}`;
  return value.replace(/\/index$/, '') || '/docs';
}

function explicitPaths() {
  const out = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--path' && args[i + 1]) out.push(normalizePath(args[i + 1]));
  }
  return out.filter(Boolean);
}

function localeForFileName(fileName) {
  const match = fileName.match(/\.([a-z]{2})\.mdx$/);
  return match ? match[1] : 'en';
}

function docsFileToPath(filePath) {
  const prefix = `${app.path}/content/docs/`;
  if (!filePath.startsWith(prefix) || !filePath.endsWith('.mdx')) return null;
  const relative = filePath.slice(prefix.length);
  const locale = localeForFileName(relative);
  let slug = relative
    .replace(/\.[a-z]{2}\.mdx$/, '')
    .replace(/\.mdx$/, '')
    .replace(/(^|\/)index$/, '')
    .replace(/\/$/, '');
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  return `${localePrefix}/docs${slug ? `/${slug}` : ''}`;
}

function gitChangedDocsPaths() {
  const commands = [
    ['diff', '--name-only', 'HEAD', '--', `${app.path}/content/docs`],
    ['ls-files', '--others', '--exclude-standard', '--', `${app.path}/content/docs`],
  ];
  const files = new Set();
  for (const command of commands) {
    const result = spawnSync('git', command, { cwd: REPO_ROOT, encoding: 'utf8' });
    if (result.status === 0) {
      for (const line of result.stdout.split('\n').filter(Boolean)) files.add(line);
    }
  }
  return [...files].map(docsFileToPath).filter(Boolean);
}

function defaultPaths() {
  return ['/docs', '/ko/docs', '/ja/docs', '/zh/docs'];
}

const smokePaths = [...new Set([
  ...explicitPaths(),
  ...(fromGit ? gitChangedDocsPaths() : []),
])];
const pathsToCheck = smokePaths.length ? smokePaths : defaultPaths();
const urls = pathsToCheck.map((path) => `${baseUrl}${path}`);
const command = ['npm', '--prefix', app.path, 'run', 'dev', '--', '--hostname', host, '--port', String(port)];

if (dryRun) {
  console.log(`[dry-run] app=${appName} (${app.label})`);
  console.log(`[dry-run] command=${command.join(' ')}`);
  console.log('[dry-run] smoke URLs:');
  for (const url of urls) console.log(`- ${url}`);
  process.exit(0);
}

async function waitForUrl(url, deadline) {
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status >= 200 && res.status < 400) return res.status;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw lastError ?? new Error('Timed out waiting for URL');
}

async function smokeCheck() {
  console.log(`[preview-docs] Smoke-checking ${urls.length} URL(s):`);
  for (const url of urls) {
    const status = await waitForUrl(url, Date.now() + timeoutMs);
    console.log(`[preview-docs] OK ${status} ${url}`);
  }
}

let child = null;
function stopChild() {
  if (child && !child.killed) child.kill('SIGTERM');
}
process.on('SIGINT', () => {
  stopChild();
  process.exit(130);
});
process.on('SIGTERM', () => {
  stopChild();
  process.exit(143);
});
process.on('exit', stopChild);

if (!smokeOnly) {
  console.log(`[preview-docs] Starting ${app.label} at ${baseUrl}`);
  console.log(`[preview-docs] ${command.join(' ')}`);
  child = spawn(command[0], command.slice(1), {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code, signal) => {
    if (!exitAfterSmoke && code !== null && code !== 0) {
      console.error(`[preview-docs] dev server exited with code ${code}${signal ? ` signal ${signal}` : ''}`);
      process.exit(code);
    }
  });
}

try {
  await smokeCheck();
  console.log('[preview-docs] Preview URLs:');
  for (const url of urls) console.log(`- ${url}`);
  if (smokeOnly || exitAfterSmoke) {
    stopChild();
    process.exit(0);
  }
  console.log('[preview-docs] Dev server is still running. Press Ctrl-C to stop.');
} catch (error) {
  stopChild();
  console.error(`[preview-docs] FAILED: ${error.message}`);
  process.exit(1);
}
