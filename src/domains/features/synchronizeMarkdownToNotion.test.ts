import { FakeFileConverter } from '../../../__tests__/__fakes__/fakeConverter.repository';
import { FakeDestinationRepository } from '../../../__tests__/__fakes__/fakeDestination.repository';
import { FakeFile } from '../../../__tests__/__fakes__/fakeFile';
import { fakeLogger } from '../../../__tests__/__fakes__/fakeLogger';
import { FakeNotionPage } from '../../../__tests__/__fakes__/fakePage';
import { FakeSourceRepository } from '../../../__tests__/__fakes__/fakeSource.repository';
import { PageElement, TextElement } from '../elements';
import { SynchronizeMarkdownToNotion } from './synchronizeMarkdownToNotion';

describe('SynchronizeMarkdownToNotion', () => {
  let synchronizer: SynchronizeMarkdownToNotion<any, any>;
  let sourceRepository: FakeSourceRepository<FakeFile>;
  let destinationRepository: FakeDestinationRepository<FakeNotionPage>;
  let elementConverter: FakeFileConverter;

  beforeEach(() => {
    sourceRepository = new FakeSourceRepository();
    destinationRepository = new FakeDestinationRepository();
    elementConverter = new FakeFileConverter({
      logger: fakeLogger,
      htmlParser: {} as any,
      markdownParser: {} as any,
    });

    synchronizer = new SynchronizeMarkdownToNotion({
      sourceRepository,
      destinationRepository,
      elementConverter,
      logger: fakeLogger,
    });
  });

  describe('execute', () => {
    const validNotionUrl =
      'https://www.notion.so/workspace/Test-Page-12345678901234567890123456789012';
    const defaultArgs = {
      notionParentPageUrl: validNotionUrl,
      path: 'test/path',
    };

    beforeEach(() => {
      jest
        .spyOn(destinationRepository, 'destinationIsAccessible')
        .mockResolvedValue(true);
      jest
        .spyOn(sourceRepository, 'sourceIsAccessible')
        .mockResolvedValue(true);
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['file1.md']);
      jest
        .spyOn(sourceRepository, 'getFile')
        .mockResolvedValue(new FakeFile({ content: '# Test' }));
      jest
        .spyOn(destinationRepository, 'createPage')
        .mockResolvedValue(new FakeNotionPage({ pageId: 'new-page-id' }));
    });

    it("should check the accessibility of the destination", async () => {
      await synchronizer.execute(defaultArgs);
      expect(
        destinationRepository.destinationIsAccessible
      ).toHaveBeenCalledWith({
        parentPageId: 'Test-Page-12345678901234567890123456789012',
      });
    });

    it("should throw an error if the destination is not accessible", async () => {
      jest
        .spyOn(destinationRepository, 'destinationIsAccessible')
        .mockResolvedValue(false);
      await expect(synchronizer.execute(defaultArgs)).rejects.toThrow(
        'Destination is not accessible'
      );
    });

    it("should check the accessibility of the source", async () => {
      await synchronizer.execute(defaultArgs);
      expect(sourceRepository.sourceIsAccessible).toHaveBeenCalled();
    });

    it("should throw an error if the source is not accessible", async () => {
      jest
        .spyOn(sourceRepository, 'sourceIsAccessible')
        .mockRejectedValue(new Error('Source error'));
      await expect(synchronizer.execute(defaultArgs)).rejects.toThrow(
        'Source is not accessible'
      );
    });

    it('should synchronize the files correctly', async () => {
      const pageElement = new PageElement({
        title: 'Test',
        content: [new TextElement({ text: '# Test' })],
      });
      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockReturnValue(pageElement);

      await synchronizer.execute(defaultArgs);

      expect(sourceRepository.getFilePathList).toHaveBeenCalled();
      expect(sourceRepository.getFile).toHaveBeenCalled();
      expect(elementConverter.convertToElement).toHaveBeenCalled();
      expect(destinationRepository.createPage).toHaveBeenCalledWith({
        pageElement: expect.any(PageElement),
        parentPageId: 'Test-Page-12345678901234567890123456789012',
        filePath: 'file1.md',
      });
    });

    it('should handle the hierarchical structure of files', async () => {
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['parent/file1.md', 'parent/child/file2.md']);

      const pageElement = new PageElement({
        title: 'Test',
        content: [new TextElement({ text: '# Test' })],
      });
      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockReturnValue(pageElement);

      await synchronizer.execute(defaultArgs);

      expect(destinationRepository.createPage).toHaveBeenCalledTimes(2);
    });
  });
});
