import {
  BlockObjectResponse,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  SearchResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { NotionPage } from '../../../src/domains/notion/entities/NotionPage';
import {
  CreatePageInput,
  NotionClientRepository,
} from '../../../src/domains/notion/repositories/notion-client.repository';
import {
  BlockObjectRequest,
  Icon,
  PageProperties,
} from '../../../src/domains/notion/types';

export class FakeNotionClientRepository implements NotionClientRepository {
  private pages: Map<string, NotionPage> = new Map();
  private blocks: Map<string, BlockObjectResponse> = new Map();
  private databases: Map<string, DatabaseObjectResponse> = new Map();
  private dataSources: Map<string, DataSourceObjectResponse> = new Map();
  private databaseToDataSource: Map<string, string> = new Map();

  /**
   * ------------------------------------------------------------
   * GENERAL METHODS
   * ------------------------------------------------------------
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async search({
    filter,
  }: {
    filter: { property: 'object'; value: 'page' | 'data_source' };
  }): Promise<SearchResponse> {
    return {
      type: 'page_or_data_source',
      page_or_data_source: {},
      object: 'list',
      results: [],
      next_cursor: null,
      has_more: false,
    };
  }

  /**
   * ------------------------------------------------------------
   * DATABASES METHODS
   * ------------------------------------------------------------
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async getDatabaseById({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<DatabaseObjectResponse | null> {
    return this.databases.get(databaseId) ?? null;
  }

  /**
   * ------------------------------------------------------------
   * DATA SOURCES METHODS
   * ------------------------------------------------------------
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async getDataSourceById({
    dataSourceId,
  }: {
    dataSourceId: string;
  }): Promise<DataSourceObjectResponse | null> {
    return this.dataSources.get(dataSourceId) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getDataSourceIdFromDatabaseId({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<string | null> {
    return this.databaseToDataSource.get(databaseId) ?? null;
  }

  /**
   * ------------------------------------------------------------
   * PAGES METHODS
   * ------------------------------------------------------------
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async createPage({
    parent,
    properties,
    icon,
    children,
  }: CreatePageInput): Promise<NotionPage> {
    const pageId = `fake-page-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    const page = new NotionPage({
      pageId,
      children: children ?? [],
      createdAt: now,
      updatedAt: now,
      icon,
      properties,
      isLocked: false,
    });

    this.pages.set(pageId, page);
    return page;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updatePage({
    pageId,
    icon,
    properties,
    archived,
    isLocked,
  }: {
    pageId: string;
    icon?: Icon;
    properties?: PageProperties;
    archived?: boolean;
    isLocked?: boolean;
  }): Promise<NotionPage> {
    const existingPage = this.pages.get(pageId);
    const now = new Date();

    const updatedPage = new NotionPage({
      pageId,
      children: existingPage?.children ?? [],
      createdAt: existingPage?.createdAt ?? now,
      updatedAt: now,
      icon: icon ?? existingPage?.icon,
      properties: properties ?? existingPage?.properties,
      isLocked: isLocked ?? existingPage?.isLocked,
    });

    this.pages.set(pageId, updatedPage);
    return updatedPage;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async deletePage({ pageId }: { pageId: string }): Promise<void> {
    this.pages.delete(pageId);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getPage({ pageId }: { pageId: string }): Promise<NotionPage | null> {
    return this.pages.get(pageId) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getPageBlocks({
    pageId,
  }: {
    pageId: string;
  }): Promise<BlockObjectResponse[]> {
    const page = this.pages.get(pageId);
    if (!page) {
      return [];
    }
    return page.children as BlockObjectResponse[];
  }

  /**
   * ------------------------------------------------------------
   * BLOCKS METHODS
   * ------------------------------------------------------------
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async appendChildToBlock({
    blockId,
    children,
    afterBlockId,
  }: {
    blockId: string;
    children: BlockObjectRequest[];
    afterBlockId?: string;
  }): Promise<BlockObjectResponse[]> {
    const createdBlocks: BlockObjectResponse[] = children.map(
      (child, index) => {
        const newBlockId = `fake-block-${Date.now()}-${index}-${Math.random().toString(36).substring(7)}`;
        const block = {
          ...child,
          id: newBlockId,
          object: 'block',
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
          has_children: false,
          archived: false,
          in_trash: false,
          parent: { type: 'block_id', block_id: blockId },
          created_by: { object: 'user', id: 'fake-user' },
          last_edited_by: { object: 'user', id: 'fake-user' },
        } as unknown as BlockObjectResponse;

        this.blocks.set(newBlockId, block);
        return block;
      }
    );

    return createdBlocks;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async deleteBlock({ blockId }: { blockId: string }): Promise<void> {
    this.blocks.delete(blockId);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async deleteBlocks({ blockIds }: { blockIds: string[] }): Promise<void> {
    for (const blockId of blockIds) {
      this.blocks.delete(blockId);
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getBlock({
    blockId,
  }: {
    blockId: string;
  }): Promise<BlockObjectResponse> {
    const block = this.blocks.get(blockId);
    if (!block) {
      throw new Error(`Block with id ${blockId} not found`);
    }
    return block;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateBlock({
    blockId,
    block,
  }: {
    blockId: string;
    block: BlockObjectRequest;
  }): Promise<BlockObjectResponse> {
    const existingBlock = this.blocks.get(blockId);
    const updatedBlock = {
      ...existingBlock,
      ...block,
      id: blockId,
      last_edited_time: new Date().toISOString(),
    } as unknown as BlockObjectResponse;

    this.blocks.set(blockId, updatedBlock);
    return updatedBlock;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getBlockChildren({
    blockId,
  }: {
    blockId: string;
  }): Promise<BlockObjectResponse[]> {
    const children: BlockObjectResponse[] = [];
    for (const block of this.blocks.values()) {
      const parent = block.parent as { type: string; block_id?: string };
      if (parent?.type === 'block_id' && parent?.block_id === blockId) {
        children.push(block);
      }
    }
    return children;
  }

  /**
   * ------------------------------------------------------------
   * TEST HELPER METHODS
   * ------------------------------------------------------------
   */
  setPage(pageId: string, page: NotionPage): void {
    this.pages.set(pageId, page);
  }

  setBlock(blockId: string, block: BlockObjectResponse): void {
    this.blocks.set(blockId, block);
  }

  setDatabase(databaseId: string, database: DatabaseObjectResponse): void {
    this.databases.set(databaseId, database);
  }

  setDataSource(
    dataSourceId: string,
    dataSource: DataSourceObjectResponse
  ): void {
    this.dataSources.set(dataSourceId, dataSource);
  }

  setDatabaseToDataSourceMapping(
    databaseId: string,
    dataSourceId: string
  ): void {
    this.databaseToDataSource.set(databaseId, dataSourceId);
  }

  clear(): void {
    this.pages.clear();
    this.blocks.clear();
    this.databases.clear();
    this.dataSources.clear();
    this.databaseToDataSource.clear();
  }
}
