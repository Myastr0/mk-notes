import { Logger } from 'winston';

import {
  DividerElement,
  Element,
  ElementConverterRepository,
  PageElement,
  TableOfContentsElement,
} from '@/domains/elements';
import { SiteMap, type TreeNode } from '@/domains/sitemap';
import {
  type DestinationRepository,
  type File,
  ObjectType,
  type Page,
  type SourceRepository,
} from '@/domains/synchronization';

interface SynchronizationServiceParams<T, U extends Page> {
  sourceRepository: SourceRepository<T>;
  destinationRepository: DestinationRepository<U>;
  elementConverter: ElementConverterRepository<Element, File>;
  logger: Logger;
}

export interface SynchronizeOptions {
  /** When true, delete all existing content before syncing */
  cleanSync: boolean;

  /** When true, lock the Notion page after syncing */
  lockPage: boolean;

  /** When true, and destination is a database, create all files as direct children */
  flat?: boolean;
}

export class SynchronizeMarkdownToNotion<T, U extends Page> {
  private sourceRepository: SourceRepository<T>;
  private destinationRepository: DestinationRepository<U>;
  private elementConverter: ElementConverterRepository<Element, File>;
  private logger: Logger;

  constructor(params: SynchronizationServiceParams<T, U>) {
    this.sourceRepository = params.sourceRepository;
    this.destinationRepository = params.destinationRepository;
    this.elementConverter = params.elementConverter;
    this.logger = params.logger;
  }

