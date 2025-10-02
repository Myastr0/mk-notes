import { defineCollection, defineConfig } from '@content-collections/core';
import {
  frontmatterSchema,
  metaSchema,
  transformMDX,
} from '@fumadocs/content-collections/configuration';
import {remarkNpm} from 'fumadocs-core/mdx-plugins';

const docs = defineCollection({
  name: 'docs',
  directory: 'content/docs',
  include: '**/*.mdx',
  schema: frontmatterSchema,
  transform: (document, context) =>
    transformMDX(document, context, {
      remarkPlugins: [remarkNpm],
    }),
});

const metas = defineCollection({
  name: 'meta',
  directory: 'content/docs',
  include: '**/meta.json',
  parser: 'json',
  schema: metaSchema,
});

export default defineConfig({
  collections: [docs, metas],
});
