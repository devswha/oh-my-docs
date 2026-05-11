#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, 'deploy', 'vercel', 'projects.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const allProjects = manifest.projects ?? {};
const names = requested.length ? requested : Object.keys(allProjects);

let wrote = 0;
for (const name of names) {
  const project = allProjects[name];
  if (!project) {
    console.error(`[vercel-sync-links] Unknown project: ${name}`);
    console.error(`Known projects: ${Object.keys(allProjects).join(', ')}`);
    process.exitCode = 1;
    continue;
  }

  for (const key of ['path', 'projectId', 'orgId', 'projectName']) {
    if (!project[key]) {
      console.error(`[vercel-sync-links] ${name} is missing ${key} in ${manifestPath}`);
      process.exitCode = 1;
      continue;
    }
  }

  const vercelDir = join(root, project.path, '.vercel');
  mkdirSync(vercelDir, { recursive: true });
  const outPath = join(vercelDir, 'project.json');
  const payload = {
    projectId: project.projectId,
    orgId: project.orgId,
    projectName: project.projectName,
  };
  writeFileSync(outPath, `${JSON.stringify(payload)}\n`, 'utf8');
  wrote += 1;
  console.log(`[vercel-sync-links] wrote ${outPath}`);
}

if (!process.exitCode) {
  console.log(`[vercel-sync-links] ${wrote} project link file(s) synchronized.`);
}
