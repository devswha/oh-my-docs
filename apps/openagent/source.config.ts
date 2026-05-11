import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: { files: ['**/*.mdx'] },
});

export default defineConfig();
