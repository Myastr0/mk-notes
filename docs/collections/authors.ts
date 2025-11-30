import { defineCollection } from '@content-collections/core';
import { z } from 'zod';

export const authorSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  page: z.boolean().optional().default(false),
  socials: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
});

export type Author = z.infer<typeof authorSchema>;
export type AuthorWithId = Author & { id: string };
export type AuthorsRecord = Record<string, Author>;

export const authors = defineCollection({
  name: 'authors',
  directory: 'content/blog',
  include: 'authors.yml',
  parser: 'yaml',
  schema: z.record(z.string(), authorSchema),
});

