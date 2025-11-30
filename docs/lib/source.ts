import {
  allDocs,
  allDocsMetas,
  allBlogs,
  allBlogsMetas,
  allAuthors,
} from 'content-collections';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from '@fumadocs/content-collections';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import type { AuthorWithId, AuthorsRecord } from '@/collections/authors';

export const blog = loader({
  baseUrl: '/blog',
  source: createMDXSource(allBlogs, allBlogsMetas),
});

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(allDocs, allDocsMetas),
  icon(icon) {
    if (!icon) {
      // You may set a default icon
      return;
    }
    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});

/**
 * Get the authors record from the authors.yml file
 * Returns a record where keys are author IDs and values are author data
 */
export function getAuthorsRecord(): AuthorsRecord {
  // allAuthors is an array with a single element (the parsed authors.yml)
  return allAuthors[0] ?? {};
}

/**
 * Get all authors as an array with their IDs
 */
export function getAllAuthors(): AuthorWithId[] {
  const record = getAuthorsRecord();
  return Object.entries(record).map(([id, author]) => ({
    id,
    ...author,
  }));
}

/**
 * Get a single author by their ID
 */
export function getAuthorById(id: string): AuthorWithId | null {
  const record = getAuthorsRecord();
  const author = record[id];
  if (!author) return null;
  return { id, ...author };
}