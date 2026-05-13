#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, 'deploy', 'vercel', 'projects.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const explicitDryRun = args.includes('--dry-run');

if (apply && explicitDryRun) {
  console.error('[vercel-configure-projects] --apply and --dry-run are mutually exclusive.');
  process.exit(1);
}

const dryRun = !apply;
const selected = args.filter((arg) => !arg.startsWith('-'));
const allProjects = manifest.projects ?? {};
const names = selected.length ? selected : Object.keys(allProjects);

if (apply && !process.env.VERCEL_TOKEN) {
  console.error('[vercel-configure-projects] VERCEL_TOKEN is required when using --apply.');
  process.exit(1);
}

const failed = [];
const succeeded = [];

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

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(`[vercel-configure-projects] ${name} failed: HTTP ${res.status}`);
      console.error(text);
      failed.push({ name, reason: `HTTP ${res.status}` });
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
    succeeded.push(name);
  } catch (err) {
    // Network errors, timeouts, fetch aborts — keep going so other projects
    // still report; surface in the summary.
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[vercel-configure-projects] ${name} failed: ${reason}`);
    failed.push({ name, reason });
  }
}

for (const name of names) {
  await configure(name, allProjects[name]);
}

if (dryRun) {
  console.log('[vercel-configure-projects] Dry run only. Re-run with --apply and VERCEL_TOKEN to change Vercel project settings.');
} else {
  console.log(`[vercel-configure-projects] Summary: ${succeeded.length} succeeded, ${failed.length} failed.`);
  if (failed.length) {
    for (const f of failed) console.error(`  - ${f.name}: ${f.reason}`);
    process.exit(1);
  }
}
