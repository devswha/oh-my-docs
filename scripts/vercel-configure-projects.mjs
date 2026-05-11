#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, 'deploy', 'vercel', 'projects.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const dryRun = !apply || args.includes('--dry-run');
const selected = args.filter((arg) => !arg.startsWith('-'));
const allProjects = manifest.projects ?? {};
const names = selected.length ? selected : Object.keys(allProjects);

if (apply && !process.env.VERCEL_TOKEN) {
  console.error('[vercel-configure-projects] VERCEL_TOKEN is required when using --apply.');
  process.exit(1);
}

function assertProject(name, project) {
  if (!project) {
    throw new Error(`Unknown project '${name}'. Known projects: ${Object.keys(allProjects).join(', ')}`);
  }
  for (const key of ['projectId', 'orgId', 'rootDirectory']) {
    if (!project[key]) throw new Error(`${name} is missing ${key} in ${manifestPath}`);
  }
}

async function configure(name, project) {
  assertProject(name, project);
  const body = { rootDirectory: project.rootDirectory };
  const query = new URLSearchParams({ teamId: project.orgId });
  const url = `https://api.vercel.com/v9/projects/${encodeURIComponent(project.projectId)}?${query}`;

  if (dryRun) {
    console.log(`[dry-run] ${name}: PATCH ${url}`);
    console.log(`[dry-run] ${name}: ${JSON.stringify(body)}`);
    return;
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`[vercel-configure-projects] ${name} failed: HTTP ${res.status}`);
    console.error(text);
    process.exitCode = 1;
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }
  console.log(
    `[vercel-configure-projects] ${name}: rootDirectory=${parsed.rootDirectory ?? project.rootDirectory}`,
  );
}

for (const name of names) {
  await configure(name, allProjects[name]);
}

if (dryRun) {
  console.log('[vercel-configure-projects] Dry run only. Re-run with --apply and VERCEL_TOKEN to change Vercel project settings.');
}
