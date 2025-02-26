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