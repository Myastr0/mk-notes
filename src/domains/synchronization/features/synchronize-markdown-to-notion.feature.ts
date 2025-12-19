import { Logger } from 'winston';

import {
  DividerElement,
  Element,
  ElementConverterRepository,
  PageElement,
  TableOfContentsElement,
} from '@/domains/elements';
import { EventLoggerRepository } from '@/domains/event-logs/repositories/event-logger.repository';
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
  eventLogger: EventLoggerRepository;
}

export interface SynchronizeOptions {
  /** When true, delete all existing content before syncing */
  cleanSync: boolean;

  /** When true, lock the Notion page after syncing */
  lockPage: boolean;

  /** When true, save the page ID to the source repository */
  saveId: boolean;

  /** When true, force a new page to be created */
  forceNew: boolean;

  /** When true, flatten the site map */
  flatten: boolean;
}

export type SynchronizationResult = {
  page: PageElement;
  treeNodeId: string;
};
export class SynchronizeMarkdownToNotion<T, U extends Page> {
  private sourceRepository: SourceRepository<T>;
  private destinationRepository: DestinationRepository<U>;
  private elementConverter: ElementConverterRepository<Element, File>;
  private eventLogger: EventLoggerRepository;
  private logger: Logger;

  constructor(params: SynchronizationServiceParams<T, U>) {
    this.sourceRepository = params.sourceRepository;
    this.destinationRepository = params.destinationRepository;
    this.elementConverter = params.elementConverter;
    this.logger = params.logger;
    this.eventLogger = params.eventLogger;
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
      saveId,
      forceNew,
      flatten,
      ...others
    } = args;

    const notionObjectId = this.destinationRepository.getObjectIdFromObjectUrl({
      objectUrl: notionParentPageUrl,
    });

    this.eventLogger.start(
      'check-destination-is-accessible',
      'Checking if the destination is accessible'
    );
    // Check if the Notion page is accessible
    const destinationIsAccessible =
      await this.destinationRepository.destinationIsAccessible({
        parentObjectId: notionObjectId,
      });

    if (!destinationIsAccessible) {
      this.eventLogger.fail(
        'check-destination-is-accessible',
        'Destination is not accessible'
      );
      throw new Error('Destination is not accessible');
    }

    this.eventLogger.succeed(
      'check-destination-is-accessible',
      'Destination is accessible'
    );

    this.eventLogger.start(
      'check-source-is-accessible',
      'Checking if the source is accessible'
    );
    // Check if the source is accessible
    try {
      await this.sourceRepository.sourceIsAccessible(others as T);
    } catch (err) {
      this.eventLogger.fail(
        'check-source-is-accessible',
        `Source is not accessible: ${JSON.stringify(others)}`
      );
      throw new Error(`Source is not accessible:`, {
        cause: err,
      });
    }

    this.eventLogger.succeed(
      'check-source-is-accessible',
      'Source is accessible'
    );

    const parentObjectType = await this.destinationRepository.getObjectType({
      id: notionObjectId,
    });

    if (parentObjectType === 'unknown') {
      throw new Error('Parent object type is unknown');
    }

