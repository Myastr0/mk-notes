import { serializeInPlainText } from '../plainText.serializer';
import { SiteMap } from '../../entities/SiteMap';

describe('Plain Text Serializer', () => {
  it('should serialize an empty SiteMap', () => {
    const siteMap = SiteMap.buildFromFilePaths([]);

    const result = serializeInPlainText(siteMap);

    expect(result).toBe('├─  (Your parent Notion Page)\n');
  });

  it('should serialize a SiteMap with children', () => {
    const siteMap = SiteMap.buildFromFilePaths(['file1.md', 'file2.md']);

    const result = serializeInPlainText(siteMap);

    expect(result).toBe(
      '├─  (Your parent Notion Page)\n' +
      '│   ├─ file1.md (file1.md)\n' +
      '│   ├─ file2.md (file2.md)\n'
    );
  });

  it('should serialize a SiteMap with a nested structure', () => {
    const siteMap = SiteMap.buildFromFilePaths([
      'parent/child1.md',
      'parent/subfolder/child2.md'
    ]);

    const result = serializeInPlainText(siteMap);

    expect(result).toBe(
      '├─  (Your parent Notion Page)\n' +
      '│   ├─ parent/child1.md (child1.md)\n' +
      '│   ├─ parent/subfolder/child2.md (subfolder)\n'
    );
  });

  it('should handle deep nested structures', () => {
    const siteMap = SiteMap.buildFromFilePaths([
      'folder1/file1.md',
      'folder1/subfolder/file2.md',
      'folder1/subfolder/deeper/file3.md'
    ]);

    const result = serializeInPlainText(siteMap);

    expect(result).toBe(
      '├─  (Your parent Notion Page)\n' +
      '│   ├─ folder1/file1.md (file1.md)\n' +
      '│   ├─ folder1/subfolder/deeper/file3.md (subfolder)\n' +
      '│   │   ├─ folder1/subfolder/file2.md (file2.md)\n'
    );
  });

  it('should handle files with same names in different folders', () => {
    const siteMap = SiteMap.buildFromFilePaths([
      'folder1/index.md',
      'folder2/index.md'
    ]);

    const result = serializeInPlainText(siteMap);

    // When index.md becomes root content, only remaining files appear as children
    expect(result).toBe(
      '├─  (Your parent Notion Page)\n' +
      '│   ├─ folder2/index.md (folder2)\n'
    );
  });

  it('should handle files with different names in different folders', () => {
    const siteMap = SiteMap.buildFromFilePaths([
      'folder1/file1.md',
      'folder2/file2.md'
    ]);

    const result = serializeInPlainText(siteMap);

    expect(result).toBe(
      '├─  (Your parent Notion Page)\n' +
      '│   ├─ folder1/file1.md (folder1)\n' +
      '│   ├─ folder2/file2.md (folder2)\n'
    );
  });
});
