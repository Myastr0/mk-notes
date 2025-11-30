import { defineConfig } from '@content-collections/core';
import { docs, docsMetas } from './collections/docs';
import { blogs, blogsMetas } from './collections/blogs';
import { authors } from './collections/authors';

export { docs, docsMetas } from './collections/docs';
export { blogs, blogsMetas } from './collections/blogs';
export { authors } from './collections/authors';

export default defineConfig({
  collections: [docs, docsMetas, blogs, blogsMetas, authors],
});
