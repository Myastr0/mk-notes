import { FakeFile } from '../../../__tests__/__fakes__/fakeFile';
import { FakeSourceRepository } from '../../../__tests__/__fakes__/fakeSource.repository';
import { SiteMap } from '../sitemap';
import { PreviewSynchronization } from './previewSynchronization';

describe('PreviewSynchronization', () => {
  let previewSync: PreviewSynchronization<any>;
  let sourceRepository: FakeSourceRepository<FakeFile>;

  beforeEach(() => {
    sourceRepository = new FakeSourceRepository();
    previewSync = new PreviewSynchronization({ sourceRepository });
  });

  describe('execute', () => {
    it("should check the accessibility of the source before synchronization", async () => {
      const sourceIsAccessibleSpy = jest.spyOn(
        sourceRepository,
        'sourceIsAccessible'
      );
      const args = { path: 'test/path' };

      await previewSync.execute(args);

      expect(sourceIsAccessibleSpy).toHaveBeenCalledWith(args);
    });

    it("should throw an error if the source is not accessible", async () => {
      jest
        .spyOn(sourceRepository, 'sourceIsAccessible')
        .mockRejectedValue(new Error('Source inaccessible'));
      const args = { path: 'test/path' };

      await expect(previewSync.execute(args)).rejects.toThrow(
        'Source is not accessible'
      );
    });

    it('should use the plainText format by default', async () => {
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['file1.md', 'file2.md']);
      const result = await previewSync.execute({ path: 'test/path' });

      expect(result).toContain('file1.md');
      expect(result).toContain('file2.md');
    });

    it('should serialize to JSON when the JSON format is specified', async () => {
      const filePaths = ['file1.md', 'file2.md'];
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(filePaths);

      const result = await previewSync.execute(
        { path: 'test/path' },
        { format: 'json' }
      );
      const parsedResult = JSON.parse(result);

      expect(parsedResult).toHaveProperty('children');
      expect(parsedResult.children).toHaveLength(2);
      expect(parsedResult.children[0]).toEqual({
        id: 'file1.md',
        name: 'file1.md',
        children: [],
      });
      expect(parsedResult.children[1]).toEqual({
        id: 'file2.md',
        name: 'file2.md',
        children: [],
      });
    });

    it('should throw an error for an invalid format', async () => {
      await expect(
        // @ts-expect-error Testing invalid format
        previewSync.execute({ path: 'test/path' }, { format: 'invalid' })
      ).rejects.toThrow('Invalid serialization format');
    });

    it('should correctly build the SiteMap from file paths', async () => {
      const filePaths = ['dir1/file1.md', 'dir2/file2.md'];
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(filePaths);

      const buildFromFilePathsSpy = jest.spyOn(SiteMap, 'buildFromFilePaths');

      await previewSync.execute({ path: 'test/path' });

      expect(buildFromFilePathsSpy).toHaveBeenCalledWith(filePaths);
    });

    it('should flatten the sitemap when flat option is true', async () => {
      // Use a structure that prevents root collapsing of the directory
      // root -> section, other.md
      // section -> child1.md, child2.md
      // section will consume child1.md
      // child2.md will remain as child of section
      const filePaths = ['section/child1.md', 'section/child2.md', 'other.md'];
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(filePaths);

      // When flattened, children should be at root level
      const result = await previewSync.execute(
        { path: 'test/path' },
        { format: 'json', flat: true }
      );
      
      const parsedResult = JSON.parse(result);
      
      const childrenNames = parsedResult.children.map((c: any) => c.name);
      // 'section' node exists (having consumed child1.md)
      expect(childrenNames).toContain('section');
      // 'child2.md' node exists (was nested, now flat)
      expect(childrenNames).toContain('child2.md');
      // 'other.md' node exists
      expect(childrenNames).toContain('other.md');
      expect(parsedResult.children.length).toBe(3);
    });
  });
});
