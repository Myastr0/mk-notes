import { SiteMap } from './SiteMap';

describe('SiteMap', () => {
  describe('buildFromFilePaths', () => {
    it('should create an empty sitemap when no files provided', () => {
      const siteMap = SiteMap.buildFromFilePaths([]);
      expect(siteMap.root.children).toHaveLength(0);
    });

    it('should build a flat structure for files in root', () => {
      const siteMap = SiteMap.buildFromFilePaths(['file1.md', 'file2.md']);

      expect(siteMap.root.children).toHaveLength(2);
      expect(siteMap.root.children[0].name).toBe('file1.md');
      expect(siteMap.root.children[1].name).toBe('file2.md');
    });

    it('should handle nested folder structure', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'folder1/file1.md',
        'folder1/subfolder/file2.md'
      ]);

      const folder1 = siteMap.root.children[0];
      expect(folder1.name).toBe('file1.md');
      expect(folder1.children).toHaveLength(0);

      const folder1Subfolder = siteMap.root.children[1];
      expect(folder1Subfolder.name).toBe('subfolder');
      expect(folder1Subfolder.children).toHaveLength(0);
    });

    it('should handle index.md files correctly', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'folder1/index.md',
        'folder1/other.md'
      ]);

      const folder1 = siteMap.root.children[0];
      expect(folder1.name).toBe('index.md');
      expect(folder1.filepath).toBe('folder1/index.md');
      expect(folder1.children).toHaveLength(0);

      const folder1Other = siteMap.root.children[1];
      expect(folder1Other.name).toBe('other.md');
      expect(folder1Other.filepath).toBe('folder1/other.md');
      expect(folder1Other.children).toHaveLength(0);
    });

    it('should remove useless intermediate nodes', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'folder1/subfolder/file1.md'
      ]);

      expect(siteMap.root.children[0].name).toBe('file1.md');
      expect(siteMap.root.children[0].children.length).toBe(0);
    });

    it('should handle root-level index.md files', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'index.md',
        'folder1/file1.md',
        'folder2/file2.md'
      ]);

      // Root should have the index.md content
      expect(siteMap.root.filepath).toBe('index.md');
      expect(siteMap.root.name).toBe('root');

      // Children should be the folders (first-file rule applied)
      expect(siteMap.root.children).toHaveLength(2);
      expect(siteMap.root.children[0].name).toBe('folder1');
      expect(siteMap.root.children[0].filepath).toBe('folder1/file1.md');
      expect(siteMap.root.children[1].name).toBe('folder2');
      expect(siteMap.root.children[1].filepath).toBe('folder2/file2.md');
    });

    it('should prioritize root-level index.md over other files', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'README.md',
        'index.md',
        'folder1/file1.md'
      ]);

      // Root should use index.md, not README.md
      expect(siteMap.root.filepath).toBe('index.md');

      // README.md should appear as a child
      const readmeChild = siteMap.root.children.find(child => child.name === 'README.md');
      expect(readmeChild).toBeDefined();
      expect(readmeChild?.filepath).toBe('README.md');
    });

    it('should handle complex structure with root index.md', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'index.md',
        'docs/index.md',
        'docs/guide.md',
        'src/README.md'
      ]);

      // Root should have index.md content
      expect(siteMap.root.filepath).toBe('index.md');

      // docs folder should use its own index.md
      const docsChild = siteMap.root.children.find(child => child.name === 'docs');
      expect(docsChild).toBeDefined();
      expect(docsChild?.filepath).toBe('docs/index.md');

      // docs should have guide.md as child
      expect(docsChild?.children).toHaveLength(1);
      expect(docsChild?.children[0].name).toBe('guide.md');
    });
  });

  describe('fromJSON/toJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const originalSiteMap = SiteMap.buildFromFilePaths([
        'folder1/file1.md',
        'folder1/file2.md'
      ]);

      const json = originalSiteMap.toJSON();
      const deserializedSiteMap = SiteMap.fromJSON(json);

      expect(deserializedSiteMap.root.children[0].name)
        .toBe(originalSiteMap.root.children[0].name);
      expect(deserializedSiteMap.root.children[0].children)
        .toHaveLength(originalSiteMap.root.children[0].children.length);
    });

    it('should throw error for invalid JSON data', () => {
      expect(() => SiteMap.fromJSON({})).toThrow('Invalid data');
    });
  });
});