  async execute(
    args: T & {
      notionParentPageUrl: string;
    } & SynchronizeOptions
  ): Promise<void> {
    const {
      notionParentPageUrl,
      cleanSync,
      lockPage,
      flat = false,
      ...others
    } = args;

    const notionObjectId = this.destinationRepository.getObjectIdFromObjectUrl({
      objectUrl: notionParentPageUrl,
    });

    // Check if the Notion page is accessible
    const destinationIsAccessible =
      await this.destinationRepository.destinationIsAccessible({
        parentObjectId: notionObjectId,
      });

    if (!destinationIsAccessible) {
      throw new Error('Destination is not accessible');
    }

    // Check if the source is accessible
    try {
      await this.sourceRepository.sourceIsAccessible(others as T);
    } catch (err) {
      throw new Error(`Source is not accessible:`, {
        cause: err,
      });
    }

    const parentObjectType = await this.destinationRepository.getObjectType({
      id: notionObjectId,
    });

    if (parentObjectType === 'unknown') {
      throw new Error('Parent object type is unknown');
    }

    if (flat && parentObjectType === 'page') {
      throw new Error(
        'Flat sync is only supported for database destinations. Pages do not support flat sync.'
      );
    }

    try {
      this.logger.info('Starting synchronization process');

      const filePaths = await this.sourceRepository.getFilePathList(
        others as T
      );

      const siteMap = SiteMap.buildFromFilePaths(filePaths);

      if (flat && parentObjectType === 'database') {
        siteMap.flatten();
      }

      // Traverse the SiteMap and synchronize files
      await this.synchronizeTreeNode({
        node: siteMap.root,
        parentObjectId: notionObjectId,
        parentObjectType,
        lockPage,
        cleanSync,
        flat,
      });

      this.logger.info('Synchronization process completed successfully');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Synchronization process failed`, {
          error,
        });
      }
      throw error;
    }
  }

  /**
   * Fetches a file and converts it to a PageElement
   */
  private async fetchAndConvertToPageElement(
    filePath: string
  ): Promise<PageElement> {
    const file = await this.sourceRepository.getFile({ path: filePath } as T);

    if (this.elementConverter.setCurrentFilePath) {
      this.elementConverter.setCurrentFilePath(filePath);
    }

    const element = this.elementConverter.convertToElement(file);

    if (!(element instanceof PageElement)) {
      throw new Error('Element is not a PageElement');
    }

    return element;
  }

  /**
   * Locks a page if locking is enabled
   */
  private async lockPageIfNeeded(
    pageId: string,
    shouldLock: boolean
  ): Promise<void> {
    if (shouldLock) {
      await this.destinationRepository.setPageLockedStatus({
        pageId,
        lockStatus: 'locked',
      });
      this.logger.info(`Locked page ${pageId}`);
    }
  }

  /**
   * Synchronizes the root node to the parent object (page or database)
   * Returns the page ID to use as parent for child nodes
   */
  private async synchronizeRootNode({
    node,
    parentObjectId,
    parentObjectType,
    lockPage,
    cleanSync,
  }: {
    node: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    lockPage: boolean;
    cleanSync: boolean;
  }): Promise<string> {
    this.logger.info(
      `Adding content from ${node.filepath} to parent ${parentObjectType}`
    );

    const pageElement = await this.fetchAndConvertToPageElement(node.filepath);

    if (parentObjectType === 'unknown') {
      throw new Error('Parent object type is unknown');
    }

    if (parentObjectType === 'page') {
      // If clean sync is enabled, delete all existing content first
      if (cleanSync) {
        this.logger.info('Clean sync enabled - removing existing content');
        try {
          await this.destinationRepository.deleteChildBlocks({
            parentPageId: parentObjectId,
          });
          this.logger.info('Successfully removed existing content');
        } catch (error) {
          this.logger.warn(
            'Failed to remove existing content, continuing with sync',
            { error }
          );
        }
      }

      await this.destinationRepository.appendToPage({
        pageId: parentObjectId,
        pageElement,
      });

      this.logger.info(`Added content from ${node.filepath} to parent page`);

      await this.lockPageIfNeeded(parentObjectId, lockPage);

      return parentObjectId;
    }

    if (cleanSync) {
      await this.cleanSyncDatabase({
        databaseId: parentObjectId,
        pageElement,
      });
    }

    // parentObjectType === 'database'
    const newPage = await this.destinationRepository.createPage({
      pageElement,
      parentObjectId,
      parentObjectType,
      filePath: node.filepath,
    });

    if (!newPage.pageId) {
      throw new Error('New page ID is undefined');
    }

    return newPage.pageId;
  }

  private async cleanSyncDatabase({
    databaseId,
    pageElement,
  }: {
    databaseId: string;
    pageElement: PageElement;
  }): Promise<void> {
    if (pageElement.mkNotesInternalId === undefined) {
      this.logger.warn(
        'mk-notes-internal-id is undefined, skipping clean sync'
      );
      return;
    }

    await this.destinationRepository.deletePagesInDatabaseByInternalId({
      databaseId,
      mkNotesInternalId: pageElement.mkNotesInternalId,
    });
  }
  /**
   * Synchronizes a child node and its descendants recursively
   */
  private async synchronizeChildNode({
    childNode,
    parentObjectId,
    lockPage,
    cleanSync,
    parentObjectType = 'page',
  }: {
    childNode: TreeNode;
    parentObjectId: string;
    lockPage: boolean;
    cleanSync: boolean;
    parentObjectType?: ObjectType;
  }): Promise<void> {
    const filePath = childNode.filepath;
    this.logger.info(`Processing file: ${filePath}`);

    const pageElement = await this.fetchAndConvertToPageElement(filePath);

    // Add standard elements at the beginning (in reverse order)
    pageElement.addElementToBeginning(new TableOfContentsElement());
    pageElement.addElementToBeginning(new DividerElement());

    if (childNode.children.length > 0) {
      pageElement.addElementToEnd(new DividerElement());
    }

    // If parent is a database (e.g. in flat sync), we need to clean up previous version of this specific page
    if (parentObjectType === 'database' && cleanSync) {
      if (!pageElement.mkNotesInternalId) {
        this.logger.warn(
          'mk-notes-internal-id is undefined, skipping clean sync for child node'
        );
      } else {
        await this.destinationRepository.deletePagesInDatabaseByInternalId({
          databaseId: parentObjectId,
          mkNotesInternalId: pageElement.mkNotesInternalId,
        });
      }
    }

    const newPage = await this.destinationRepository.createPage({
      pageElement,
      parentObjectId,
      parentObjectType,
      filePath,
    });

    this.logger.info(`Created Notion page for file: ${filePath}`);

    if (!newPage.pageId) {
      throw new Error('Page ID is undefined');
    }

    // Recursively process children
    for (const grandChild of childNode.children) {
      await this.synchronizeChildNode({
        childNode: grandChild,
        parentObjectId: newPage.pageId,
        lockPage,
        cleanSync,
      });
    }

    await this.lockPageIfNeeded(newPage.pageId, lockPage);
  }

  /**
   * Main orchestrator for synchronizing a tree node and its children
   */
  private async synchronizeTreeNode({
    node,
    parentObjectId,
    parentObjectType,
    lockPage,
    cleanSync,
    flat = false,
  }: {
    node: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    lockPage: boolean;
    cleanSync: boolean;
    flat?: boolean;
  }): Promise<void> {
    let parentPageId: string = parentObjectId;

    const isFlatSync = flat && parentObjectType === 'database';

    switch (parentObjectType) {
      case 'unknown':
        throw new Error('Parent object type is unknown');
      case 'database':
        parentPageId = await this.handleDatabaseSynchronization({
          node,
          parentObjectId,
          parentObjectType,
          lockPage,
          cleanSync,
          isFlatSync,
        });
        break;
      case 'page':
        if (this.getIsRootNode(node)) {
          parentPageId = await this.synchronizeRootNode({
            node,
            parentObjectId,
            parentObjectType,
            lockPage,
            cleanSync,
          });
        }
        break;
      default:
        throw new Error('Invalid parent object type');
    }

    for (const childNode of node.children) {
      try {
        await this.synchronizeChildNode({
          childNode,
          parentObjectId: parentPageId,
          lockPage,
          cleanSync,
          parentObjectType: isFlatSync ? 'database' : 'page',
        });
      } catch (error) {
        this.logger.error(`Failed to synchronize file: ${childNode.filepath}`, {
          error,
        });
        throw error;
      }
    }
  }

  private async handleDatabaseSynchronization({
    node,
    parentObjectId,
    parentObjectType,
    lockPage,
    cleanSync,
    isFlatSync,
  }: {
    node: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    lockPage: boolean;
    cleanSync: boolean;
    isFlatSync: boolean;
  }): Promise<string> {
    if (isFlatSync) {
      if (this.getIsRootNode(node)) {
        await this.synchronizeRootNode({
          node,
          parentObjectId,
          parentObjectType,
          lockPage,
          cleanSync,
        });
      }
      return parentObjectId;
    }

    if (this.getIsRootNode(node)) {
      return await this.synchronizeRootNode({
        node,
        parentObjectId,
        parentObjectType,
        lockPage,
        cleanSync,
      });
    }

    return await this.synchronizeRootNode({
      node: node.children[0],
      parentObjectId,
      parentObjectType,
      lockPage,
      cleanSync,
    });
  }

  private getIsRootNode(node: TreeNode): boolean {
    return node.parent === null && !['', undefined].includes(node.filepath);
  }
}
