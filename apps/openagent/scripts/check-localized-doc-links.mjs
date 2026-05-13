#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultRootDir = new URL('..', import.meta.url);
const defaultDocsDir = new URL('../content/docs/', import.meta.url);
const localizedFilePattern = /(?:\.(ko|ja|zh)\.mdx$|meta\.(ko|ja|zh)\.json$)/;
const docsContentFilePattern = /(?:\.mdx$|meta(?:\.(?:ko|ja|zh))?\.json$)/;
const localeRootLinkPatterns = [
  { label: 'markdown link', regex: /\]\((\/docs(?:[/?#][^)\s]*)?)(?=[)\s])/g },
  { label: 'double-quoted path', regex: /"(\/docs(?:[/?#][^"]*)?)"/g },
  { label: 'single-quoted path', regex: /'(\/docs(?:[/?#][^']*)?)'/g },
];
const internalDocLinkPatterns = [
  { label: 'markdown link', regex: /\]\((\/docs(?:[/?#][^)\s]*)?|\/(?:ko|ja|zh)\/docs(?:[/?#][^)\s]*)?)(?=[)\s])/g },
  { label: 'double-quoted path', regex: /"(\/docs(?:[/?#][^"]*)?|\/(?:ko|ja|zh)\/docs(?:[/?#][^"]*)?)"/g },
  { label: 'single-quoted path', regex: /'(\/docs(?:[/?#][^']*)?|\/(?:ko|ja|zh)\/docs(?:[/?#][^']*)?)'/g },
];

function walk(dirUrl, filePattern, acc = []) {
  for (const entry of readdirSync(dirUrl, { withFileTypes: true })) {
    const childUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dirUrl);
    if (entry.isDirectory()) {
      walk(childUrl, filePattern, acc);
    } else if (filePattern.test(entry.name)) {
      acc.push(childUrl);
    }
  }
  return acc;
}

export function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function normalizeRoute(link) {
  return link.split('#', 1)[0].split('?', 1)[0];
}

function routeForDocFile(fileUrl, docsDir) {
  const docsPath = fileURLToPath(docsDir);
  const filePath = fileURLToPath(fileUrl);
  const relativePath = relative(docsPath, filePath);
  const parts = relativePath.split('/');
  const fileName = parts.pop();
  let locale = 'en';
  let stem = fileName.replace(/\.mdx$/, '');

  for (const candidate of ['ko', 'ja', 'zh']) {
    const suffix = `.${candidate}.mdx`;
    if (fileName.endsWith(suffix)) {
      locale = candidate;
      stem = fileName.slice(0, -suffix.length);
      break;
    }
  }

  if (stem !== 'index') parts.push(stem);
  const path = `/docs${parts.length > 0 ? `/${parts.join('/')}` : ''}`;
  return locale === 'en' ? path : `/${locale}${path}`;
}

export function buildDocRouteSet({ docsDir = defaultDocsDir } = {}) {
  const routes = new Set(['/docs', '/ko/docs', '/ja/docs', '/zh/docs']);

  for (const fileUrl of walk(docsDir, /\.mdx$/)) {
    if (!statSync(fileUrl).isFile()) continue;
    routes.add(routeForDocFile(fileUrl, docsDir));
  }

  return routes;
}

function linkFailures({ docsDir, rootDir, filePattern, linkPatterns, predicate }) {
  const failures = [];
  const rootPath = fileURLToPath(rootDir);

  for (const fileUrl of walk(docsDir, filePattern)) {
    if (!statSync(fileUrl).isFile()) continue;
    const text = readFileSync(fileUrl, 'utf8');

    for (const { label, regex } of linkPatterns) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const value = match[1];
        if (!predicate(value)) continue;
        failures.push({
          file: relative(rootPath, fileURLToPath(fileUrl)),
          line: lineNumberAt(text, match.index),
          label,
          value,
        });
      }
    }
  }

  return failures;
}

export function findLocalizedDocLinkFailures({ docsDir = defaultDocsDir, rootDir = defaultRootDir } = {}) {
  return linkFailures({
    docsDir,
    rootDir,
    filePattern: localizedFilePattern,
    linkPatterns: localeRootLinkPatterns,
    predicate: () => true,
  });
}

export function findMissingInternalDocRouteFailures({ docsDir = defaultDocsDir, rootDir = defaultRootDir } = {}) {
  const routes = buildDocRouteSet({ docsDir });

  return linkFailures({
    docsDir,
    rootDir,
    filePattern: docsContentFilePattern,
    linkPatterns: internalDocLinkPatterns,
    predicate: (value) => !routes.has(normalizeRoute(value)),
  });
}

export function runCheck(options) {
  const localizedFailures = findLocalizedDocLinkFailures(options);
  const routeFailures = findMissingInternalDocRouteFailures(options);
  let exitCode = 0;

  if (localizedFailures.length > 0) {
    console.error('[check-localized-doc-links] Localized docs must not link to /docs without a locale prefix.');
    for (const failure of localizedFailures) {
      console.error(`- ${failure.file}:${failure.line} (${failure.label}) -> ${failure.value}`);
    }
    exitCode = 1;
  }

  if (routeFailures.length > 0) {
    console.error('[check-localized-doc-links] Internal docs links must point to existing docs routes.');
    for (const failure of routeFailures) {
      console.error(`- ${failure.file}:${failure.line} (${failure.label}) -> ${failure.value}`);
    }
    exitCode = 1;
  }

  if (exitCode === 0) {
    console.log('[check-localized-doc-links] OK');
  }

  return exitCode;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  process.exitCode = runCheck();
}
