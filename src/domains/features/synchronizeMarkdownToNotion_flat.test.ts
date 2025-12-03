import { FakeFileConverter } from '../../../__tests__/__fakes__/fakeConverter.repository';
import { FakeDestinationRepository } from '../../../__tests__/__fakes__/fakeDestination.repository';
import { FakeFile } from '../../../__tests__/__fakes__/fakeFile';
import { fakeLogger } from '../../../__tests__/__fakes__/fakeLogger';
import { FakeNotionPage } from '../../../__tests__/__fakes__/fakePage';
import { FakeSourceRepository } from '../../../__tests__/__fakes__/fakeSource.repository';
import { PageElement, TextElement } from '../elements';
import { SynchronizeMarkdownToNotion } from './synchronizeMarkdownToNotion';

describe('SynchronizeMarkdownToNotion - Flat Sync', () => {
  let synchronizer: SynchronizeMarkdownToNotion<any, any>;
  let sourceRepository: FakeSourceRepository<FakeFile>;
  let destinationRepository: FakeDestinationRepository<FakeNotionPage>;
  let elementConverter: FakeFileConverter;

  const databaseId = 'database-id-12345678901234567890123456789012';
  const databaseUrl = `https://www.notion.so/workspace/${databaseId}`;

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

    jest
      .spyOn(destinationRepository, 'destinationIsAccessible')
      .mockResolvedValue(true);
    jest.spyOn(sourceRepository, 'sourceIsAccessible').mockResolvedValue(true);
    jest
      .spyOn(destinationRepository, 'getObjectType')
      .mockResolvedValue('database');
    jest
      .spyOn(destinationRepository, 'createPage')
      .mockResolvedValue(new FakeNotionPage({ pageId: 'new-page-id' }));
    jest
      .spyOn(destinationRepository, 'getDataSourceIdFromDatabaseId')
      .mockResolvedValue('datasource-id');
    jest
      .spyOn(destinationRepository, 'deletePagesInDatabaseByInternalId')
      .mockResolvedValue(undefined);
  });

  it('should create all files as direct children of the database when flat is true', async () => {
    // Setup hierarchical file structure
    jest
      .spyOn(sourceRepository, 'getFilePathList')
      .mockResolvedValue([
        'parent.md',
        'child/child.md',
        'child/grandchild/grandchild.md',
      ]);

    const pageElement = new PageElement({
      title: 'Test',
      content: [new TextElement({ text: '# Test' })],
      mkNotesInternalId: 'test-id',
    });

    jest
      .spyOn(sourceRepository, 'getFile')
      .mockResolvedValue(new FakeFile({ content: '# Test' }));
    jest
      .spyOn(elementConverter, 'convertToElement')
      .mockReturnValue(pageElement);

    const createPageSpy = jest.spyOn(destinationRepository, 'createPage');

    await synchronizer.execute({
      notionParentPageUrl: databaseUrl,
      cleanSync: false,
      lockPage: false,
      flat: true,
      path: 'test',
    });

    // Should create 3 pages
    expect(createPageSpy).toHaveBeenCalledTimes(3);

    // All pages should be created with parentObjectId = databaseId and parentObjectType = 'database'
    const calls = createPageSpy.mock.calls;

    for (const call of calls) {
      expect(call[0]).toMatchObject({
        parentObjectId: '12345678901234567890123456789012',
        parentObjectType: 'database',
      });
    }
  });

  it('should respect cleanSync by calling deletePagesInDatabaseByInternalId in flat mode', async () => {
    jest
      .spyOn(sourceRepository, 'getFilePathList')
      .mockResolvedValue(['child.md']);

    const pageElement = new PageElement({
      title: 'Child',
      content: [],
      mkNotesInternalId: 'child-internal-id',
    });

    jest
      .spyOn(sourceRepository, 'getFile')
      .mockResolvedValue(new FakeFile({ content: '' }));
    jest
      .spyOn(elementConverter, 'convertToElement')
      .mockReturnValue(pageElement);

    const deleteSpy = jest.spyOn(
      destinationRepository,
      'deletePagesInDatabaseByInternalId'
    );

    await synchronizer.execute({
      notionParentPageUrl: databaseUrl,
      cleanSync: true,
      lockPage: false,
      flat: true,
      path: 'test',
    });

    expect(deleteSpy).toHaveBeenCalledWith({
      databaseId: '12345678901234567890123456789012',
      mkNotesInternalId: 'child-internal-id',
    });
  });

  it('should throw error if flat option is used with page destination', async () => {
    // Mock destination as a page instead of a database
    jest.spyOn(destinationRepository, 'getObjectType').mockResolvedValue('page');
    jest
      .spyOn(destinationRepository, 'appendToPage')
      .mockResolvedValue(undefined);

    jest
      .spyOn(sourceRepository, 'getFilePathList')
      .mockResolvedValue(['parent.md', 'child/child.md']);

    await expect(
      synchronizer.execute({
        notionParentPageUrl: databaseUrl,
        cleanSync: false,
        lockPage: false,
        flat: true,
        path: 'test',
      })
    ).rejects.toThrow(
      'Flat sync is only supported for database destinations. Pages do not support flat sync.'
    );
  });
});

