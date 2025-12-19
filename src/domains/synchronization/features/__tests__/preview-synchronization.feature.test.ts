import { FileFixture } from '../../../../../__tests__/__fixtures__/file.fixture';
import { FakeSourceRepository } from '../../../../../__tests__/__fakes__/synchronization/fake-source.repository';
import { SiteMap } from '../../../sitemap';
import { PreviewSynchronization } from '../preview-synchronization.feature';
import { FakeEventLoggerRepository } from '__tests__/__fakes__/event-logs/fake-event-logger.repository';

describe('PreviewSynchronization', () => {
  let previewSync: PreviewSynchronization<any>;
  let sourceRepository: FakeSourceRepository<FileFixture>;

  beforeEach(() => {
    sourceRepository = new FakeSourceRepository();
    previewSync = new PreviewSynchronization({ sourceRepository, eventLogger: new FakeEventLoggerRepository() });
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

    it('should flatten the SiteMap when flatten option is true', async () => {
      const filePaths = ['folder1/file1.md', 'folder1/subfolder/file2.md'];
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(filePaths);

      const flattenSpy = jest.spyOn(SiteMap.prototype, 'flatten');
      const buildFromFilePathsSpy = jest.spyOn(SiteMap, 'buildFromFilePaths');

      await previewSync.execute({ path: 'test/path' }, { flatten: true });

      expect(buildFromFilePathsSpy).toHaveBeenCalledWith(filePaths);
      expect(flattenSpy).toHaveBeenCalled();
    });

    it('should not flatten the SiteMap when flatten option is false', async () => {
      const filePaths = ['folder1/file1.md', 'folder1/subfolder/file2.md'];
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(filePaths);

      const resultNotFlattened = await previewSync.execute(
        { path: 'test/path' },
        { format: 'json', flatten: false }
      );

      const resultFlattened = await previewSync.execute(
        { path: 'test/path' },
        { format: 'json', flatten: true }
      );

      const parsedNotFlattened = JSON.parse(resultNotFlattened);
      const parsedFlattened = JSON.parse(resultFlattened);

      // When flattened, there should be a root copy as the first child
      // When not flattened, there shouldn't be a root copy
      // The flattened version should have more direct children (root copy + all flattened files)
      expect(parsedFlattened.children.length).toBeGreaterThan(
        parsedNotFlattened.children.length
      );
    });

    it('should not flatten the SiteMap when flatten option is not provided', async () => {
      const filePaths = ['folder1/file1.md', 'folder1/subfolder/file2.md'];
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(filePaths);

      const resultNotFlattened = await previewSync.execute(
        { path: 'test/path' },
        { format: 'json' }
      );

      const resultFlattened = await previewSync.execute(
        { path: 'test/path' },
        { format: 'json', flatten: true }
      );

      const parsedNotFlattened = JSON.parse(resultNotFlattened);
      const parsedFlattened = JSON.parse(resultFlattened);

      // When flattened, there should be more direct children
      expect(parsedFlattened.children.length).toBeGreaterThan(
        parsedNotFlattened.children.length
      );
    });

    it('should serialize flattened SiteMap correctly in JSON format', async () => {
      const filePaths = ['folder1/file1.md', 'folder1/subfolder/file2.md'];
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(filePaths);

      const result = await previewSync.execute(
        { path: 'test/path' },
        { format: 'json', flatten: true }
      );

      const parsedResult = JSON.parse(result);
      expect(parsedResult).toHaveProperty('children');
      // Flattened structure should have root copy + flattened children
      expect(parsedResult.children.length).toBeGreaterThan(0);
    });
  });
});
