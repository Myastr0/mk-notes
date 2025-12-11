import { serializeInJson } from '../json.serializer';
import { SiteMap } from '../../entities/SiteMap';

describe('JSON Serializer', () => {
  it('should serialize an empty SiteMap', () => {
    const siteMap = SiteMap.buildFromFilePaths([]);

    const result = serializeInJson(siteMap);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      name: 'Your parent Notion Page',
      id: '',
      children: []
    });
  });

  it('should serialize a SiteMap with children', () => {
    const siteMap = SiteMap.buildFromFilePaths(['file1.md', 'file2.md']);

    const result = serializeInJson(siteMap);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      name: 'Your parent Notion Page',
      id: '',
      children: [
        {
          name: 'file1.md',
          id: 'file1.md',
          children: []
        },
        {
          name: 'file2.md',
          id: 'file2.md',
          children: []
        }
      ]
    });
  });

  it('should serialize a SiteMap with a nested structure', () => {
    const siteMap = SiteMap.buildFromFilePaths([
      'parent/child1.md',
      'parent/subfolder/child2.md'
    ]);

    const result = serializeInJson(siteMap);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      name: 'Your parent Notion Page',
      id: '',
      children: [
        {
          name: 'child1.md',
          id: 'parent/child1.md',
          children: [],
        },
        {
          name: 'subfolder',
          id: 'parent/subfolder/child2.md',
          children: [],
        },
      ]
    });
  });

  it('should format the JSON with 2 spaces indentation', () => {
    const siteMap = SiteMap.buildFromFilePaths(['test.md']);
    const result = serializeInJson(siteMap);
    
    const expectedJson = JSON.stringify({
      name: 'Your parent Notion Page',
      id: '',
      children: [
        {
          name: 'test.md',
          id: 'test.md',
          children: []
        }
      ]
    }, null, 2);

    expect(result).toBe(expectedJson);
  });
}); 