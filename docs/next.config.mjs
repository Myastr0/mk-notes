import { withContentCollections } from '@content-collections/next';

/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: 'export',
  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,
};

export default withContentCollections(config);