    try {
      this.logger.info('Starting synchronization process');

      const filePaths = await this.sourceRepository.getFilePathList(
        others as T
      );

      let siteMap = SiteMap.buildFromFilePaths(filePaths);

      if (flatten) {
        siteMap = siteMap.flatten();
      }

      this.eventLogger.startProgress(
        'synchronization-process',
        'Starting synchronization process',
        siteMap.size
      );

      // Traverse the SiteMap and synchronize files
      const pages = await this.synchronizeTreeNode({
        node: siteMap.root,
        parentObjectId: notionObjectId,
        parentObjectType,
        lockPage,
        cleanSync,
        forceNew,
        flatten,
      });

      this.eventLogger.succeedProgress('synchronization-process');

      this.logger.info('Synchronization process completed successfully');

      if (saveId) {
        await this.executeSaveIdOperation(pages);
        this.logger.info('Page IDs saved to source repository');
      }
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
   * -------------
   * PRIVATE METHODS
   * -------------
   */

  /**
   * Executes the save ID operation
   */
  private async executeSaveIdOperation(
    syncResult: SynchronizationResult[]
  ): Promise<void> {
    const promises = syncResult.map(async (element) => {
      const file = await this.elementConverter.convertFromElement(element.page);
      await this.sourceRepository.updateFile(file);
    });
    await Promise.all(promises);
  }

  /**
   * Fetches a file and converts it to a PageElement
   */
  private async fetchAndConvertToPageElement(
    filePath: string,
    { forceNew }: { forceNew?: boolean } = {}
  ): Promise<PageElement> {
    const file = await this.sourceRepository.getFile({ path: filePath } as T);

    const element = this.elementConverter.convertToElement(file);

    if (!(element instanceof PageElement)) {
      throw new Error('Element is not a PageElement');
    }

    if (forceNew) {
      element.id = undefined;
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
   * Main orchestrator for synchronizing a tree node and its children
   */
  private async synchronizeTreeNode({
    node,
    parentObjectId,
    parentObjectType,
    lockPage,
    cleanSync,
    forceNew,
    flatten,
  }: {
    node: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    lockPage: boolean;
    cleanSync: boolean;
    forceNew: boolean;
    flatten: boolean;
  }): Promise<SynchronizationResult[]> {
    this.validateParentObjectType(parentObjectType);

    const nodeToSync = this.getNodeToSynchronize(node, parentObjectType);

    const results: SynchronizationResult[] = [];

    let rootPageElement: PageElement | undefined;

    // If not flattening, synchronize the root node
    if (!flatten) {
      const { page: rootPageElement, treeNodeId: rootTreeNodeId } =
        await this.synchronizeRootNode({
          node: nodeToSync,
          parentObjectId,
          parentObjectType,
          lockPage,
          cleanSync,
          forceNew,
          flatten,
        });

      results.push({ page: rootPageElement, treeNodeId: rootTreeNodeId });
    }

    for (const childNode of node.children) {
      try {
        const childResults = await this.synchronizeChildNode({
          childNode,
          parentObjectId: rootPageElement?.id ?? parentObjectId,
          parentObjectType: rootPageElement ? 'page' : parentObjectType,
          lockPage,
          forceNew,
        });
        results.push(...childResults);
      } catch (error) {
        this.logger.error(`Failed to synchronize file: ${childNode.filepath}`, {
          error,
        });
        throw error;
      }
    }

    return results;
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
    forceNew,
    flatten,
  }: {
    node: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    lockPage: boolean;
    cleanSync: boolean;
    forceNew: boolean;
    flatten: boolean;
  }): Promise<SynchronizationResult> {
    this.logger.info(
      `Adding content from ${node.filepath} to parent ${parentObjectType}`
    );

    const pageElement = await this.fetchAndConvertToPageElement(node.filepath, {
      forceNew,
    });

    if (pageElement.id !== undefined) {
      const existingPage = await this.destinationRepository.getPage({
        pageId: pageElement.id,
      });

      if (existingPage) {
        await this.destinationRepository.updatePage({
          pageElement,
          pageId: pageElement.id,
        });

        return {
          page: pageElement,
          treeNodeId: node.id,
        };
      }
    }

    let result: SynchronizationResult;
    switch (parentObjectType) {
      case 'page':
        result = await this.synchronizeRootNodeWithParentPage({
          node,
          parentObjectId,
          parentObjectType,
          pageElement,
          lockPage,
          cleanSync,
          flatten,
        });
        break;
      case 'database':
        result = await this.synchronizeRootNodeWithParentDatabase({
          node,
          parentObjectId,
          parentObjectType,
          pageElement,
          cleanSync,
        });
        break;
      case 'unknown':
      default:
        throw new Error(`Invalid parent object type: ${parentObjectType}`);
    }

    this.eventLogger.updateProgress('synchronization-process', 1);
    return result;
  }

  private async synchronizeRootNodeWithParentPage({
    node,
    parentObjectId,
    parentObjectType,
    pageElement,
    lockPage,
    cleanSync,
    flatten,
  }: {
    node: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    pageElement: PageElement;
    lockPage: boolean;
    cleanSync: boolean;
    flatten: boolean;
  }): Promise<SynchronizationResult> {
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

    if (flatten) {
      const newPage = await this.destinationRepository.createPage({
        pageElement,
        parentObjectId,
        parentObjectType,
      });

      pageElement.id = newPage.pageId;

      return { page: pageElement, treeNodeId: node.id };
    }

    const updatedPage = await this.destinationRepository.updatePage({
      pageId: parentObjectId,
      pageElement,
    });

    pageElement.id = updatedPage.pageId;

    this.logger.info(`Updated parent page ${parentObjectId}`);

    await this.lockPageIfNeeded(parentObjectId, lockPage);

    return { page: pageElement, treeNodeId: node.id };
  }

  private async synchronizeRootNodeWithParentDatabase({
    node,
    parentObjectId,
    parentObjectType,
    pageElement,
    cleanSync,
  }: {
    node: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    pageElement: PageElement;
    cleanSync: boolean;
  }): Promise<SynchronizationResult> {
    // If clean sync is enabled, delete all existing content first

    if (cleanSync) {
      await this.destinationRepository.deleteChildBlocks({
        parentPageId: parentObjectId,
      });
    }

    // parentObjectType === 'database'
    const newPage = await this.destinationRepository.createPage({
      pageElement,
      parentObjectId,
      parentObjectType,
    });

    if (!newPage.pageId) {
      throw new Error('New page ID is undefined');
    }

    pageElement.id = newPage.pageId;

    return { page: pageElement, treeNodeId: node.id };
  }
  /**
   * Synchronizes a child node and its descendants recursively
   */
  private async synchronizeChildNode({
    childNode,
    parentObjectId,
    parentObjectType,
    lockPage,
    forceNew,
  }: {
    childNode: TreeNode;
    parentObjectId: string;
    parentObjectType: ObjectType;
    lockPage: boolean;
    forceNew: boolean;
  }): Promise<SynchronizationResult[]> {
    const syncResult: SynchronizationResult[] = [];
    const filePath = childNode.filepath;
    this.logger.info(`Processing file: ${filePath}`);

    const pageElement = await this.fetchAndConvertToPageElement(filePath, {
      forceNew,
    });

    if (pageElement.id !== undefined) {
      await this.destinationRepository.updatePage({
        pageId: pageElement.id,
        pageElement,
      });
    } else {
      // Add standard elements at the beginning (in reverse order)
      pageElement.addElementToBeginning(new TableOfContentsElement());
      pageElement.addElementToBeginning(new DividerElement());

      if (childNode.children.length > 0) {
        pageElement.addElementToEnd(new DividerElement());
      }

      const newPage = await this.destinationRepository.createPage({
        pageElement,
        parentObjectId,
        parentObjectType,
      });

      this.logger.info(`Created Notion page for file: ${filePath}`);

      if (!newPage.pageId) {
        throw new Error('Page ID is undefined');
      }

      pageElement.id = newPage.pageId;
    }

    this.eventLogger.updateProgress('synchronization-process', 1);
    syncResult.push({
      page: pageElement,
      treeNodeId: childNode.id,
    });

    // Recursively process children
    await Promise.all(
      childNode.children.map(async (grandChild) => {
        const grandChildSyncResult = await this.synchronizeChildNode({
          childNode: grandChild,
          parentObjectId: pageElement.id!,
          parentObjectType: 'page',
          lockPage,
          forceNew,
        });
        syncResult.push(...grandChildSyncResult);
      })
    );

    await this.lockPageIfNeeded(pageElement.id, lockPage);

    return syncResult;
  }

  private getIsRootNode(node: TreeNode): boolean {
    return node.parent === null && !['', undefined].includes(node.filepath);
  }

  /**
   * Validates that the parent object type is supported for synchronization
   */
  private validateParentObjectType(parentObjectType: ObjectType): void {
    if (parentObjectType === 'unknown') {
      throw new Error('Parent object type is unknown');
    }

    if (!['database', 'page'].includes(parentObjectType)) {
      throw new Error(`Invalid parent object type: ${parentObjectType}`);
    }
  }

  /**
   * Determines the effective node to synchronize as root based on parent type
   * For database parents with non-root nodes, uses the first child
   * For page parents, returns null if the node is not a root node
   */
  private getNodeToSynchronize(
    node: TreeNode,
    parentObjectType: ObjectType
  ): TreeNode {
    const isRootNode = this.getIsRootNode(node);

    if (parentObjectType === 'database' && !isRootNode) {
      return node.children[0];
    }

    if (parentObjectType === 'page' && !isRootNode) {
      return node.children[0];
    }

    return node;
  }
}
