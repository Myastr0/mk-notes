import { FakeFileConverter } from '../../../../../__tests__/__fakes__/elements/fake-converter.repository';
import { FakeDestinationRepository } from '../../../../../__tests__/__fakes__/synchronization/fake-destination.repository';
import { FileFixture } from '../../../../../__tests__/__fixtures__/file.fixture';
import { fakeLogger } from '../../../../../__tests__/__fakes__/logger/fake-logger';
import { FakeNotionPage } from '../../../../../__tests__/__fixtures__/page.fixture';
import { FakeSourceRepository } from '../../../../../__tests__/__fakes__/synchronization/fake-source.repository';
import { PageElement, TextElement } from '../../../../domains/elements';
import { SynchronizeMarkdownToNotion } from '../synchronize-markdown-to-notion.feature';
import { FakeEventLoggerRepository } from '__tests__/__fakes__/event-logs/fake-event-logger.repository';

describe('SynchronizeMarkdownToNotion', () => {
  let synchronizer: SynchronizeMarkdownToNotion<any, any>;
  let sourceRepository: FakeSourceRepository<FileFixture>;
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
      eventLogger: new FakeEventLoggerRepository(),
    });
  });

  describe('execute', () => {
    const validNotionUrl =
      'https://www.notion.so/workspace/Test-Page-12345678901234567890123456789012';
    const defaultArgs = {
      notionParentPageUrl: validNotionUrl,
      path: 'test/path',
      cleanSync: false,
      lockPage: false,
      saveId: false,
      forceNew: false,
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
        .mockResolvedValue(new FileFixture({ content: '# Test' }));
      jest
        .spyOn(destinationRepository, 'createPage')
        .mockResolvedValue(new FakeNotionPage({ pageId: 'new-page-id' }));
      jest
        .spyOn(destinationRepository, 'getObjectType')
        .mockResolvedValue('page');
    });

    it("should check the accessibility of the destination", async () => {
      await synchronizer.execute(defaultArgs);
      expect(
        destinationRepository.destinationIsAccessible
      ).toHaveBeenCalledWith({
        parentObjectId: '12345678901234567890123456789012',
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
      // Return a new PageElement instance for each call to avoid shared state
      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation(() => new PageElement({
          title: 'Test',
          content: [new TextElement({ text: '# Test' })],
        }));
      const updatePageSpy = jest.spyOn(destinationRepository, 'updatePage');

      await synchronizer.execute(defaultArgs);

      expect(sourceRepository.getFilePathList).toHaveBeenCalled();
      expect(sourceRepository.getFile).toHaveBeenCalled();
      expect(elementConverter.convertToElement).toHaveBeenCalled();
      // Without cleanSync, the root file updates the parent page instead of creating a new one
      expect(updatePageSpy).toHaveBeenCalledWith({
        pageId: '12345678901234567890123456789012',
        pageElement: expect.any(PageElement),
      });
    });

    it('should handle the hierarchical structure of files', async () => {
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['parent/file1.md', 'parent/child/file2.md']);

      // Return a new PageElement instance for each call to avoid shared state
      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation(() => new PageElement({
          title: 'Test',
          content: [new TextElement({ text: '# Test' })],
        }));
      const updatePageSpy = jest.spyOn(destinationRepository, 'updatePage');
      const createPageSpy = jest.spyOn(destinationRepository, 'createPage');

      await synchronizer.execute(defaultArgs);

      // Root file uses updatePage to update the parent page
      expect(updatePageSpy).toHaveBeenCalledTimes(1);
      // Child files use createPage - includes both files in the hierarchy
      expect(createPageSpy).toHaveBeenCalledTimes(2);
    });

    it('should prevent content duplication when root index.md exists with child directory content files', async () => {
      // Setup file structure with root index.md and numbered directory structure
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue([
          'index.md',
          '01_Section/00_Root.md',
          '01_Section/01_Subsection.md'
        ]);

      // Mock different content for each file
      const rootContent = new PageElement({
        title: 'Project Documentation',
        content: [new TextElement({ text: 'Welcome to the documentation' })],
      });

      const sectionContent = new PageElement({
        title: 'Section Overview',
        content: [new TextElement({ text: 'This is the main section' })],
      });

      const subsectionContent = new PageElement({
        title: 'Subsection',
        content: [new TextElement({ text: 'Subsection content' })],
      });

      // Mock getFile to return different content based on filepath
      jest
        .spyOn(sourceRepository, 'getFile')
        .mockImplementation(async (args: any) => {
          const path = args.path;
          if (path === 'index.md') {
            return new FileFixture({ content: 'Welcome to the documentation' });
          } else if (path === '01_Section/00_Root.md') {
            return new FileFixture({ content: 'This is the main section' });
          } else if (path === '01_Section/01_Subsection.md') {
            return new FileFixture({ content: 'Subsection content' });
          }
          return new FileFixture({ content: 'Default content' });
        });

      // Mock convertToElement to return appropriate content
      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation((file: any) => {
          const content = file.content;
          if (content.includes('Welcome to the documentation')) {
            return rootContent;
          } else if (content.includes('This is the main section')) {
            return sectionContent;
          } else if (content.includes('Subsection content')) {
            return subsectionContent;
          }
          return new PageElement({ title: 'Default', content: [] });
        });

      const updatePageSpy = jest.spyOn(destinationRepository, 'updatePage');
      const createPageSpy = jest.spyOn(destinationRepository, 'createPage');

      await synchronizer.execute(defaultArgs);

      // Verify that updatePage is called exactly once (for root index.md updating the parent page)
      expect(updatePageSpy).toHaveBeenCalledTimes(1);
      expect(updatePageSpy).toHaveBeenCalledWith({
        pageId: '12345678901234567890123456789012',
        pageElement: rootContent,
      });

      // Verify that createPage is called for child pages (Section and Subsection)
      expect(createPageSpy).toHaveBeenCalledTimes(2);

      // Verify Section page creation
      expect(createPageSpy).toHaveBeenCalledWith({
        pageElement: expect.objectContaining({
          title: 'Section Overview'
        }),
        parentObjectId: '12345678901234567890123456789012',
        parentObjectType: 'page',
      });

      // Verify Subsection page creation
      expect(createPageSpy).toHaveBeenCalledWith({
        pageElement: expect.objectContaining({
          title: 'Subsection'
        }),
        parentObjectId: 'new-page-id', // This should be the Section page ID
        parentObjectType: 'page',
      });
    });

    it('should lock the parent page when lockPage is true and root index.md exists', async () => {
      // Setup file structure with root index.md
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['index.md']);

      const rootContent = new PageElement({
        title: 'Project Documentation',
        content: [new TextElement({ text: 'Welcome to the documentation' })],
      });

      jest
        .spyOn(sourceRepository, 'getFile')
        .mockResolvedValue(new FileFixture({ content: 'Welcome to the documentation' }));

      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockReturnValue(rootContent);

      const setPageLockedStatusSpy = jest.spyOn(destinationRepository, 'setPageLockedStatus');

      await synchronizer.execute({
        ...defaultArgs,
        lockPage: true,
      });

      // Verify that setPageLockedStatus is called with locked status
      expect(setPageLockedStatusSpy).toHaveBeenCalledWith({
        pageId: '12345678901234567890123456789012',
        lockStatus: 'locked',
      });
    });

    it('should not lock the parent page when lockPage is false', async () => {
      // Setup file structure with root index.md
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['index.md']);

      const rootContent = new PageElement({
        title: 'Project Documentation',
        content: [new TextElement({ text: 'Welcome to the documentation' })],
      });

      jest
        .spyOn(sourceRepository, 'getFile')
        .mockResolvedValue(new FileFixture({ content: 'Welcome to the documentation' }));

      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockReturnValue(rootContent);

      const setPageLockedStatusSpy = jest.spyOn(destinationRepository, 'setPageLockedStatus');

      await synchronizer.execute(defaultArgs);

      // Verify that setPageLockedStatus is not called
      expect(setPageLockedStatusSpy).not.toHaveBeenCalled();
    });

    it('should lock child pages when lockPage is true', async () => {
      // Setup file structure with child pages
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['01_Section/00_Root.md', '01_Section/01_Subsection.md']);

      const sectionContent = new PageElement({
        title: 'Section Overview',
        content: [new TextElement({ text: 'This is the main section' })],
      });

      const subsectionContent = new PageElement({
        title: 'Subsection',
        content: [new TextElement({ text: 'Subsection content' })],
      });

      // Mock getFile to return different content based on filepath
      jest
        .spyOn(sourceRepository, 'getFile')
        .mockImplementation(async (args: any) => {
          const path = args.path;
          if (path === '01_Section/00_Root.md') {
            return new FileFixture({ content: 'This is the main section' });
          } else if (path === '01_Section/01_Subsection.md') {
            return new FileFixture({ content: 'Subsection content' });
          }
          return new FileFixture({ content: 'Default content' });
        });

      // Mock convertToElement to return appropriate content
      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation((file: any) => {
          const content = file.content;
          if (content.includes('This is the main section')) {
            return sectionContent;
          } else if (content.includes('Subsection content')) {
            return subsectionContent;
          }
          return new PageElement({ title: 'Default', content: [] });
        });

      const setPageLockedStatusSpy = jest.spyOn(destinationRepository, 'setPageLockedStatus');

      await synchronizer.execute({
        ...defaultArgs,
        lockPage: true,
      });

      // Verify that setPageLockedStatus is called for the parent page and child pages
      // Parent page gets locked after updatePage in synchronizeRootNode
      // Child page gets locked after createPage in synchronizeChildNode
      expect(setPageLockedStatusSpy).toHaveBeenCalledWith({
        pageId: '12345678901234567890123456789012',
        lockStatus: 'locked',
      });
      
      // Verify child page is locked
      expect(setPageLockedStatusSpy).toHaveBeenCalledWith({
        pageId: 'new-page-id',
        lockStatus: 'locked',
      });
    });

    it('should lock both root page and child pages when lockPage is true and root index.md exists with children', async () => {
      // Setup file structure with root index.md and child pages
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue([
          'index.md',
          '01_Section/00_Root.md',
          '01_Section/01_Subsection.md'
        ]);

      const rootContent = new PageElement({
        title: 'Project Documentation',
        content: [new TextElement({ text: 'Welcome to the documentation' })],
      });

      const sectionContent = new PageElement({
        title: 'Section Overview',
        content: [new TextElement({ text: 'This is the main section' })],
      });

      const subsectionContent = new PageElement({
        title: 'Subsection',
        content: [new TextElement({ text: 'Subsection content' })],
      });

      // Mock getFile to return different content based on filepath
      jest
        .spyOn(sourceRepository, 'getFile')
        .mockImplementation(async (args: any) => {
          const path = args.path;
          if (path === 'index.md') {
            return new FileFixture({ content: 'Welcome to the documentation' });
          } else if (path === '01_Section/00_Root.md') {
            return new FileFixture({ content: 'This is the main section' });
          } else if (path === '01_Section/01_Subsection.md') {
            return new FileFixture({ content: 'Subsection content' });
          }
          return new FileFixture({ content: 'Default content' });
        });

      // Mock convertToElement to return appropriate content
      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation((file: any) => {
          const content = file.content;
          if (content.includes('Welcome to the documentation')) {
            return rootContent;
          } else if (content.includes('This is the main section')) {
            return sectionContent;
          } else if (content.includes('Subsection content')) {
            return subsectionContent;
          }
          return new PageElement({ title: 'Default', content: [] });
        });

      const setPageLockedStatusSpy = jest.spyOn(destinationRepository, 'setPageLockedStatus');

      await synchronizer.execute({
        ...defaultArgs,
        lockPage: true,
      });

      // Verify that setPageLockedStatus is called for root page and child pages
      expect(setPageLockedStatusSpy).toHaveBeenCalledTimes(3);
      
      // Verify root page is locked
      expect(setPageLockedStatusSpy).toHaveBeenCalledWith({
        pageId: '12345678901234567890123456789012',
        lockStatus: 'locked',
      });
      
      // Verify child pages are locked (both should use 'new-page-id' as they're created sequentially)
      expect(setPageLockedStatusSpy).toHaveBeenCalledWith({
        pageId: 'new-page-id',
        lockStatus: 'locked',
      });
    });

    it('should throw an error when lockPage operation fails', async () => {
      // Setup file structure with root index.md
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['index.md']);

      const rootContent = new PageElement({
        title: 'Project Documentation',
        content: [new TextElement({ text: 'Welcome to the documentation' })],
      });

      jest
        .spyOn(sourceRepository, 'getFile')
        .mockResolvedValue(new FileFixture({ content: 'Welcome to the documentation' }));

      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockReturnValue(rootContent);

      // Mock setPageLockedStatus to throw an error
      jest
        .spyOn(destinationRepository, 'setPageLockedStatus')
        .mockRejectedValue(new Error('Failed to lock page'));

      // The operation should throw an error when lock operation fails
      await expect(synchronizer.execute({
        ...defaultArgs,
        lockPage: true,
      })).rejects.toThrow('Failed to lock page');
    });

    it('should skip root node synchronization when flatten is true', async () => {
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['index.md', 'folder1/file1.md']);

      const rootContent = new PageElement({
        title: 'Root',
        content: [new TextElement({ text: 'Root content' })],
      });

      const childContent = new PageElement({
        title: 'Child',
        content: [new TextElement({ text: 'Child content' })],
      });

      jest
        .spyOn(sourceRepository, 'getFile')
        .mockImplementation(async (args: any) => {
          const path = args.path;
          if (path === 'index.md') {
            return new FileFixture({ content: 'Root content' });
          } else if (path === 'folder1/file1.md') {
            return new FileFixture({ content: 'Child content' });
          }
          return new FileFixture({ content: 'Default content' });
        });

      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation((file: any) => {
          const content = file.content;
          if (content.includes('Root content')) {
            return rootContent;
          } else if (content.includes('Child content')) {
            return childContent;
          }
          return new PageElement({ title: 'Default', content: [] });
        });

      const updatePageSpy = jest.spyOn(destinationRepository, 'updatePage');
      const createPageSpy = jest.spyOn(destinationRepository, 'createPage');

      await synchronizer.execute({
        ...defaultArgs,
        flatten: true,
      });

      // Root node should not be synchronized (no updatePage call)
      expect(updatePageSpy).not.toHaveBeenCalled();
      
      // When flattening, the root copy is created as the first child, then the actual child
      // So we get: root copy (from index.md) + folder1/file1.md = 2 pages
      expect(createPageSpy).toHaveBeenCalledTimes(2);
      // First call should be for the root copy
      expect(createPageSpy).toHaveBeenNthCalledWith(1, {
        pageElement: expect.objectContaining({
          title: 'Root',
        }),
        parentObjectId: '12345678901234567890123456789012',
        parentObjectType: 'page',
      });
      // Second call should be for the child
      expect(createPageSpy).toHaveBeenNthCalledWith(2, {
        pageElement: expect.objectContaining({
          title: 'Child',
        }),
        parentObjectId: '12345678901234567890123456789012',
        parentObjectType: 'page',
      });
    });

    it('should synchronize root node when flatten is false', async () => {
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue(['index.md', 'folder1/file1.md']);

      const rootContent = new PageElement({
        title: 'Root',
        content: [new TextElement({ text: 'Root content' })],
      });

      const childContent = new PageElement({
        title: 'Child',
        content: [new TextElement({ text: 'Child content' })],
      });

      jest
        .spyOn(sourceRepository, 'getFile')
        .mockImplementation(async (args: any) => {
          const path = args.path;
          if (path === 'index.md') {
            return new FileFixture({ content: 'Root content' });
          } else if (path === 'folder1/file1.md') {
            return new FileFixture({ content: 'Child content' });
          }
          return new FileFixture({ content: 'Default content' });
        });

      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation((file: any) => {
          const content = file.content;
          if (content.includes('Root content')) {
            return rootContent;
          } else if (content.includes('Child content')) {
            return childContent;
          }
          return new PageElement({ title: 'Default', content: [] });
        });

      const updatePageSpy = jest.spyOn(destinationRepository, 'updatePage');
      const createPageSpy = jest.spyOn(destinationRepository, 'createPage');

      await synchronizer.execute({
        ...defaultArgs,
        flatten: false,
      });

      // Root node should be synchronized (updatePage call)
      expect(updatePageSpy).toHaveBeenCalledTimes(1);
      expect(updatePageSpy).toHaveBeenCalledWith({
        pageId: '12345678901234567890123456789012',
        pageElement: rootContent,
      });
      
      // Child should be created under root
      expect(createPageSpy).toHaveBeenCalledTimes(1);
    });

    it('should flatten SiteMap before synchronization when flatten is true', async () => {
      jest
        .spyOn(sourceRepository, 'getFilePathList')
        .mockResolvedValue([
          'folder1/file1.md',
          'folder1/subfolder/file2.md',
        ]);

      const file1Content = new PageElement({
        title: 'File 1',
        content: [new TextElement({ text: 'File 1 content' })],
      });

      const file2Content = new PageElement({
        title: 'File 2',
        content: [new TextElement({ text: 'File 2 content' })],
      });

      jest
        .spyOn(sourceRepository, 'getFile')
        .mockImplementation(async (args: any) => {
          const path = args.path;
          if (path === 'folder1/file1.md') {
            return new FileFixture({ content: 'File 1 content' });
          } else if (path === 'folder1/subfolder/file2.md') {
            return new FileFixture({ content: 'File 2 content' });
          }
          return new FileFixture({ content: 'Default content' });
        });

      jest
        .spyOn(elementConverter, 'convertToElement')
        .mockImplementation((file: any) => {
          const content = file.content;
          if (content.includes('File 1 content')) {
            return file1Content;
          } else if (content.includes('File 2 content')) {
            return file2Content;
          }
          return new PageElement({ title: 'Default', content: [] });
        });

      const createPageSpy = jest.spyOn(destinationRepository, 'createPage');

      await synchronizer.execute({
        ...defaultArgs,
        flatten: true,
      });

      // When flattening, the root copy is created as the first child, then all flattened files
      // So we get: root copy (empty) + folder1/file1.md + folder1/subfolder/file2.md = 3 pages
      expect(createPageSpy).toHaveBeenCalledTimes(3);
      // First call should be for the root copy
      expect(createPageSpy).toHaveBeenNthCalledWith(1, {
        pageElement: expect.any(PageElement),
        parentObjectId: '12345678901234567890123456789012',
        parentObjectType: 'page',
      });
      // Second call should be for File 1
      expect(createPageSpy).toHaveBeenNthCalledWith(2, {
        pageElement: expect.objectContaining({
          title: 'File 1',
        }),
        parentObjectId: '12345678901234567890123456789012',
        parentObjectType: 'page',
      });
      // Third call should be for File 2
      expect(createPageSpy).toHaveBeenNthCalledWith(3, {
        pageElement: expect.objectContaining({
          title: 'File 2',
        }),
        parentObjectId: '12345678901234567890123456789012',
        parentObjectType: 'page',
      });
    });
  });
});
