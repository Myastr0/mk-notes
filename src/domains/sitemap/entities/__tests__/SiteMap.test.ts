import { SiteMap } from '../SiteMap';
import { TreeNode } from '../TreeNode';

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

      // When all files share the same directory, index.md becomes the root content
      expect(siteMap.root.filepath).toBe('folder1/index.md');
      expect(siteMap.root.children).toHaveLength(1);

      const otherChild = siteMap.root.children[0];
      expect(otherChild.name).toBe('other.md');
      expect(otherChild.filepath).toBe('folder1/other.md');
      expect(otherChild.children).toHaveLength(0);
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

      // Any index.md found becomes root content (docs/index.md gets picked up first)
      expect(siteMap.root.filepath).toBe('docs/index.md');

      // Should have the remaining files as children
      expect(siteMap.root.children).toHaveLength(3);

      const indexChild = siteMap.root.children.find(child => child.name === 'index.md');
      const srcChild = siteMap.root.children.find(child => child.name === 'src');
      const guideChild = siteMap.root.children.find(child => child.name === 'guide.md');

      expect(indexChild?.filepath).toBe('index.md');
      expect(srcChild?.filepath).toBe('src/README.md');
      expect(guideChild?.filepath).toBe('docs/guide.md');
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

  describe('flatten', () => {
    it('should return a new SiteMap instance', () => {
      const siteMap = SiteMap.buildFromFilePaths(['file1.md', 'file2.md']);
      const flattened = siteMap.flatten();

      expect(flattened).toBeInstanceOf(SiteMap);
      expect(flattened).not.toBe(siteMap);
    });

    it('should flatten a simple tree structure', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'folder1/file1.md',
        'folder1/file2.md',
      ]);

      const flattened = siteMap.flatten();

      // Root should have: root copy + flattened children
      expect(flattened.root.children.length).toBeGreaterThan(0);
      
      // The root copy should be first
      const rootCopy = flattened.root.children[0];
      expect(rootCopy.id).toBe(siteMap.root.id);
      expect(rootCopy.name).toBe(siteMap.root.name);
      expect(rootCopy.filepath).toBe(siteMap.root.filepath);
      expect(rootCopy.children).toEqual([]);
    });

    it('should flatten nested folder structure', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'level1/level2/level3/file1.md',
        'level1/level2/file2.md',
        'level1/file3.md',
      ]);

      const flattened = siteMap.flatten();

      // All files should be direct children of root (after root copy)
      const childrenAfterRoot = flattened.root.children.slice(1);
      
      // Should have root copy + all flattened descendants
      expect(flattened.root.children.length).toBeGreaterThan(1);
      
      // Verify root copy exists
      expect(flattened.root.children[0].id).toBe(siteMap.root.id);
    });

    it('should preserve filepaths in flattened structure', () => {
      const filePaths = [
        'docs/getting-started.md',
        'docs/advanced/features.md',
        'docs/advanced/configuration.md',
      ];

      const siteMap = SiteMap.buildFromFilePaths(filePaths);
      const flattened = siteMap.flatten();

      // Collect all filepaths from flattened structure
      const collectFilepaths = (node: TreeNode): string[] => {
        const paths: string[] = [];
        if (node.filepath) {
          paths.push(node.filepath);
        }
        node.children.forEach((child) => {
          paths.push(...collectFilepaths(child));
        });
        return paths;
      };

      const flattenedPaths = collectFilepaths(flattened.root);
      
      // All original filepaths should be present
      filePaths.forEach((path) => {
        expect(flattenedPaths).toContain(path);
      });
    });

    it('should handle empty sitemap', () => {
      const siteMap = SiteMap.buildFromFilePaths([]);
      const flattened = siteMap.flatten();

      expect(flattened.root.children).toHaveLength(1); // Only root copy
      expect(flattened.root.children[0].id).toBe(siteMap.root.id);
    });

    it('should not modify the original sitemap', () => {
      const filePaths = ['folder1/file1.md', 'folder1/file2.md'];
      const siteMap = SiteMap.buildFromFilePaths(filePaths);
      const originalRootChildrenCount = siteMap.root.children.length;

      const flattened = siteMap.flatten();

      // Original should remain unchanged
      expect(siteMap.root.children.length).toBe(originalRootChildrenCount);
      
      // Flattened should have different structure
      expect(flattened.root.children.length).not.toBe(originalRootChildrenCount);
    });

    it('should set correct parent references in flattened structure', () => {
      const siteMap = SiteMap.buildFromFilePaths([
        'folder1/file1.md',
        'folder1/subfolder/file2.md',
      ]);

      const flattened = siteMap.flatten();

      // All children should have root as parent
      const verifyParent = (node: TreeNode) => {
        node.children.forEach((child) => {
          expect(child.parent).toBe(node);
          verifyParent(child);
        });
      };

      verifyParent(flattened.root);
    });
  });
});
