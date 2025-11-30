import { defineCollection } from '@content-collections/core';
import {
  frontmatterSchema,
  metaSchema,
  transformMDX,
} from '@fumadocs/content-collections/configuration';
import { remarkNpm } from 'fumadocs-core/mdx-plugins';

export const docs = defineCollection({
  name: 'docs',
  directory: 'content/docs',
  include: '**/*.mdx',
  schema: frontmatterSchema,
  transform: (document, context) =>
    transformMDX(document, context, {
      remarkPlugins: [remarkNpm],
    }),
});

export const docsMetas = defineCollection({
  name: 'docsMetas',
  directory: 'content/docs',
  include: '**/meta.json',
  parser: 'json',
  schema: metaSchema,
});

