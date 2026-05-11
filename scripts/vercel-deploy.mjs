#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, 'deploy', 'vercel', 'projects.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const allProjects = manifest.projects ?? {};
const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('-')));
const target = args.find((arg) => !arg.startsWith('-'));

if (!target) {
  console.error('Usage: node scripts/vercel-deploy.mjs <codex|claudecode|openagent|all> [--prod] [--prebuilt] [--yes] [--dry-run]');
  process.exit(1);
}

const names = target === 'all' ? Object.keys(allProjects) : [target];
const dryRun = flags.has('--dry-run');
const prod = flags.has('--prod');
const prebuilt = flags.has('--prebuilt');
const yes = flags.has('--yes');

function shellQuote(value) {
  return /[^A-Za-z0-9_/:=.,@%+-]/.test(value) ? JSON.stringify(value) : value;
}

for (const name of names) {
  const project = allProjects[name];
  if (!project) {
    console.error(`[vercel-deploy] Unknown project: ${name}`);
    console.error(`Known projects: ${Object.keys(allProjects).join(', ')}, all`);
    process.exit(1);
  }

  const projectRoot = join(root, project.path);
  const linkPath = join(projectRoot, '.vercel', 'project.json');
  if (!existsSync(linkPath)) {
    console.error(`[vercel-deploy] Missing ${linkPath}`);
    console.error('[vercel-deploy] Run `npm run vercel:sync-links` first, or `vercel link --repo` from the repository root.');
    process.exit(1);
  }

  const command = ['vercel', '--cwd', project.path, 'deploy'];
  if (prod) command.push('--prod');
  if (prebuilt) command.push('--prebuilt');
  if (yes) command.push('--yes');
  if (process.env.VERCEL_TOKEN) command.push('--token', process.env.VERCEL_TOKEN);

  if (dryRun) {
    const printable = command.map((part) => (part === process.env.VERCEL_TOKEN ? '$VERCEL_TOKEN' : shellQuote(part))).join(' ');
    console.log(`[dry-run] ${name}: ${printable}`);
    continue;
  }

  console.log(`[vercel-deploy] Deploying ${name} (${project.projectName}) from ${project.path}${prod ? ' to production' : ' as preview'}...`);
  const result = spawnSync(command[0], command.slice(1), {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
