import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const configDir = dirname(fileURLToPath(import.meta.url));

function resolveTurbopackRoot(startDir) {
  let current = startDir;

  while (true) {
    if (existsSync(join(current, 'node_modules/next/package.json'))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      return startDir;
    }

    current = parent;
  }
}

/** @type {import('next').NextConfig} */
const config = {
  turbopack: {
    root: resolveTurbopackRoot(configDir),
  },
  allowedDevOrigins: [
    'home-server',
    'home-server.tail1e211e.ts.net',
    '100.123.228.51',
    '192.168.0.61',
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default withMDX(config);
