import { Client, LogLevel, isFullPage } from '@notionhq/client';
import {
  BlockObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { NotionClientRepository } from '../notion-client.repository';

// Mock the @notionhq/client module
jest.mock('@notionhq/client', () => ({
  Client: jest.fn(),
  LogLevel: { ERROR: 'error' },
  isFullPage: jest.fn(),
}));

describe('NotionClientRepository', () => {
  let repository: NotionClientRepository;
  let mockClient: {
    search: jest.Mock;
    databases: { retrieve: jest.Mock };
    dataSources: { retrieve: jest.Mock };
    pages: {
      retrieve: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    blocks: {
      retrieve: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      children: {
        list: jest.Mock;
        append: jest.Mock;
      };
    };
  };

  const mockPageResponse: PageObjectResponse = {
    id: 'page-id-123',
    object: 'page',
    created_time: '2024-01-01T00:00:00.000Z',
    last_edited_time: '2024-01-02T00:00:00.000Z',
    created_by: { id: 'user-id', object: 'user' },
    last_edited_by: { id: 'user-id', object: 'user' },
    cover: null,
    icon: null,
    parent: { type: 'workspace', workspace: true },
    archived: false,
    in_trash: false,
    properties: {},
    url: 'https://notion.so/page-id-123',
    public_url: null,
    is_locked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      search: jest.fn(),
      databases: { retrieve: jest.fn() },
      dataSources: { retrieve: jest.fn() },
      pages: {
        retrieve: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      blocks: {
        retrieve: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        children: {
          list: jest.fn(),
          append: jest.fn(),
        },
      },
    };

    (Client as unknown as jest.Mock).mockImplementation(() => mockClient);
    (isFullPage as unknown as jest.Mock).mockReturnValue(true);

    repository = new NotionClientRepository({ apiKey: 'test-api-key' });
  });

  describe('constructor', () => {
    it('should create a Notion client with the provided API key', () => {
      expect(Client).toHaveBeenCalledWith({
        auth: 'test-api-key',
        logLevel: LogLevel.ERROR,
      });
    });
  });

  describe('search', () => {
    it('should call client.search with the provided filter', async () => {
      const mockSearchResponse = {
        results: [{ id: 'page-1' }],
        next_cursor: null,
        has_more: false,
        type: 'page_or_database',
        page_or_database: {},
      };
      mockClient.search.mockResolvedValue(mockSearchResponse);

      const result = await repository.search({
        filter: { property: 'object', value: 'page' },
      });

      expect(mockClient.search).toHaveBeenCalledWith({
        filter: { property: 'object', value: 'page' },
      });
      expect(result).toEqual(mockSearchResponse);
    });

    it('should search for data_source objects', async () => {
      const mockSearchResponse = {
        results: [],
        next_cursor: null,
        has_more: false,
        type: 'page_or_database',
        page_or_database: {},
      };
      mockClient.search.mockResolvedValue(mockSearchResponse);

      await repository.search({
        filter: { property: 'object', value: 'data_source' },
      });

      expect(mockClient.search).toHaveBeenCalledWith({
        filter: { property: 'object', value: 'data_source' },
      });
    });
  });

  describe('getDatabaseById', () => {
    it('should retrieve a database by ID', async () => {
      const mockDatabase = {
        id: 'database-id',
        object: 'database',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-02T00:00:00.000Z',
        title: [],
        description: [],
        icon: null,
        cover: null,
        properties: {},
        parent: { type: 'workspace', workspace: true },
        url: 'https://notion.so/database-id',
        public_url: null,
        archived: false,
        in_trash: false,
        is_inline: false,
      };
      mockClient.databases.retrieve.mockResolvedValue(mockDatabase);

      const result = await repository.getDatabaseById({
        databaseId: 'database-id',
      });

      expect(mockClient.databases.retrieve).toHaveBeenCalledWith({
        database_id: 'database-id',
      });
      expect(result).toEqual(mockDatabase);
    });

    it('should return null when database does not exist', async () => {
      mockClient.databases.retrieve.mockResolvedValue(null);

      const result = await repository.getDatabaseById({
        databaseId: 'non-existent-id',
      });

      expect(result).toBeNull();
    });
  });

  describe('getDataSourceById', () => {
    it('should retrieve a data source by ID', async () => {
      const mockDataSource = {
        id: 'data-source-id',
        object: 'data_source',
      };
      mockClient.dataSources.retrieve.mockResolvedValue(mockDataSource);

      const result = await repository.getDataSourceById({
        dataSourceId: 'data-source-id',
      });

      expect(mockClient.dataSources.retrieve).toHaveBeenCalledWith({
        data_source_id: 'data-source-id',
      });
      expect(result).toEqual(mockDataSource);
    });

    it('should return null when data source does not exist', async () => {
      mockClient.dataSources.retrieve.mockResolvedValue(null);

      const result = await repository.getDataSourceById({
        dataSourceId: 'non-existent-id',
      });

      expect(result).toBeNull();
    });
  });

  describe('getDataSourceIdFromDatabaseId', () => {
    it('should return the data source ID from a database', async () => {
      const mockDatabase = {
        id: 'database-id',
        object: 'database',
        data_sources: [{ id: 'data-source-id-1' }, { id: 'data-source-id-2' }],
      };
      mockClient.databases.retrieve.mockResolvedValue(mockDatabase);

      const result = await repository.getDataSourceIdFromDatabaseId({
        databaseId: 'database-id',
      });

      expect(result).toBe('data-source-id-1');
    });

    it('should throw an error when database has no data sources', async () => {
      const mockDatabase = {
        id: 'database-id',
        object: 'database',
      };
      mockClient.databases.retrieve.mockResolvedValue(mockDatabase);

      await expect(
        repository.getDataSourceIdFromDatabaseId({ databaseId: 'database-id' })
      ).rejects.toThrow('Database does not have any datasources');
    });

    it('should throw an error when database is null', async () => {
      mockClient.databases.retrieve.mockResolvedValue(null);

      await expect(
        repository.getDataSourceIdFromDatabaseId({
          databaseId: 'non-existent-id',
        })
      ).rejects.toThrow('Database does not have any datasources');
    });
  });

  describe('getPage', () => {
    it('should retrieve a page and return a NotionPage', async () => {
      mockClient.pages.retrieve.mockResolvedValue(mockPageResponse);

      const result = await repository.getPage({ pageId: 'page-id-123' });

      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
        page_id: 'page-id-123',
      });
      expect(result).not.toBeNull();
      expect(result?.pageId).toBe('page-id-123');
      expect(result?.isLocked).toBe(false);
    });

    it('should throw an error when page is not a full page', async () => {
      (isFullPage as unknown as jest.Mock).mockReturnValue(false);
      mockClient.pages.retrieve.mockResolvedValue({ id: 'partial-page' });

      await expect(
        repository.getPage({ pageId: 'partial-page' })
      ).rejects.toThrow('Not able to retrieve Notion Page');
    });

    it('should return null when page response is falsy', async () => {
      mockClient.pages.retrieve.mockResolvedValue(null);
      (isFullPage as unknown as jest.Mock).mockReturnValue(true);

      const result = await repository.getPage({ pageId: 'non-existent' });

      expect(result).toBeNull();
    });
  });

  describe('createPage', () => {
    it('should create a page with parent, properties, icon, and children', async () => {
      mockClient.pages.create.mockResolvedValue(mockPageResponse);

      const input = {
        parent: { type: 'page_id' as const, page_id: 'parent-page-id' },
        properties: {
          title: {
            title: [{ text: { content: 'Test Page' } }],
            id: 'title' as const,
          },
        },
        icon: { type: 'emoji' as const, emoji: '📄' as const },
        children: [
          { type: 'paragraph' as const, paragraph: { rich_text: [] } },
        ],
      };

      const result = await repository.createPage(input);

      expect(mockClient.pages.create).toHaveBeenCalledWith({
        parent: input.parent,
        properties: input.properties,
        icon: input.icon,
        children: input.children,
      });
      expect(result.pageId).toBe('page-id-123');
    });

    it('should create a page in a database', async () => {
      mockClient.pages.create.mockResolvedValue(mockPageResponse);

      const input = {
        parent: { type: 'database_id' as const, database_id: 'database-id' },
        properties: {
          Name: { title: [{ text: { content: 'Test' } }], id: 'title' as const },
        },
      };

      await repository.createPage(input);

      expect(mockClient.pages.create).toHaveBeenCalledWith({
        parent: input.parent,
        properties: input.properties,
        icon: undefined,
        children: undefined,
      });
    });
  });

  describe('getPageBlocks', () => {
    it('should return block children of a page', async () => {
      const mockBlocks: BlockObjectResponse[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          object: 'block',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          created_by: { id: 'user-id', object: 'user' },
          last_edited_by: { id: 'user-id', object: 'user' },
          parent: { type: 'page_id', page_id: 'page-id' },
          archived: false,
          in_trash: false,
          has_children: false,
          paragraph: { rich_text: [], color: 'default' },
        },
      ];
      mockClient.blocks.children.list.mockResolvedValue({ results: mockBlocks });

      const result = await repository.getPageBlocks({ pageId: 'page-id' });

      expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
        block_id: 'page-id',
      });
      expect(result).toEqual(mockBlocks);
    });
  });

  describe('updatePage', () => {
    it('should update page properties', async () => {
      mockClient.pages.update.mockResolvedValue(mockPageResponse);

      await repository.updatePage({
        pageId: 'page-id-123',
        properties: {
          title: {
            title: [{ text: { content: 'Updated' } }],
            id: 'title' as const,
          },
        },
      });

      expect(mockClient.pages.update).toHaveBeenCalledWith({
        page_id: 'page-id-123',
        properties: {
          title: {
            title: [{ text: { content: 'Updated' } }],
            id: 'title',
          },
        },
        archived: undefined,
        is_locked: undefined,
      });
    });

    it('should update page icon', async () => {
      mockClient.pages.update.mockResolvedValue(mockPageResponse);

      await repository.updatePage({
        pageId: 'page-id-123',
        icon: { type: 'emoji', emoji: '🚀' },
      });

      expect(mockClient.pages.update).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: 'page-id-123',
          icon: { type: 'emoji', emoji: '🚀' },
        })
      );
    });

    it('should update page archived status', async () => {
      mockClient.pages.update.mockResolvedValue(mockPageResponse);

      await repository.updatePage({
        pageId: 'page-id-123',
        archived: true,
      });

      expect(mockClient.pages.update).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: 'page-id-123',
          archived: true,
        })
      );
    });

    it('should update page locked status', async () => {
      mockClient.pages.update.mockResolvedValue(mockPageResponse);

      await repository.updatePage({
        pageId: 'page-id-123',
        isLocked: true,
      });

      expect(mockClient.pages.update).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: 'page-id-123',
          is_locked: true,
        })
      );
    });
  });

  describe('deletePage', () => {
    it('should delete a page by deleting the block', async () => {
      mockClient.blocks.delete.mockResolvedValue({});

      await repository.deletePage({ pageId: 'page-id-123' });

      expect(mockClient.blocks.delete).toHaveBeenCalledWith({
        block_id: 'page-id-123',
      });
    });
  });

  describe('appendChildToBlock', () => {
    it('should append children to a block', async () => {
      const mockCreatedBlocks: BlockObjectResponse[] = [
        {
          id: 'new-block-1',
          type: 'paragraph',
          object: 'block',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          created_by: { id: 'user-id', object: 'user' },
          last_edited_by: { id: 'user-id', object: 'user' },
          parent: { type: 'page_id', page_id: 'page-id' },
          archived: false,
          in_trash: false,
          has_children: false,
          paragraph: { rich_text: [], color: 'default' },
        },
      ];
      mockClient.blocks.children.append.mockResolvedValue({
        results: mockCreatedBlocks,
      });

      const children = [
        { type: 'paragraph' as const, paragraph: { rich_text: [] } },
      ];

      const result = await repository.appendChildToBlock({
        blockId: 'page-id',
        children,
      });

      expect(mockClient.blocks.children.append).toHaveBeenCalledWith({
        block_id: 'page-id',
        children,
        after: undefined,
      });
      expect(result).toEqual(mockCreatedBlocks);
    });

    it('should append children after a specific block', async () => {
      const children = [
        { type: 'paragraph' as const, paragraph: { rich_text: [] } },
      ];
      mockClient.blocks.children.append.mockResolvedValue({
        results: [{ id: 'new-block-1' }],
      });

      await repository.appendChildToBlock({
        blockId: 'page-id',
        children,
        afterBlockId: 'after-block-id',
      });

      expect(mockClient.blocks.children.append).toHaveBeenCalledWith({
        block_id: 'page-id',
        children,
        after: 'after-block-id',
      });
    });

    it('should handle empty children array', async () => {
      const result = await repository.appendChildToBlock({
        blockId: 'page-id',
        children: [],
      });

      expect(mockClient.blocks.children.append).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should chunk children into batches of 100', async () => {
      const children = Array(250)
        .fill(null)
        .map((_, i) => ({
          type: 'paragraph' as const,
          paragraph: { rich_text: [{ text: { content: `Block ${i}` } }] },
        }));

      mockClient.blocks.children.append
        .mockResolvedValueOnce({
          results: children.slice(0, 100).map((_, i) => ({ id: `block-${i}` })),
        })
        .mockResolvedValueOnce({
          results: children
            .slice(100, 200)
            .map((_, i) => ({ id: `block-${100 + i}` })),
        })
        .mockResolvedValueOnce({
          results: children
            .slice(200)
            .map((_, i) => ({ id: `block-${200 + i}` })),
        });

      const result = await repository.appendChildToBlock({
        blockId: 'page-id',
        children,
      });

      expect(mockClient.blocks.children.append).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(250);
    });

    it('should use the last created block ID as afterBlockId for subsequent chunks', async () => {
      const children = Array(150)
        .fill(null)
        .map(() => ({
          type: 'paragraph' as const,
          paragraph: { rich_text: [] },
        }));

      mockClient.blocks.children.append
        .mockResolvedValueOnce({
          results: [{ id: 'last-block-of-first-chunk' }],
        })
        .mockResolvedValueOnce({
          results: [{ id: 'last-block-of-second-chunk' }],
        });

      await repository.appendChildToBlock({
        blockId: 'page-id',
        children,
      });

      expect(mockClient.blocks.children.append).toHaveBeenNthCalledWith(2, {
        block_id: 'page-id',
        children: expect.any(Array),
        after: 'last-block-of-first-chunk',
      });
    });
  });

  describe('deleteBlock', () => {
    it('should delete a block by ID', async () => {
      mockClient.blocks.delete.mockResolvedValue({});

      await repository.deleteBlock({ blockId: 'block-id-123' });

      expect(mockClient.blocks.delete).toHaveBeenCalledWith({
        block_id: 'block-id-123',
      });
    });
  });

  describe('deleteBlocks', () => {
    it('should delete multiple blocks', async () => {
      mockClient.blocks.delete.mockResolvedValue({});

      await repository.deleteBlocks({
        blockIds: ['block-1', 'block-2', 'block-3'],
      });

      expect(mockClient.blocks.delete).toHaveBeenCalledTimes(3);
      expect(mockClient.blocks.delete).toHaveBeenCalledWith({
        block_id: 'block-1',
      });
      expect(mockClient.blocks.delete).toHaveBeenCalledWith({
        block_id: 'block-2',
      });
      expect(mockClient.blocks.delete).toHaveBeenCalledWith({
        block_id: 'block-3',
      });
    });

    it('should chunk deletion into batches of 50', async () => {
      mockClient.blocks.delete.mockResolvedValue({});

      const blockIds = Array(120)
        .fill(null)
        .map((_, i) => `block-${i}`);

      await repository.deleteBlocks({ blockIds });

      // Should be called 120 times total but in 3 batches
      expect(mockClient.blocks.delete).toHaveBeenCalledTimes(120);
    });

    it('should handle empty blockIds array', async () => {
      await repository.deleteBlocks({ blockIds: [] });

      expect(mockClient.blocks.delete).not.toHaveBeenCalled();
    });
  });

  describe('getBlock', () => {
    it('should retrieve a block by ID', async () => {
      const mockBlock: BlockObjectResponse = {
        id: 'block-id',
        type: 'paragraph',
        object: 'block',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        created_by: { id: 'user-id', object: 'user' },
        last_edited_by: { id: 'user-id', object: 'user' },
        parent: { type: 'page_id', page_id: 'page-id' },
        archived: false,
        in_trash: false,
        has_children: false,
        paragraph: { rich_text: [], color: 'default' },
      };
      mockClient.blocks.retrieve.mockResolvedValue(mockBlock);

      const result = await repository.getBlock({ blockId: 'block-id' });

      expect(mockClient.blocks.retrieve).toHaveBeenCalledWith({
        block_id: 'block-id',
      });
      expect(result).toEqual(mockBlock);
    });
  });

  describe('updateBlock', () => {
    it('should update a block', async () => {
      const mockBlock: BlockObjectResponse = {
        id: 'block-id',
        type: 'paragraph',
        object: 'block',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        created_by: { id: 'user-id', object: 'user' },
        last_edited_by: { id: 'user-id', object: 'user' },
        parent: { type: 'page_id', page_id: 'page-id' },
        archived: false,
        in_trash: false,
        has_children: false,
        paragraph: { rich_text: [], color: 'default' },
      };
      mockClient.blocks.update.mockResolvedValue(mockBlock);

      const blockUpdate = {
        type: 'paragraph' as const,
        paragraph: {
          rich_text: [{ type: 'text' as const, text: { content: 'Updated' } }],
        },
      };

      const result = await repository.updateBlock({
        blockId: 'block-id',
        block: blockUpdate,
      });

      expect(mockClient.blocks.update).toHaveBeenCalledWith({
        block_id: 'block-id',
        ...blockUpdate,
      });
      expect(result).toEqual(mockBlock);
    });
  });

  describe('getBlockChildren', () => {
    it('should retrieve children of a block', async () => {
      const mockBlocks: BlockObjectResponse[] = [
        {
          id: 'child-block-1',
          type: 'paragraph',
          object: 'block',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          created_by: { id: 'user-id', object: 'user' },
          last_edited_by: { id: 'user-id', object: 'user' },
          parent: { type: 'block_id', block_id: 'parent-block-id' },
          archived: false,
          in_trash: false,
          has_children: false,
          paragraph: { rich_text: [], color: 'default' },
        },
        {
          id: 'child-block-2',
          type: 'heading_1',
          object: 'block',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          created_by: { id: 'user-id', object: 'user' },
          last_edited_by: { id: 'user-id', object: 'user' },
          parent: { type: 'block_id', block_id: 'parent-block-id' },
          archived: false,
          in_trash: false,
          has_children: false,
          heading_1: { rich_text: [], is_toggleable: false, color: 'default' },
        },
      ];
      mockClient.blocks.children.list.mockResolvedValue({ results: mockBlocks });

      const result = await repository.getBlockChildren({
        blockId: 'parent-block-id',
      });

      expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
        block_id: 'parent-block-id',
      });
      expect(result).toEqual(mockBlocks);
    });

    it('should return empty array when block has no children', async () => {
      mockClient.blocks.children.list.mockResolvedValue({ results: [] });

      const result = await repository.getBlockChildren({
        blockId: 'block-without-children',
      });

      expect(result).toEqual([]);
    });
  });
});
