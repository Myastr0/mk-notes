import { NotionDestinationRepository } from './notion.destination';
import { NotionConverterRepository } from '@/infrastructure/converters/notion/notion.converter';
import { PageElement } from '@/domains/elements';
import { NotionPage } from '@/domains/notion/entities/NotionPage';
import { NotionClientRepository } from '@/domains/notion/repositories/notion-client.repository';
import winston from 'winston';

describe('NotionDestinationRepository', () => {
  let repository: NotionDestinationRepository;
  let mockNotionClient: jest.Mocked<NotionClientRepository>;
  let mockNotionConverter: jest.Mocked<NotionConverterRepository>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<winston.Logger>;

    mockNotionClient = {
      getPage: jest.fn(),
      getPageBlocks: jest.fn(),
      createPage: jest.fn(),
      updatePage: jest.fn(),
      deletePage: jest.fn(),
      getBlockChildren: jest.fn(),
      appendChildToBlock: jest.fn(),
      deleteBlock: jest.fn(),
      deleteBlocks: jest.fn(),
      getBlock: jest.fn(),
      updateBlock: jest.fn(),
      getDatabaseById: jest.fn(),
      getDataSourceById: jest.fn(),
      getDataSourceIdFromDatabaseId: jest.fn(),
      search: jest.fn(),
    } as unknown as jest.Mocked<NotionClientRepository>;

    mockNotionConverter = {
      convertFromElement: jest.fn(),
    } as unknown as jest.Mocked<NotionConverterRepository>;

    repository = new NotionDestinationRepository({
      notionClient: mockNotionClient,
      notionConverter: mockNotionConverter,
      logger: mockLogger,
    });
  });

  describe('destinationIsAccessible', () => {
    it('should return true when page is accessible', async () => {
      mockNotionClient.getPage.mockResolvedValue({ pageId: 'page-id' } as NotionPage);

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'page-id',
      });

      expect(result).toBe(true);
      expect(mockNotionClient.getPage).toHaveBeenCalledWith({
        pageId: 'page-id',
      });
    });

    it('should return false when page is not accessible', async () => {
      mockNotionClient.getPage.mockRejectedValue(new Error('Not found'));
      mockNotionClient.getDatabaseById.mockRejectedValue(new Error('Not found'));

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'invalid-id',
      });

      expect(result).toBe(false);
    });
  });

  describe('getPage', () => {
    it('should retrieve page with blocks', async () => {
      const mockPage = new NotionPage({
        pageId: 'page-id',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        isLocked: false,
        children: [],
      });
      const mockBlocks = [{ id: 'block-1' }, { id: 'block-2' }];

      mockNotionClient.getPage.mockResolvedValue(mockPage);
      mockNotionClient.getPageBlocks.mockResolvedValue(mockBlocks as any);

      const result = await repository.getPage({
        pageId: 'page-id',
      });

      expect(result).toBeDefined();
      expect(result?.pageId).toBe('page-id');
      expect(result?.children).toEqual(mockBlocks);
    });

    it('should return null for non-existent page', async () => {
      mockNotionClient.getPage.mockResolvedValue(null);

      const result = await repository.getPage({ pageId: 'invalid-id' });

      expect(result).toBeNull();
    });
  });

  describe('createPage', () => {
    it('should create page with converted content when parent is a page', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
      });

      const mockNotionPage = new NotionPage({
        pageId: 'new-page-id',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        isLocked: false,
        children: [],
        properties: { Title: { title: [{ text: { content: 'Test Page' } }] } } as any,
      });

      mockNotionConverter.convertFromElement.mockResolvedValue(mockNotionPage);
      mockNotionClient.createPage.mockResolvedValue(mockNotionPage);
      mockNotionClient.getPage.mockResolvedValue(mockNotionPage);
      mockNotionClient.getPageBlocks.mockResolvedValue([]);

      const result = await repository.createPage({
        parentObjectId: 'parent-id',
        parentObjectType: 'page',
        pageElement,
      });

      expect(mockNotionClient.createPage).toHaveBeenCalledWith({
        parent: { type: 'page_id', page_id: 'parent-id' },
        properties: mockNotionPage.properties,
        icon: undefined,
        children: [],
      });

      expect(result).toMatchObject({
        pageId: 'new-page-id',
        children: [],
      });
    });

    it('should throw an error when parent object type is unknown', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
      });

      await expect(repository.createPage({
        parentObjectId: 'parent-id',
        parentObjectType: 'unknown',
        pageElement,
      })).rejects.toThrow('Unknown parent object type');
    });
  });

  // describe('updatePage', () => {
  //   it('should update page properties and blocks', async () => {
  //     const pageElement = new PageElement({
  //       title: 'Updated Page',
  //       content: [],
  //     });

  //     const mockNotionPage = {
  //       properties: {
  //         Title: { title: [{ text: { content: 'Updated Page' } }] },
  //       },
  //       children: [{ id: 'block-1', type: 'paragraph' }],
  //     };

  //     const mockExistingBlocks = [
  //       { id: 'existing-block-1', type: 'paragraph' },
  //     ];

  //     jest.spyOn(mockNotionConverter,'convertFromElement').mockReturnValue(mockNotionPage as unknown as NotionPage);
  //     jest.spyOn(mockClient.blocks.children,'list').mockResolvedValue({
  //       results: mockExistingBlocks as unknown as BlockObjectResponse[],
  //       type: 'block',
  //       block: mockExistingBlocks[0],
  //       object: 'list',
  //       next_cursor: null,
  //       has_more: false,
  //     });
  //     jest.spyOn(mockClient.pages,'retrieve').mockResolvedValue({
  //       id: 'page-id',
  //       object: 'page',
  //       created_time: '2024-01-01T00:00:00.000Z',
  //       last_edited_time: '2024-01-02T00:00:00.000Z',
  //     });

  //     await repository.updatePage({
  //       pageId: 'page-id',
  //       pageElement,
  //     });

  //     expect(mockClient.pages.update).toHaveBeenCalledWith({
  //       page_id: 'page-id',
  //       properties: mockNotionPage.properties,
  //     });

  //     expect(mockClient.blocks.update).toHaveBeenCalled();
  //   });
  // });

  // Methods like search, getBlocksFromPage have been moved to NotionClientRepository
  // and are tested there;

  describe('getObjectIdFromObjectUrl', () => {
    it('should extract the page ID from a standard Notion URL', () => {
      const pageUrl = 'https://www.notion.so/workspace/Test-Page-12345678901234567890123456789012';
      const result = repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl });
      expect(result).toBe('12345678901234567890123456789012');
    });

    it('should extract the page ID from a URL with multiple hyphens', () => {
      const pageUrl = 'https://www.notion.so/workspace/My-Test-Page-With-Many-Hyphens-12345678901234567890123456789012';
      const result = repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl });
      expect(result).toBe('12345678901234567890123456789012');
    });

    it('should extract the page ID from a URL without a workspace name', () => {
      const pageUrl = 'https://www.notion.so/Test-Page-12345678901234567890123456789012';
      const result = repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl });
      expect(result).toBe('12345678901234567890123456789012');
    });

    it('should throw an error for a URL without a valid Notion ID', () => {
      const pageUrl = 'https://www.notion.so/workspace/Test-Page';
      expect(() => repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl })).toThrow('Invalid Notion URL: No valid Notion ID found');
    });

    it('should throw an error for a URL with an invalid ID length', () => {
      const pageUrl = 'https://www.notion.so/workspace/Test-Page-123456';
      expect(() => repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl })).toThrow('Invalid Notion URL: No valid Notion ID found');
    });

    it('should throw an error for a non-Notion URL without valid ID', () => {
      const pageUrl = 'https://example.com/some-page';
      expect(() => repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl })).toThrow('Invalid Notion URL: No valid Notion ID found');
    });

    it('should extract the database ID from a Notion Database URL', () => {
      const pageUrl = 'https://www.notion.so/16d4754ea1e980d1a2fdc2ab5fa4dfaf?v=7d43042815524daa9c5c3a7a4f8e1fe4&pvs=4';
      const result = repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl });
      expect(result).toBe('16d4754ea1e980d1a2fdc2ab5fa4dfaf');
    });

    it('should extract the page ID from a URL with direct ID and query parameters', () => {
      const pageUrl = 'https://www.notion.so/16d4754ea1e980d1a2fdc2ab5fa4dfaf?pvs=4';
      const result = repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl });
      expect(result).toBe('16d4754ea1e980d1a2fdc2ab5fa4dfaf');
    });

    it('should extract the ID from a URL with name prefix like MK-Notes-<id>', () => {
      const pageUrl = 'https://www.notion.so/MK-Notes-4dd0bd3dc73648a9a55dcf05dd03080f';
      const result = repository.getObjectIdFromObjectUrl({ objectUrl: pageUrl });
      expect(result).toBe('4dd0bd3dc73648a9a55dcf05dd03080f');
    });
  });

  describe('setPageLockedStatus', () => {
    it('should lock a page when lockStatus is "locked"', async () => {
      const pageId = 'test-page-id';
      const lockStatus = 'locked' as const;

      mockNotionClient.updatePage.mockResolvedValue({} as any);

      await repository.setPageLockedStatus({ pageId, lockStatus });

      expect(mockNotionClient.updatePage).toHaveBeenCalledWith({
        pageId,
        isLocked: true,
      });
    });

    it('should unlock a page when lockStatus is "unlocked"', async () => {
      const pageId = 'test-page-id';
      const lockStatus = 'unlocked' as const;

      mockNotionClient.updatePage.mockResolvedValue({} as any);

      await repository.setPageLockedStatus({ pageId, lockStatus });

      expect(mockNotionClient.updatePage).toHaveBeenCalledWith({
        pageId,
        isLocked: false,
      });
    });

    it('should throw an error when the Notion API call fails', async () => {
      const pageId = 'test-page-id';
      const lockStatus = 'locked' as const;
      const error = new Error('Notion API error');

      mockNotionClient.updatePage.mockRejectedValue(error);

      await expect(repository.setPageLockedStatus({ pageId, lockStatus })).rejects.toThrow('Notion API error');
    });
  });

  describe('getPageLockedStatus', () => {
    it('should return "locked" when page is locked', async () => {
      const pageId = 'test-page-id';
      const mockPage = new NotionPage({
        pageId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isLocked: true,
        children: [],
      });

      mockNotionClient.getPage.mockResolvedValue(mockPage);

      const result = await repository.getPageLockedStatus({ pageId });

      expect(result).toBe('locked');
      expect(mockNotionClient.getPage).toHaveBeenCalledWith({ pageId });
    });

    it('should return "unlocked" when page is unlocked', async () => {
      const pageId = 'test-page-id';
      const mockPage = new NotionPage({
        pageId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isLocked: false,
        children: [],
      });

      mockNotionClient.getPage.mockResolvedValue(mockPage);

      const result = await repository.getPageLockedStatus({ pageId });

      expect(result).toBe('unlocked');
      expect(mockNotionClient.getPage).toHaveBeenCalledWith({ pageId });
    });

    it('should return "unlocked" when isLocked is undefined', async () => {
      const pageId = 'test-page-id';
      const mockPage = new NotionPage({
        pageId,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      });

      mockNotionClient.getPage.mockResolvedValue(mockPage);

      const result = await repository.getPageLockedStatus({ pageId });

      expect(result).toBe('unlocked');
    });

    it('should throw an error when the Notion API call fails', async () => {
      const pageId = 'test-page-id';
      const error = new Error('Notion API error');

      mockNotionClient.getPage.mockRejectedValue(error);

      await expect(repository.getPageLockedStatus({ pageId })).rejects.toThrow('Notion API error');
    });
  });

  describe('getObjectType', () => {
    it('should return "page" when the object is a page', async () => {
      const mockPage = new NotionPage({
        pageId: 'page-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        isLocked: false,
        children: [],
      });
      mockNotionClient.getPage.mockResolvedValue(mockPage);

      const result = await repository.getObjectType({ id: 'page-id' });

      expect(result).toBe('page');
      expect(mockNotionClient.getPage).toHaveBeenCalledWith({
        pageId: 'page-id',
      });
    });

    it('should return "database" when the object is a database', async () => {
      mockNotionClient.getPage.mockRejectedValue(new Error('Not found'));
      mockNotionClient.getDatabaseById.mockResolvedValue({
        id: 'database-id',
        object: 'database',
      } as any);

      const result = await repository.getObjectType({ id: 'database-id' });

      expect(result).toBe('database');
      expect(mockNotionClient.getDatabaseById).toHaveBeenCalledWith({
        databaseId: 'database-id',
      });
    });

    it('should return "unknown" when the object is neither a page nor a database', async () => {
      mockNotionClient.getPage.mockRejectedValue(new Error('Not found'));
      mockNotionClient.getDatabaseById.mockRejectedValue(new Error('Not found'));

      const result = await repository.getObjectType({ id: 'invalid-id' });

      expect(result).toBe('unknown');
    });
  });

  // Methods like getDatabaseById, deleteObjectById, getDataSourceIdFromDatabaseId,
  // getObjectIdInDatabaseByMkNotesInternalId have been moved to NotionClientRepository

  describe('destinationIsAccessible with database support', () => {
    it('should return true when database is accessible', async () => {
      mockNotionClient.getPage.mockRejectedValue(new Error('Not found'));
      mockNotionClient.getDatabaseById.mockResolvedValue({
        id: 'database-id',
        object: 'database',
      } as any);

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'database-id',
      });

      expect(result).toBe(true);
    });

    it('should return false when neither page nor database is accessible', async () => {
      mockNotionClient.getPage.mockRejectedValue(new Error('Not found'));
      mockNotionClient.getDatabaseById.mockRejectedValue(new Error('Not found'));

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'invalid-id',
      });

      expect(result).toBe(false);
    });
  });
});
