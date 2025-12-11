import {
  BlockObjectRequest,
  BlockObjectResponse,
  Client,
  CreatePageParameters,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  isFullPage,
  LogLevel,
  PageObjectResponse,
  SearchResponse,
  UpdatePageParameters,
} from '@notionhq/client';

import { NotionPage } from '@/domains/notion/entities/NotionPage';
import {
  CreatePageInput,
  NotionClientRepository as NotionClientRepositoryInterface,
} from '@/domains/notion/repositories/notion-client.repository';
import { Icon, PageProperties, TitleProperty } from '@/domains/notion/types';

export class NotionClientRepository implements NotionClientRepositoryInterface {
  private client: Client;
  constructor({ apiKey }: { apiKey: string }) {
    this.client = new Client({
      auth: apiKey,
      logLevel: LogLevel.ERROR,
    });
  }

  /**
   * ------------------------------------------------------------
   * GENERAL METHODS
   * ------------------------------------------------------------
   */
  public async search({
    filter,
  }: {
    filter: { property: 'object'; value: 'page' | 'data_source' };
  }): Promise<SearchResponse> {
    return this.client.search({ filter });
  }

  /**
   * ------------------------------------------------------------
   * DATABASES METHODS
   * ------------------------------------------------------------
   */
  public async getDatabaseById({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<DatabaseObjectResponse | null> {
    const response = await this.client.databases.retrieve({
      database_id: databaseId,
    });

    if (!response) {
      return null;
    }

    return response as DatabaseObjectResponse;
  }

  /**
   * ------------------------------------------------------------
   * DATA SOURCES METHODS
   * ------------------------------------------------------------
   */
  public async getDataSourceById({
    dataSourceId,
  }: {
    dataSourceId: string;
  }): Promise<DataSourceObjectResponse | null> {
    const response = await this.client.dataSources.retrieve({
      data_source_id: dataSourceId,
    });
    if (!response) {
      return null;
    }
    return response as DataSourceObjectResponse;
  }

  public async getDataSourceIdFromDatabaseId({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<string | null> {
    const database = await this.getDatabaseById({ databaseId });

    if (!database || !('data_sources' in database)) {
      throw new Error('Database does not have any datasources');
    }
    return database.data_sources[0].id;
  }
  /**
   * ------------------------------------------------------------
   * PAGES METHODS
   * ------------------------------------------------------------
   */

  public async getPage({
    pageId,
  }: {
    pageId: string;
  }): Promise<NotionPage | null> {
    const response = await this.client.pages.retrieve({ page_id: pageId });

    if (!isFullPage(response)) {
      throw new Error('Not able to retrieve Notion Page');
    }

    return response
      ? this.toNotionPage({ page: response, children: [] })
      : null;
  }

  async createPage({
    parent,
    properties,
    icon,
    children,
  }: CreatePageInput): Promise<NotionPage> {
    const response = await this.client.pages.create({
      parent,
      properties: properties as CreatePageParameters['properties'],
      icon,
      children,
    });

    return this.toNotionPage({
      page: response as PageObjectResponse,
      children: [],
    });
  }

  async getPageBlocks({
    pageId,
  }: {
    pageId: string;
  }): Promise<BlockObjectResponse[]> {
    return this.getBlockChildren({ blockId: pageId });
  }

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
    const updateBody: UpdatePageParameters = {
      page_id: pageId,
      properties: {},
      archived,
      is_locked: isLocked,
    };

    if (icon) {
      updateBody.icon = icon;
    }

    if (properties?.title) {
      updateBody.properties!['title'] = properties.title as TitleProperty;
    }

    const response = await this.client.pages.update(updateBody);

    return this.toNotionPage({
      page: response as PageObjectResponse,
      children: [],
    });
  }

  public async deletePage({ pageId }: { pageId: string }): Promise<void> {
    await this.deleteBlock({ blockId: pageId });
  }

  private toNotionPage({
    page,
    children,
  }: {
    page: PageObjectResponse;
    children: BlockObjectResponse[];
  }): NotionPage {
    if (!page.id) {
      throw new Error('Page ID is required');
    }

    return new NotionPage({
      pageId: page.id,
      children,
      createdAt: new Date(page.created_time),
      updatedAt: new Date(page.last_edited_time),
      isLocked: page.is_locked ?? false,
    });
  }

  /**
   * ------------------------------------------------------------
   * BLOCKS METHODS
   * ------------------------------------------------------------
   */

  /**
   * There is a limit of 100 block children that can be appended by a single API request.
   * Arrays of block children longer than 100 will result in an error.
   *
   * see: https://developers.notion.com/reference/patch-block-children
   */
  private readonly APPEND_BLOCK_CHILDREN_CHUNK_SIZE = 100;
  public async appendChildToBlock({
    blockId,
    children,
    afterBlockId,
  }: {
    blockId: string;
    children: BlockObjectRequest[];
    afterBlockId?: string;
  }): Promise<BlockObjectResponse[]> {
    const createdBlocks: BlockObjectResponse[] = [];
    // Split children into chunks of 100 blocks
    for (
      let i = 0;
      i < children.length;
      i += this.APPEND_BLOCK_CHILDREN_CHUNK_SIZE
    ) {
      const chunk = children.slice(
        i,
        i + this.APPEND_BLOCK_CHILDREN_CHUNK_SIZE
      );
      const response = await this.client.blocks.children.append({
        block_id: blockId,
        children: chunk,
        after: afterBlockId,
      });

      if (response.results.length > 0) {
        createdBlocks.push(...(response.results as BlockObjectResponse[]));
      }

      afterBlockId = createdBlocks[createdBlocks.length - 1]?.id;
    }

    return createdBlocks;
  }

  public async deleteBlock({ blockId }: { blockId: string }): Promise<void> {
    await this.client.blocks.delete({ block_id: blockId });
  }

  private readonly DELETE_BLOCKS_CHUNK_SIZE = 50;
  public async deleteBlocks({
    blockIds,
  }: {
    blockIds: string[];
  }): Promise<void> {
    for (let i = 0; i < blockIds.length; i += this.DELETE_BLOCKS_CHUNK_SIZE) {
      const chunk = blockIds.slice(i, i + this.DELETE_BLOCKS_CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (blockId) =>
          this.client.blocks.delete({ block_id: blockId })
        )
      );
    }
  }
  public async getBlock({
    blockId,
  }: {
    blockId: string;
  }): Promise<BlockObjectResponse> {
    const response = await this.client.blocks.retrieve({ block_id: blockId });

    return response as BlockObjectResponse;
  }

  public async updateBlock({
    blockId,
    block,
  }: {
    blockId: string;
    block: BlockObjectRequest;
  }): Promise<BlockObjectResponse> {
    const response = await this.client.blocks.update({
      block_id: blockId,
      ...block,
    });
    return response as BlockObjectResponse;
  }

  public async getBlockChildren({
    blockId,
  }: {
    blockId: string;
  }): Promise<BlockObjectResponse[]> {
    const response = await this.client.blocks.children.list({
      block_id: blockId,
    });
    return response.results as BlockObjectResponse[];
  }
}
