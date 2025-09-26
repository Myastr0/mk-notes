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
  cleanSync?: boolean;
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
    const { notionParentPageUrl, cleanSync = false, ...others } = args;

    const notionPageId = this.destinationRepository.getPageIdFromPageUrl({
      pageUrl: notionParentPageUrl,
    });

    // If clean sync is enabled, delete all existing content first
    if (cleanSync) {
      this.logger.info('Clean sync enabled - removing existing content');
      try {
        await this.destinationRepository.deleteChildBlocks({
          parentPageId: notionPageId,
        });
        this.logger.info('Successfully removed existing content');
      } catch (error) {
        this.logger.warn(
          'Failed to remove existing content, continuing with sync',
          { error }
        );
      }
    }

    try {
      // Check if the Notion page is accessible
      const destinationIsAccessible =
        await this.destinationRepository.destinationIsAccessible({
          parentPageId: notionPageId,
        });

      if (!destinationIsAccessible) {
        throw new Error('Destination is not accessible');
      }

      // Check if the GitHub repository is accessible
      try {
        await this.sourceRepository.sourceIsAccessible(others as T);
      } catch (err) {
        throw new Error(`Source is not accessible:`, {
          cause: err,
        });
      }

      this.logger.info('Starting synchronization process');

      const filePaths = await this.sourceRepository.getFilePathList(
        others as T
      );

      const siteMap = SiteMap.buildFromFilePaths(filePaths);

      // Traverse the SiteMap and synchronize files
      await this.synchronizeTreeNode({
        node: siteMap.root,
        parentPageId: notionPageId,
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

  private async synchronizeTreeNode({
    node,
    parentPageId,
  }: {
    node: TreeNode;
    parentPageId: string;
  }): Promise<void> {
    // If the current node has content (e.g., root node with index.md), add it to the parent page
    if (node.filepath) {
      try {
        this.logger.info(`Adding content from ${node.filepath} to parent page`);

        // Retrieve the file content
        const file = await this.sourceRepository.getFile({
          path: node.filepath,
        } as T);

        // Set the current file path for image resolution
        if (this.elementConverter.setCurrentFilePath) {
          this.elementConverter.setCurrentFilePath(node.filepath);
        }

        // Convert the file content to elements
        const pageElement = this.elementConverter.convertToElement(file);

        if (!(pageElement instanceof PageElement)) {
          throw new Error('Element is not a PageElement');
        }

        // Add the content to the existing parent page by appending it
        await this.destinationRepository.appendToPage({
          pageId: parentPageId,
          pageElement,
        });

        this.logger.info(`Added content from ${node.filepath} to parent page`);
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(
            `Failed to add content from ${node.filepath} to parent page`,
            {
              error,
            }
          );
        }
        throw error;
      }
    }

    for (const childNode of node.children) {
      const filePath = childNode.filepath;
      this.logger.info(`Processing file: ${filePath}`);

      try {
        // Retrieve the file from the source repository
        const file = await this.sourceRepository.getFile({
          path: filePath,
        } as T);

        // Set the current file path for image resolution
        if (this.elementConverter.setCurrentFilePath) {
          this.elementConverter.setCurrentFilePath(filePath);
        }

        // Convert the file content to a Notion page element
        const pageElement = this.elementConverter.convertToElement(file);

        if (!(pageElement instanceof PageElement)) {
          throw new Error('Element is not a PageElement');
        }

        [new DividerElement(), new TableOfContentsElement()].forEach(
          (element) => {
            pageElement.addElementToBeginning(element);
          }
        );

        if (childNode.children.length > 0) {
          // Add divider to the end of the page
          pageElement.addElementToEnd(new DividerElement());
        }

        // Create the Notion page and get the new page ID
        const newPage = await this.destinationRepository.createPage({
          pageElement,
          parentPageId,
          filePath,
        });

        this.logger.info(`Created Notion page for file: ${filePath}`);

        // Recursively process the children of the current node
        if (childNode.children.length > 0) {
          if (newPage.pageId === undefined) {
            throw new Error('Page ID is undefined');
          }

          await this.synchronizeTreeNode({
            node: childNode,
            parentPageId: newPage.pageId,
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Failed to synchronize file: ${filePath}`, {
            error,
          });
        }

        throw error;
      }
    }
  }
}
