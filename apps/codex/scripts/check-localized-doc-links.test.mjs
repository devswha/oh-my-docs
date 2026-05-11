import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import {
  buildDocRouteSet,
  findLocalizedDocLinkFailures,
  findMissingInternalDocRouteFailures,
  lineNumberAt,
} from './check-localized-doc-links.mjs';

function tempDocsFixture() {
  const root = mkdtempSync(join(tmpdir(), 'localized-doc-links-'));
  const docs = join(root, 'content', 'docs');
  mkdirSync(docs, { recursive: true });
  return {
    root,
    docs,
    rootDir: pathToFileURL(`${root}/`),
    docsDir: pathToFileURL(`${docs}/`),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function writeFixturePage(fixture, relativePath, content = '---\ntitle: Test\ndescription: Test\n---\n') {
  const target = join(fixture.docs, relativePath);
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, content);
}

test('lineNumberAt reports one-based line numbers', () => {
  assert.equal(lineNumberAt('first\nsecond\nthird', 0), 1);
  assert.equal(lineNumberAt('first\nsecond\nthird', 6), 2);
  assert.equal(lineNumberAt('first\nsecond\nthird', 13), 3);
});

test('localized docs allow locale-prefixed links and ignore English source docs', () => {
  const fixture = tempDocsFixture();
  try {
    writeFixturePage(fixture, 'index.ko.mdx', '[설정](/ko/docs/reference/configuration)\n<Card href="/ko/docs/skills" />\n');
    writeFixturePage(fixture, 'reference/configuration.ko.mdx');
    writeFixturePage(fixture, 'skills/index.ko.mdx');
    writeFileSync(join(fixture.docs, 'meta.ko.json'), '{"root":"/ko/docs"}\n');
    writeFixturePage(fixture, 'index.mdx', '[Configuration](/docs/reference/configuration)\n');

    assert.deepEqual(
      findLocalizedDocLinkFailures({ docsDir: fixture.docsDir, rootDir: fixture.rootDir }),
      [],
    );
  } finally {
    fixture.cleanup();
  }
});

test('localized docs report unprefixed /docs links with file, line, label, and full value', () => {
  const fixture = tempDocsFixture();
  try {
    mkdirSync(join(fixture.docs, 'reference'), { recursive: true });
    writeFixturePage(
      fixture,
      'reference/broken.ko.mdx',
      [
        '[정상](/ko/docs/reference)',
        '[영문 루트](/docs/reference)',
        '<Card href="/docs/skills" />',
        "const support = '/docs/support'",
        '[앵커](/docs#top)',
        '[비문서](/docs-old)',
      ].join('\n'),
    );

    assert.deepEqual(findLocalizedDocLinkFailures({ docsDir: fixture.docsDir, rootDir: fixture.rootDir }), [
      {
        file: 'content/docs/reference/broken.ko.mdx',
        line: 2,
        label: 'markdown link',
        value: '/docs/reference',
      },
      {
        file: 'content/docs/reference/broken.ko.mdx',
        line: 5,
        label: 'markdown link',
        value: '/docs#top',
      },
      {
        file: 'content/docs/reference/broken.ko.mdx',
        line: 3,
        label: 'double-quoted path',
        value: '/docs/skills',
      },
      {
        file: 'content/docs/reference/broken.ko.mdx',
        line: 4,
        label: 'single-quoted path',
        value: '/docs/support',
      },
    ]);
  } finally {
    fixture.cleanup();
  }
});

test('buildDocRouteSet derives routes from default and localized MDX files', () => {
  const fixture = tempDocsFixture();
  try {
    writeFixturePage(fixture, 'index.mdx');
    writeFixturePage(fixture, 'skills/utility/index.ko.mdx');
    writeFixturePage(fixture, 'skills/utility/doctor.zh.mdx');

    assert.deepEqual([...buildDocRouteSet({ docsDir: fixture.docsDir })].sort(), [
      '/docs',
      '/ko/docs',
      '/ko/docs/skills/utility',
      '/ja/docs',
      '/zh/docs',
      '/zh/docs/skills/utility/doctor',
    ].sort());
  } finally {
    fixture.cleanup();
  }
});

test('internal docs links must target existing generated docs routes', () => {
  const fixture = tempDocsFixture();
  try {
    writeFixturePage(fixture, 'index.mdx', '[OK](/docs/reference/configuration)\n[Missing](/docs/missing)\n');
    writeFixturePage(fixture, 'reference/configuration.mdx');
    writeFixturePage(fixture, 'reference/configuration.ko.mdx', '<Card href="/ko/docs/reference/configuration" />\n<Card href="/ko/docs/missing" />\n');

    assert.deepEqual(
      findMissingInternalDocRouteFailures({ docsDir: fixture.docsDir, rootDir: fixture.rootDir }),
      [
        {
          file: 'content/docs/index.mdx',
          line: 2,
          label: 'markdown link',
          value: '/docs/missing',
        },
        {
          file: 'content/docs/reference/configuration.ko.mdx',
          line: 2,
          label: 'double-quoted path',
          value: '/ko/docs/missing',
        },
      ],
    );
  } finally {
    fixture.cleanup();
  }
});
