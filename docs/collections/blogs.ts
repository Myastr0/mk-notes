import { z } from 'zod';
import { defineCollection } from '@content-collections/core';
import {
  frontmatterSchema,
  metaSchema,
  transformMDX,
} from '@fumadocs/content-collections/configuration';
import { remarkNpm } from 'fumadocs-core/mdx-plugins';

export const blogs = defineCollection({
  name: 'blogs',
  directory: 'content/blog',
  include: '**/*.mdx',
  schema: frontmatterSchema.extend({
    author: z.string(),
    date: z.string().date().or(z.date()),
  }),
  transform: (document, context) => {
    return transformMDX(document, context, {
      remarkPlugins: [remarkNpm],
    });
  },
});

export const blogsMetas = defineCollection({
  name: 'blogsMetas',
  directory: 'content/blog',
  include: '**/meta.json',
  parser: 'json',
  schema: metaSchema,
});

