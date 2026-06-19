import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: { files: ['**/*.mdx'] },
});

export const forEveryone = defineDocs({
  dir: 'content/for-everyone',
  docs: { files: ['**/*.mdx'] },
});

export default defineConfig();
