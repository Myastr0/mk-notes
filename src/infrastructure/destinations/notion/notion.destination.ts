import {
  BlockObjectResponse,
  DatabaseObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import winston from 'winston';

import { PageElement } from '@/domains/elements/entities/Element';
import { NotionPage } from '@/domains/notion/entities/NotionPage';
import {
  isNotionNestingValidationError,
  NotionNestingValidationError,
} from '@/domains/notion/error';
import { NotionClientRepository } from '@/domains/notion/repositories/notion-client.repository';
import {
  BlockObjectRequest,
  BlockObjectRequestWithoutChildren,
  DatabaseProperty,
  Icon,
  Parent,
} from '@/domains/notion/types';
import {
  DestinationRepository,
  ObjectType,
  PageLockedStatus,
} from '@/domains/synchronization/repositories/destination.repository';
import { NotionConverterRepository } from '@/infrastructure/converters/notion/notion.converter';

export interface UpdatePageInput {
  pageId: string;
  blocks?: BlockObjectRequest[] | BlockObjectRequestWithoutChildren[];
  title?: string;
  icon?: Icon;
}

export class NotionDestinationRepository
  implements DestinationRepository<NotionPage>
{
  private notionClient: NotionClientRepository;
  private logger: winston.Logger;
  private notionConverter: NotionConverterRepository;

  constructor({
    logger,
    notionClient,
    notionConverter,
  }: {
    notionClient: NotionClientRepository;
    logger: winston.Logger;
    notionConverter: NotionConverterRepository;
  }) {
    this.notionClient = notionClient;
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
      const blocks = await this.notionClient.getBlockChildren({
        blockId: parentPageId,
      });

      await this.notionClient.deleteBlocks({
        blockIds: blocks.map((block) => block.id),
      });
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
    let page: NotionPage | null = null;

    try {
      page = await this.notionClient.getPage({ pageId: parentObjectId });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Discard error, we'll check if it's a database
    }

    if (page) {
      return true;
    }

    let database: DatabaseObjectResponse | null = null;
    try {
      database = await this.notionClient.getDatabaseById({
        databaseId: parentObjectId,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Discard error, we'll check if it's a page
    }

    if (database) {
      return true;
    }

    return false;
  }

  async getPage({ pageId }: { pageId: string }): Promise<NotionPage | null> {
    const notionPage = await this.notionClient.getPage({
      pageId,
    });

    if (!notionPage) {
      return null;
    }

    const blocks = await this.notionClient.getPageBlocks({ pageId: pageId });

    notionPage.children = blocks;

    return notionPage;
  }

  async createPage({
    parentObjectId,
    parentObjectType,
    pageElement,
  }: {
    parentObjectId: string;
    parentObjectType: ObjectType;
    pageElement: PageElement;
  }): Promise<NotionPage> {
    if (parentObjectType === 'unknown') {
      throw new Error('Unknown parent object type');
    }

    let parent: Parent | undefined;
    const availableProperties: DatabaseProperty[] = [];

    if (parentObjectType === 'page') {
      parent = { type: 'page_id', page_id: parentObjectId };
    }

    if (parentObjectType === 'database') {
      const datasourceId =
        await this.notionClient.getDataSourceIdFromDatabaseId({
          databaseId: parentObjectId,
        });

      if (!datasourceId) {
        throw new Error('Failed to get Datasource');
      }

      const datasource = await this.notionClient.getDataSourceById({
        dataSourceId: datasourceId,
      });

      if (!datasource) {
        throw new Error('Failed to get Datasource');
      }

      parent = { type: 'data_source_id', data_source_id: datasourceId };

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

    // First create the page without children
    const createdPage = await this.notionClient.createPage({
      parent,
      properties: notionPage.properties ?? {},
      icon: notionPage.icon,
      children: [],
    });

    if (!createdPage.pageId) {
      throw new Error('Failed to create Notion Page');
    }

    // If there are children blocks, append them in chunks
    if (notionPage.children && notionPage.children.length > 0) {
      const children = notionPage.children as BlockObjectRequest[];

      const createdBlocks = await this.notionClient.appendChildToBlock({
        blockId: createdPage.pageId,
        children: children,
      });

      createdPage.children = createdBlocks;
    }

    const page = await this.getPage({
      pageId: createdPage.pageId,
    });

    if (!page) {
      throw new Error('Failed to create Notion Page');
    }

    return page;
  }

  async updatePage({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }): Promise<NotionPage> {
    const notionPageId = pageId;

    const notionPage =
      await this.notionConverter.convertFromElement(pageElement);

    await this.notionClient.updatePage({
      pageId: notionPageId,
      icon: notionPage.icon,
      properties: notionPage.properties,
      archived: false,
    });

    let existingBlocks = await this.notionClient.getBlockChildren({
      blockId: notionPageId,
    });

    let afterBlockId: string | undefined;
    if (
      existingBlocks.length >= 2 &&
      existingBlocks[0].type === 'table_of_contents' &&
      existingBlocks[1].type === 'divider'
    ) {
      this.logger.warn(
        'First two blocks are TOC & Divider, appending to page after Divider'
      );
      afterBlockId = existingBlocks[1]?.id;
      existingBlocks = existingBlocks.slice(2);
    }

    // Remove all non-page blocks
    await this.removeNonPageBlocks({ blocks: existingBlocks });

    if (notionPage.children && notionPage.children?.length > 0) {
      let blocks = notionPage.children as BlockObjectRequest[];

      if (
        blocks.length >= 2 &&
        blocks[0]?.type === 'table_of_contents' &&
        blocks[1]?.type === 'divider'
      ) {
        blocks = blocks.slice(2);
      }

      await this.notionClient.appendChildToBlock({
        blockId: notionPageId,
        children: blocks,
        afterBlockId: afterBlockId,
      });
    }

    await this.removeUnusedPageBlocks({ pageElement, blocks: existingBlocks });

    const page = await this.getPage({ pageId: notionPageId });

    if (!page) {
      throw new Error('Failed to update Notion Page');
    }
    return page;
  }

  private async removeNonPageBlocks({
    blocks,
  }: {
    blocks: BlockObjectResponse[];
  }): Promise<void> {
    const blockIdsToDelete = blocks
      .filter((block) => block.type !== 'child_page')
      .map((block) => block.id);

    await this.notionClient.deleteBlocks({
      blockIds: blockIdsToDelete,
    });
  }

  private async removeUnusedPageBlocks({
    pageElement,
    blocks,
  }: {
    pageElement: PageElement;
    blocks: BlockObjectResponse[];
  }): Promise<void> {
    const pageBlocks = blocks.filter((block) => block.type === 'child_page');
    const newPageBlocksIds = pageElement.content
      .filter((element) => element instanceof PageElement)
      .map((element) => element.id);

    const unusedPageBlocks = pageBlocks
      .filter((block) => !newPageBlocksIds.includes(block.id))
      .map((block) => block.id);

    await this.notionClient.deleteBlocks({
      blockIds: unusedPageBlocks,
    });
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
        await this.notionClient.appendChildToBlock({
          blockId: pageId,
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
      await this.notionClient.updatePage({
        pageId,
        icon: notionPage.icon,
        properties: notionPage.properties,
      });
    }
  }

  async setPageLockedStatus({
    pageId,
    lockStatus,
  }: {
    pageId: string;
    lockStatus: PageLockedStatus;
  }): Promise<void> {
    const isLocked = lockStatus === 'locked';

    await this.notionClient.updatePage({
      pageId,
      isLocked,
    });
  }

  async getPageLockedStatus({
    pageId,
  }: {
    pageId: string;
  }): Promise<PageLockedStatus> {
    const page = await this.notionClient.getPage({ pageId });

    if (!page) {
      throw new Error('Page not found');
    }

    const isLocked = page.isLocked ?? false;

    if (isLocked === undefined) {
      return 'unlocked';
    }

    return isLocked ? 'locked' : 'unlocked';
  }

  async getObjectType({
    id,
  }: {
    id: string;
  }): Promise<'page' | 'database' | 'unknown'> {
    try {
      await this.notionClient.getPage({ pageId: id });
      return 'page';
    } catch {
      try {
        await this.notionClient.getDatabaseById({ databaseId: id });
        return 'database';
      } catch {
        return 'unknown';
      }
    }
  }
}
