import { Client, Logger } from '@notionhq/client';
import { NotionDestinationRepository } from './notion.destination';
import { NotionConverterRepository } from './notion.converter';
import { PageElement } from '@/domains/elements';
import { NotionPage } from '@/domains/notion/NotionPage';
import { CreatePageResponse, GetPageResponse, ListBlockChildrenResponse, SearchResponse } from '@notionhq/client/build/src/api-endpoints';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import winston from 'winston';

jest.mock('@notionhq/client');

describe('NotionDestinationRepository', () => {
  let repository: NotionDestinationRepository;
  let mockClient: jest.Mocked<Client>;
  let mockNotionConverter: jest.Mocked<NotionConverterRepository>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockClient = {
      pages: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
      },
      blocks: {
        children: {
          list: jest.fn(),
          append: jest.fn(),
        },
        update: jest.fn(),
        delete: jest.fn(),
      },
      databases: {
        retrieve: jest.fn(),
      },
      dataSources: {
        retrieve: jest.fn(),
        query: jest.fn(),
      },
      search: jest.fn(),
    } as unknown as jest.Mocked<Client>;

    // Mock the Client constructor to return our mock client
    jest.mocked(Client).mockImplementation(() => mockClient);

    mockNotionConverter = {
      convertFromElement: jest.fn(),
    } as unknown as jest.Mocked<NotionConverterRepository>;

    repository = new NotionDestinationRepository({
      apiKey: 'fake-api-key',
      notionConverter: mockNotionConverter,
      logger: mockLogger as unknown as winston.Logger,
    });
  });

  describe.skip('destinationIsAccessible', () => {
    it('should return true when page is accessible', async () => {
      jest.spyOn(mockClient.pages,'retrieve').mockResolvedValue({ id: 'page-id', object: 'page' });

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'page-id',
      });

      expect(result).toBe(true);
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: 'page-id',
      });
    });

    it('should return false when page is not accessible', async () => {
      jest.spyOn(mockClient.pages,'retrieve').mockRejectedValue(new Error('Not found'));

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'invalid-id',
      });

      expect(result).toBe(false);
    });
  });

  describe.skip('getPageById', () => {
    it('should retrieve page with blocks', async () => {
      const mockPage = {
        id: 'page-id',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-02T00:00:00.000Z',
        object: 'page',
      };
      const mockBlocks = {
        results: [{ id: 'block-1' }, { id: 'block-2' }],
      };

      jest.spyOn(mockClient.pages,'retrieve').mockResolvedValue(mockPage as PageObjectResponse);
      jest.spyOn(mockClient.blocks.children,'list').mockResolvedValue(mockBlocks as ListBlockChildrenResponse);

      const result = await repository.getPageById({
        notionPageId: 'page-id',
      });

      expect(result).toEqual({
        pageId: 'page-id',
        children: mockBlocks.results,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      });
    });

    it('should throw error for invalid page response', async () => {
      jest.spyOn(mockClient.pages,'retrieve').mockResolvedValue({ object: 'invalid' } as unknown as PageObjectResponse);

      await expect(
        repository.getPageById({ notionPageId: 'invalid-id' })
      ).rejects.toThrow('Not able to retrieve Notion Page');
    });
  });

  describe.skip('createPage', () => {
    it('should create page with converted content when parent is a page', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
      });

      const mockNotionPage = {
        properties: { Title: { title: [{ text: { content: 'Test Page' } }] } },
        children: [],
      };

      const mockCreatedPage = {
        id: 'new-page-id',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        object: 'page',
      };

      jest.spyOn(mockNotionConverter,'convertFromElement').mockResolvedValue(mockNotionPage as unknown as NotionPage);
      jest.spyOn(mockClient.pages,'create').mockResolvedValue({ id: 'new-page-id' } as unknown as CreatePageResponse);
      jest.spyOn(mockClient.pages,'retrieve').mockResolvedValue(mockCreatedPage as unknown as GetPageResponse);
      jest.spyOn(mockClient.blocks.children,'list').mockResolvedValue({ results: [] } as unknown as ListBlockChildrenResponse);

      const result = await repository.createPage({
        parentObjectId: 'parent-id',
        parentObjectType: 'page',
        pageElement,
      });

      expect(mockClient.pages.create).toHaveBeenCalledWith({
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

  describe.skip('search', () => {
    it('should perform search with filter', async () => {
      const mockSearchResults = {
        results: [{ id: 'page-1' }, { id: 'page-2' }],
      };

      jest.spyOn(mockClient,'search').mockResolvedValue(mockSearchResults as unknown as SearchResponse);

      const result = await repository.search({
        filter: { property: 'object', value: 'page' },
      });

      expect(result).toEqual(mockSearchResults);
      expect(mockClient.search).toHaveBeenCalledWith({
        filter: { property: 'object', value: 'page' },
      });
    });
  });

  describe.skip('getBlocksFromPage', () => {
    it('should retrieve blocks from page', async () => {
      const mockBlocks = {
        results: [{ id: 'block-1' }, { id: 'block-2' }],
      };

      jest.spyOn(mockClient.blocks.children,'list').mockResolvedValue(mockBlocks as unknown as ListBlockChildrenResponse);

      const result = await repository.getBlocksFromPage({
        notionPageId: 'page-id',
      });

      expect(result).toEqual(mockBlocks.results);
      expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
        block_id: 'page-id',
      });
    });
  });

  // describe('updateBlock', () => {
  //   it('should update block content', async () => {
  //     const mockBlock = {
  //       type: 'paragraph',
  //       paragraph: { text: 'Updated content' },
  //     } as unknown as BlockObjectRequest;

  //     await repository.updateBlock({
  //       blockId: 'block-id',
  //       block: mockBlock as unknown as BlockObjectRequest,
  //     });

  //     expect(mockClient.blocks.update).toHaveBeenCalledWith({
  //       block_id: 'block-id',
  //       ...mockBlock,
  //     });
  //   });
  // });

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
      const lockStatus = 'locked';

      jest.spyOn(mockClient.pages, 'update').mockResolvedValue({} as any);

      await repository.setPageLockedStatus({ pageId, lockStatus });

      expect(mockClient.pages.update).toHaveBeenCalledWith({
        page_id: pageId,
        is_locked: true,
      });
    });

    it('should unlock a page when lockStatus is "unlocked"', async () => {
      const pageId = 'test-page-id';
      const lockStatus = 'unlocked';

      jest.spyOn(mockClient.pages, 'update').mockResolvedValue({} as any);

      await repository.setPageLockedStatus({ pageId, lockStatus });

      expect(mockClient.pages.update).toHaveBeenCalledWith({
        page_id: pageId,
        is_locked: false,
      });
    });

    it('should throw an error when the Notion API call fails', async () => {
      const pageId = 'test-page-id';
      const lockStatus = 'locked';
      const error = new Error('Notion API error');

      jest.spyOn(mockClient.pages, 'update').mockRejectedValue(error);

      await expect(repository.setPageLockedStatus({ pageId, lockStatus })).rejects.toThrow('Notion API error');
    });
  });

  describe('getPageLockedStatus', () => {
    it('should return "locked" when page is locked', async () => {
      const pageId = 'test-page-id';
      const mockPage = {
        id: pageId,
        object: 'page',
        properties: {
          is_locked: true,
        },
      } as unknown as PageObjectResponse;

      jest.spyOn(mockClient.pages, 'retrieve').mockResolvedValue(mockPage);

      const result = await repository.getPageLockedStatus({ pageId });

      expect(result).toBe('locked');
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: pageId,
      });
    });

    it('should return "unlocked" when page is unlocked', async () => {
      const pageId = 'test-page-id';
      const mockPage = {
        id: pageId,
        object: 'page',
        properties: {
          is_locked: false,
        },
      } as unknown as PageObjectResponse;

      jest.spyOn(mockClient.pages, 'retrieve').mockResolvedValue(mockPage);

      const result = await repository.getPageLockedStatus({ pageId });

      expect(result).toBe('unlocked');
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: pageId,
      });
    });

    it('should return "unlocked" when is_locked property is undefined', async () => {
      const pageId = 'test-page-id';
      const mockPage = {
        id: pageId,
        object: 'page',
        properties: {},
      } as unknown as PageObjectResponse;

      jest.spyOn(mockClient.pages, 'retrieve').mockResolvedValue(mockPage);

      const result = await repository.getPageLockedStatus({ pageId });

      expect(result).toBe('unlocked');
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: pageId,
      });
    });

    it('should return "unlocked" when properties is undefined', async () => {
      const pageId = 'test-page-id';
      const mockPage = {
        id: pageId,
        object: 'page',
      } as unknown as PageObjectResponse;

      jest.spyOn(mockClient.pages, 'retrieve').mockResolvedValue(mockPage);

      const result = await repository.getPageLockedStatus({ pageId });

      expect(result).toBe('unlocked');
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: pageId,
      });
    });

    it('should throw an error when the Notion API call fails', async () => {
      const pageId = 'test-page-id';
      const error = new Error('Notion API error');

      jest.spyOn(mockClient.pages, 'retrieve').mockRejectedValue(error);

      await expect(repository.getPageLockedStatus({ pageId })).rejects.toThrow('Notion API error');
    });
  });

  describe('getObjectType', () => {
    it('should return "page" when the object is a page', async () => {
      jest.spyOn(mockClient.pages, 'retrieve').mockResolvedValue({
        id: 'page-id',
        object: 'page',
      } as any);

      const result = await repository.getObjectType({ id: 'page-id' });

      expect(result).toBe('page');
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: 'page-id',
      });
    });

    it('should return "database" when the object is a database', async () => {
      jest.spyOn(mockClient.pages, 'retrieve').mockRejectedValue(new Error('Not found'));
      jest.spyOn(mockClient.databases, 'retrieve').mockResolvedValue({
        id: 'database-id',
        object: 'database',
      } as any);

      const result = await repository.getObjectType({ id: 'database-id' });

      expect(result).toBe('database');
      expect(mockClient.databases.retrieve).toHaveBeenCalledWith({
        database_id: 'database-id',
      });
    });

    it('should return "unknown" when the object is neither a page nor a database', async () => {
      jest.spyOn(mockClient.pages, 'retrieve').mockRejectedValue(new Error('Not found'));
      jest.spyOn(mockClient.databases, 'retrieve').mockRejectedValue(new Error('Not found'));

      const result = await repository.getObjectType({ id: 'invalid-id' });

      expect(result).toBe('unknown');
    });
  });

  describe('getDatabaseById', () => {
    it('should retrieve a database by ID', async () => {
      const mockDatabase = {
        id: 'database-id',
        object: 'database',
        title: [{ plain_text: 'Test Database' }],
      };

      jest.spyOn(mockClient.databases, 'retrieve').mockResolvedValue(mockDatabase as any);

      const result = await repository.getDatabaseById({ databaseId: 'database-id' });

      expect(result).toEqual(mockDatabase);
      expect(mockClient.databases.retrieve).toHaveBeenCalledWith({
        database_id: 'database-id',
      });
    });
  });

  describe('deleteObjectById', () => {
    it('should delete an object by ID using blocks.delete', async () => {
      jest.spyOn(mockClient.blocks, 'delete').mockResolvedValue({} as any);

      await repository.deleteObjectById({ objectId: 'object-id' });

      expect(mockClient.blocks.delete).toHaveBeenCalledWith({
        block_id: 'object-id',
      });
    });
  });

  describe('getDataSourceIdFromDatabaseId', () => {
    it('should return the data source ID from a database', async () => {
      const mockDatabase = {
        id: 'database-id',
        object: 'database',
        data_sources: [{ id: 'data-source-id' }],
      };

      jest.spyOn(mockClient.databases, 'retrieve').mockResolvedValue(mockDatabase as any);

      const result = await repository.getDataSourceIdFromDatabaseId({ databaseId: 'database-id' });

      expect(result).toBe('data-source-id');
    });

    it('should throw an error if database has no data sources', async () => {
      const mockDatabase = {
        id: 'database-id',
        object: 'database',
      };

      jest.spyOn(mockClient.databases, 'retrieve').mockResolvedValue(mockDatabase as any);

      await expect(repository.getDataSourceIdFromDatabaseId({ databaseId: 'database-id' }))
        .rejects.toThrow('Database does not have any datasources');
    });
  });

  describe('getObjectIdInDatabaseByMkNotesInternalId', () => {
    it('should return object IDs matching the mk-notes internal ID', async () => {
      const mockQueryResult = {
        results: [
          { id: 'object-1' },
          { id: 'object-2' },
        ],
      };

      jest.spyOn(mockClient.dataSources, 'query').mockResolvedValue(mockQueryResult as any);

      const result = await repository.getObjectIdInDatabaseByMkNotesInternalId({
        dataSourceId: 'data-source-id',
        mkNotesInternalId: 'mk-notes-123',
      });

      expect(result).toEqual(['object-1', 'object-2']);
      expect(mockClient.dataSources.query).toHaveBeenCalledWith({
        data_source_id: 'data-source-id',
        filter: {
          property: 'mk-notes-id',
          rich_text: {
            equals: 'mk-notes-123',
          },
        },
      });
    });

    it('should return empty array when no objects match', async () => {
      const mockQueryResult = {
        results: [],
      };

      jest.spyOn(mockClient.dataSources, 'query').mockResolvedValue(mockQueryResult as any);

      const result = await repository.getObjectIdInDatabaseByMkNotesInternalId({
        dataSourceId: 'data-source-id',
        mkNotesInternalId: 'non-existent-id',
      });

      expect(result).toEqual([]);
    });
  });

  describe('destinationIsAccessible with database support', () => {
    it('should return true when database is accessible', async () => {
      jest.spyOn(mockClient.pages, 'retrieve').mockRejectedValue(new Error('Not found'));
      jest.spyOn(mockClient.databases, 'retrieve').mockResolvedValue({
        id: 'database-id',
        object: 'database',
      } as any);

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'database-id',
      });

      expect(result).toBe(true);
    });

    it('should return false when neither page nor database is accessible', async () => {
      jest.spyOn(mockClient.pages, 'retrieve').mockRejectedValue(new Error('Not found'));
      jest.spyOn(mockClient.databases, 'retrieve').mockRejectedValue(new Error('Not found'));

      const result = await repository.destinationIsAccessible({
        parentObjectId: 'invalid-id',
      });

      expect(result).toBe(false);
    });
  });

});
