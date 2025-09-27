"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronizeMarkdownToNotion = void 0;
const elements_1 = require("../../domains/elements");
const sitemap_1 = require("../../domains/sitemap");
class SynchronizeMarkdownToNotion {
    sourceRepository;
    destinationRepository;
    elementConverter;
    logger;
    constructor(params) {
        this.sourceRepository = params.sourceRepository;
        this.destinationRepository = params.destinationRepository;
        this.elementConverter = params.elementConverter;
        this.logger = params.logger;
    }
    async execute(args) {
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
            }
            catch (error) {
                this.logger.warn('Failed to remove existing content, continuing with sync', { error });
            }
        }
        try {
            // Check if the Notion page is accessible
            const destinationIsAccessible = await this.destinationRepository.destinationIsAccessible({
                parentPageId: notionPageId,
            });
            if (!destinationIsAccessible) {
                throw new Error('Destination is not accessible');
            }
            // Check if the GitHub repository is accessible
            try {
                await this.sourceRepository.sourceIsAccessible(others);
            }
            catch (err) {
                throw new Error(`Source is not accessible:`, {
                    cause: err,
                });
            }
            this.logger.info('Starting synchronization process');
            const filePaths = await this.sourceRepository.getFilePathList(others);
            const siteMap = sitemap_1.SiteMap.buildFromFilePaths(filePaths);
            // Traverse the SiteMap and synchronize files
            await this.synchronizeTreeNode({
                node: siteMap.root,
                parentPageId: notionPageId,
            });
            this.logger.info('Synchronization process completed successfully');
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Synchronization process failed`, {
                    error,
                });
            }
            throw error;
        }
    }
    async synchronizeTreeNode({ node, parentPageId, }) {
        // If the current node has content (e.g., root node with index.md), add it to the parent page
        if (node.filepath) {
            try {
                this.logger.info(`Adding content from ${node.filepath} to parent page`);
                // Retrieve the file content
                const file = await this.sourceRepository.getFile({
                    path: node.filepath,
                });
                // Set the current file path for image resolution
                if (this.elementConverter.setCurrentFilePath) {
                    this.elementConverter.setCurrentFilePath(node.filepath);
                }
                // Convert the file content to elements
                const pageElement = this.elementConverter.convertToElement(file);
                if (!(pageElement instanceof elements_1.PageElement)) {
                    throw new Error('Element is not a PageElement');
                }
                // Add the content to the existing parent page by appending it
                await this.destinationRepository.appendToPage({
                    pageId: parentPageId,
                    pageElement,
                });
                this.logger.info(`Added content from ${node.filepath} to parent page`);
            }
            catch (error) {
                if (error instanceof Error) {
                    this.logger.error(`Failed to add content from ${node.filepath} to parent page`, {
                        error,
                    });
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
                });
                // Set the current file path for image resolution
                if (this.elementConverter.setCurrentFilePath) {
                    this.elementConverter.setCurrentFilePath(filePath);
                }
                // Convert the file content to a Notion page element
                const pageElement = this.elementConverter.convertToElement(file);
                if (!(pageElement instanceof elements_1.PageElement)) {
                    throw new Error('Element is not a PageElement');
                }
                [new elements_1.DividerElement(), new elements_1.TableOfContentsElement()].forEach((element) => {
                    pageElement.addElementToBeginning(element);
                });
                if (childNode.children.length > 0) {
                    // Add divider to the end of the page
                    pageElement.addElementToEnd(new elements_1.DividerElement());
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
            }
            catch (error) {
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
exports.SynchronizeMarkdownToNotion = SynchronizeMarkdownToNotion;
