import { Client, isFullPage, LogLevel } from '@notionhq/client';
import {
  BlockObjectResponse,
  CreatePageParameters,
  GetDatabaseResponse,
  GetDataSourceResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints';
import winston from 'winston';

import { PageElement } from '@/domains/elements/Element';
import {
  isNotionNestingValidationError,
  NotionNestingValidationError,
} from '@/domains/notion/error';
import { NotionPage } from '@/domains/notion/NotionPage';
import {
  DestinationRepository,
  ObjectType,
  PageLockedStatus,
} from '@/domains/synchronization/destination.repository';

import {
  BlockObjectRequest,
  BlockObjectRequestWithoutChildren,
  DatabaseProperty,
  Icon,
  Parent,
  TitleProperty,
} from '../../domains/notion/types';
import { NotionConverterRepository } from './notion.converter';
import { isBlockEquals } from './utils';

export interface UpdatePageInput {
  pageId: string;
  blocks?: BlockObjectRequest[] | BlockObjectRequestWithoutChildren[];
  title?: string;
  icon?: Icon;
}

export class NotionDestinationRepository
  implements DestinationRepository<NotionPage>
{
  private client: Client;
  private logger: winston.Logger;
  private notionConverter: NotionConverterRepository;

  constructor({
    apiKey,
    logger,
    notionConverter,
  }: {
    apiKey: string;
    logger: winston.Logger;
    notionConverter: NotionConverterRepository;
  }) {
    this.client = new Client({
      auth: apiKey,
      logLevel: LogLevel.ERROR,
    });
    this.logger = logger;
    this.notionConverter = notionConverter;
  }

  /**
   * Delete all child blocks from a parent page
   */
  async deleteChildBlocks({
    parentPageId,
  }: {
    parentPageId: string;
  }): Promise<void> {
    try {
      // Get all blocks in the parent page
      const blocks = await this.getBlocksFromPage({
        notionPageId: parentPageId,
      });

      // Delete each block
      for (const block of blocks) {
        await this.client.blocks.delete({ block_id: block.id });
      }
    } catch (error: unknown) {
      // Deletion failed - throw the error to be handled upstream
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  getObjectIdFromObjectUrl({ objectUrl }: { objectUrl: string }): string {
    const urlObj = new URL(objectUrl);

    // Notion IDs are 32-character hexadecimal strings (UUID without dashes)
    // They can be embedded in path segments like "MK-Notes-4dd0bd3dc73648a9a55dcf05dd03080f"
    const notionIdRegex = /[a-f0-9]{32}/gi;
    const matches = urlObj.pathname.match(notionIdRegex);

    if (!matches || matches.length === 0) {
      throw new Error('Invalid Notion URL: No valid Notion ID found');
    }

    // Return the last match (closest to the end of the URL path)
    return matches[matches.length - 1];
  }

  async destinationIsAccessible({
    parentObjectId,
  }: {
    parentObjectId: string;
  }): Promise<boolean> {
    try {
      await this.getPage({ pageId: parentObjectId });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      try {
        await this.getDatabaseById({ databaseId: parentObjectId });
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        return false;
      }
    }
  }

  async getPageById({
    notionPageId,
  }: {
    notionPageId: string;
  }): Promise<NotionPage> {
    const pageObjectResponse = await this.client.pages.retrieve({
      page_id: notionPageId,
    });

    if (!isFullPage(pageObjectResponse)) {
      throw new Error('Not able to retrieve Notion Page');
    }

    const blocks = await this.getBlocksFromPage({ notionPageId });

    return new NotionPage({
      pageId: pageObjectResponse.id,
      children: blocks,
      createdAt: new Date(pageObjectResponse.created_time),
      updatedAt: new Date(pageObjectResponse.last_edited_time),
      isLocked: pageObjectResponse.is_locked ?? false,
    });
  }

  async createPage({
    parentObjectId,
    parentObjectType,
    pageElement,
    filePath,
  }: {
    parentObjectId: string;
    parentObjectType: ObjectType;
    pageElement: PageElement;
    filePath?: string;
  }): Promise<NotionPage> {
    // Set the current file path for image resolution
    if (filePath) {
      this.notionConverter.setCurrentFilePath(filePath);
    }

    if (parentObjectType === 'unknown') {
      throw new Error('Unknown parent object type');
    }

    let parent: Parent | undefined;
    const availableProperties: DatabaseProperty[] = [];

    if (parentObjectType === 'page') {
      parent = { type: 'page_id', page_id: parentObjectId };
    }

    if (parentObjectType === 'database') {
      const database = await this.getDatabaseById({
        databaseId: parentObjectId,
      });

      if (!('data_sources' in database)) {
        throw new Error('Database does not have any datasources');
      }

      const datasource = await this.getDatasourceByDatasourceId({
        datasourceId: database.data_sources[0].id,
      });

      parent = { type: 'data_source_id', data_source_id: datasource.id };

      availableProperties.push(
        ...Object.entries(datasource.properties).map(([name, property]) => ({
          name,
          definition: property,
          type: property.type,
        }))
      );
    }

    const notionPage = await this.notionConverter.convertFromElement(
      pageElement,
      availableProperties
    );

    const NOTION_BLOCK_LIMIT = 100;

    // First create the page without children
    const { id: notionPageId } = await this.client.pages.create({
      parent,
      properties: notionPage.properties as CreatePageParameters['properties'],
      icon: notionPage.icon,
      children: [], // Create page without children initially
    });

    // If there are children blocks, append them in chunks
    if (notionPage.children && notionPage.children.length > 0) {
      const children = notionPage.children as BlockObjectRequest[];

      // Split children into chunks of 100 blocks
      for (let i = 0; i < children.length; i += NOTION_BLOCK_LIMIT) {
        const chunk = children.slice(i, i + NOTION_BLOCK_LIMIT);
        await this.client.blocks.children.append({
          block_id: notionPageId,
          children: chunk,
        });
      }
    }

    return this.getPageById({ notionPageId });
  }

  async updateBlock({
    blockId,
    block,
  }: {
    blockId: string;
    block: BlockObjectRequest;
  }) {
    return this.client.blocks.update({
      block_id: blockId,
      ...block,
    });
  }

  async getPage({ pageId }: { pageId: string }): Promise<PageObjectResponse> {
    const page = await this.client.pages.retrieve({ page_id: pageId });

    return page as PageObjectResponse;
  }

  async getChildBlocksFromBlock({
    blockId,
  }: {
    blockId: string;
  }): Promise<BlockObjectResponse[]> {
    const response = await this.client.blocks.children.list({
      block_id: blockId,
    });
    return response.results as BlockObjectResponse[];
  }

  async getBlocksFromPage({
    notionPageId,
  }: {
    notionPageId: string;
  }): Promise<(BlockObjectResponse | PartialBlockObjectResponse)[]> {
    const blocks = await this.client.blocks.children.list({
      block_id: notionPageId,
    });

    return blocks.results;
  }
  async updatePage({
    pageId,
    pageElement,
    filePath,
  }: {
    pageId: string;
    pageElement: PageElement;
    filePath?: string;
  }): Promise<NotionPage> {
    const notionPageId = pageId;

    // Set the current file path for image resolution
    if (filePath) {
      this.notionConverter.setCurrentFilePath(filePath);
    }

    const notionPage =
      await this.notionConverter.convertFromElement(pageElement);

    const updateBody: UpdatePageParameters = {
      page_id: notionPageId,
      properties: {},
    };

    if (notionPage.icon) {
      updateBody.icon = notionPage.icon;
    }

    if (notionPage?.properties?.Name) {
      updateBody.properties!['Title'] = notionPage.properties
        .Title as TitleProperty;
    }

    await this.client.pages.update({
      page_id: notionPageId,
      icon: notionPage.icon,
      properties: updateBody.properties,
    });

    const existingBlocks = await this.getChildBlocksFromBlock({
      blockId: notionPageId,
    });

    const pageBlocks = existingBlocks;

    if (notionPage.children && notionPage.children?.length > 0) {
      const blocks = notionPage.children;

      const promises = existingBlocks
        .filter((existingBlock, index) => {
          // @ts-expect-error - We know that the blocks are not equal
          return !isBlockEquals(blocks[index], existingBlock);
        })
        .map(async (existingBlock, index) =>
          this.client.blocks
            .update({
              block_id: existingBlock.id,
              ...blocks[index],
            })
            .then((block) => {
              pageBlocks[index] = block as BlockObjectResponse;
            })
        );

      await Promise.all(promises);
    }
    // Now it's time to compare the existing blocks with the new blocks
    // and update the existing blocks with the new ones

    return this.getPageById({ notionPageId });
  }

  // Used for root level index.md where the page is already present
  async appendToPage({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }): Promise<void> {
    const notionPage =
      await this.notionConverter.convertFromElement(pageElement);

    // Update page properties (title/icon) if specified in metadata
    await this.updatePageProperties({ pageId, pageElement });

    if (notionPage.children && notionPage.children.length > 0) {
      // Append blocks to the existing page
      try {
        await this.client.blocks.children.append({
          block_id: pageId,
          children: notionPage.children as BlockObjectRequest[],
        });
      } catch (error) {
        if (isNotionNestingValidationError(error)) {
          throw new NotionNestingValidationError({ message: 'Nesting error' });
        }

        this.logger.debug(`Failed to append block to page ${pageId}:`, {
          error,
          block: notionPage.children,
        });
        throw error;
      }
    }
  }

  async updatePageProperties({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }): Promise<void> {
    const notionPage =
      await this.notionConverter.convertFromElement(pageElement);

    // Only update if there are properties to update
    if (notionPage.properties || notionPage.icon) {
      // Update page properties and icon separately to avoid type conflicts
      const updatePayload: {
        page_id: string;
        properties?: unknown;
        icon?: unknown;
      } = {
        page_id: pageId,
      };

      if (notionPage.properties) {
        updatePayload.properties = notionPage.properties;
      }

      if (notionPage.icon) {
        updatePayload.icon = notionPage.icon;
      }

      await this.client.pages.update(
        updatePayload as Parameters<typeof this.client.pages.update>[0]
      );
    }
  }

  async search({
    filter,
  }: {
    filter: { property: 'object'; value: 'page' | 'data_source' };
  }) {
    return this.client.search({
      filter,
    });
  }

  async setPageLockedStatus({
    pageId,
    lockStatus,
  }: {
    pageId: string;
    lockStatus: PageLockedStatus;
  }): Promise<void> {
    const isLocked = lockStatus === 'locked';

    await this.client.pages.update({
      page_id: pageId,
      is_locked: isLocked,
    });
  }

  async getPageLockedStatus({
    pageId,
  }: {
    pageId: string;
  }): Promise<PageLockedStatus> {
    const page = await this.client.pages.retrieve({ page_id: pageId });

    const isLocked = (page as PageObjectResponse).properties?.is_locked;

    if (isLocked === undefined) {
      return 'unlocked';
    }

    return isLocked ? 'locked' : 'unlocked';
  }

  async getDatabaseById({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<GetDatabaseResponse> {
    return this.client.databases.retrieve({
      database_id: databaseId,
    });
  }

  async getObjectType({
    id,
  }: {
    id: string;
  }): Promise<'page' | 'database' | 'unknown'> {
    try {
      await this.client.pages.retrieve({ page_id: id });
      return 'page';
    } catch {
      try {
        await this.client.databases.retrieve({ database_id: id });
        return 'database';
      } catch {
        return 'unknown';
      }
    }
  }

  async getDatasourceByDatasourceId({
    datasourceId,
  }: {
    datasourceId: string;
  }): Promise<GetDataSourceResponse> {
    return this.client.dataSources.retrieve({
      data_source_id: datasourceId,
    });
  }
}
