"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionDestinationRepository = void 0;
const client_1 = require("@notionhq/client");
const NotionPage_1 = require("../../domains/notion/NotionPage");
const utils_1 = require("./utils");
class NotionDestinationRepository {
    client;
    notionConverter;
    constructor({ apiKey, notionConverter, }) {
        this.client = new client_1.Client({ auth: apiKey });
        this.notionConverter = notionConverter;
    }
    /**
     * Delete all child blocks from a parent page
     */
    async deleteChildBlocks({ parentPageId, }) {
        try {
            // Get all blocks in the parent page
            const blocks = await this.getBlocksFromPage({
                notionPageId: parentPageId,
            });
            // Delete each block
            for (const block of blocks) {
                await this.client.blocks.delete({ block_id: block.id });
            }
        }
        catch (error) {
            // Deletion failed - throw the error to be handled upstream
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
    getPageIdFromPageUrl({ pageUrl }) {
        const urlObj = new URL(pageUrl);
        const pathSegments = urlObj.pathname.split('-');
        let lastSegment = pathSegments[pathSegments.length - 1];
        /**
         * If the URL has a query parameter `v`, it's becase it's a Notion Database
         * Unfortunatly, for now, mk-notes doesn't support Notion Databases
         **/
        if (urlObj.searchParams.has('v')) {
            throw new Error('Notion Databases are not supported yet. Please use a Notion Page URL');
        }
        if (lastSegment.startsWith('/')) {
            lastSegment = lastSegment.slice(1);
        }
        const [lastSegmentWithoutQueryParams] = lastSegment.split('?');
        if (!lastSegmentWithoutQueryParams) {
            throw new Error('Invalid Notion URL');
        }
        if (lastSegmentWithoutQueryParams.length !== 32) {
            throw new Error('Invalid Notion URL');
        }
        return lastSegmentWithoutQueryParams;
    }
    async destinationIsAccessible({ parentPageId, }) {
        try {
            await this.getPage({ pageId: parentPageId });
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (err) {
            return false;
        }
    }
    async getPageById({ notionPageId, }) {
        const pageObjectResponse = await this.client.pages.retrieve({
            page_id: notionPageId,
        });
        if (!(0, client_1.isFullPage)(pageObjectResponse)) {
            throw new Error('Not able to retrieve Notion Page');
        }
        const blocks = await this.getBlocksFromPage({ notionPageId });
        return new NotionPage_1.NotionPage({
            pageId: pageObjectResponse.id,
            children: blocks,
            createdAt: new Date(pageObjectResponse.created_time),
            updatedAt: new Date(pageObjectResponse.last_edited_time),
        });
    }
    async createPage({ parentPageId, pageElement, filePath, }) {
        // Set the current file path for image resolution
        if (filePath) {
            this.notionConverter.setCurrentFilePath(filePath);
        }
        const notionPage = await this.notionConverter.convertFromElement(pageElement);
        const NOTION_BLOCK_LIMIT = 100;
        // First create the page without children
        const { id: notionPageId } = await this.client.pages.create({
            parent: { type: 'page_id', page_id: parentPageId },
            properties: notionPage.properties,
            icon: notionPage.icon,
            children: [], // Create page without children initially
        });
        // If there are children blocks, append them in chunks
        if (notionPage.children && notionPage.children.length > 0) {
            const children = notionPage.children;
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
    async updateBlock({ blockId, block, }) {
        return this.client.blocks.update({
            block_id: blockId,
            ...block,
        });
    }
    async getPage({ pageId }) {
        const page = await this.client.pages.retrieve({ page_id: pageId });
        return page;
    }
    async getChildBlocksFromBlock({ blockId, }) {
        const response = await this.client.blocks.children.list({
            block_id: blockId,
        });
        return response.results;
    }
    async getBlocksFromPage({ notionPageId, }) {
        const blocks = await this.client.blocks.children.list({
            block_id: notionPageId,
        });
        return blocks.results;
    }
    async updatePage({ pageId, pageElement, filePath, }) {
        const notionPageId = pageId;
        // Set the current file path for image resolution
        if (filePath) {
            this.notionConverter.setCurrentFilePath(filePath);
        }
        const notionPage = await this.notionConverter.convertFromElement(pageElement);
        const updateBody = {
            page_id: notionPageId,
            properties: {},
        };
        if (notionPage.icon) {
            updateBody.icon = notionPage.icon;
        }
        if (notionPage?.properties?.Name) {
            updateBody.properties['Title'] = notionPage.properties
                .Title;
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
                return !(0, utils_1.isBlockEquals)(blocks[index], existingBlock);
            })
                .map(async (existingBlock, index) => this.client.blocks
                .update({
                block_id: existingBlock.id,
                ...blocks[index],
            })
                .then((block) => {
                pageBlocks[index] = block;
            }));
            await Promise.all(promises);
        }
        // Now it's time to compare the existing blocks with the new blocks
        // and update the existing blocks with the new ones
        return this.getPageById({ notionPageId });
    }
    // Used for root level index.md where the page is already present
    async appendToPage({ pageId, pageElement, }) {
        const notionPage = await this.notionConverter.convertFromElement(pageElement);
        // Update page properties (title/icon) if specified in metadata
        await this.updatePageProperties({ pageId, pageElement });
        if (notionPage.children && notionPage.children.length > 0) {
            // Append blocks to the existing page
            await this.client.blocks.children.append({
                block_id: pageId,
                children: notionPage.children,
            });
        }
    }
    async updatePageProperties({ pageId, pageElement, }) {
        const notionPage = await this.notionConverter.convertFromElement(pageElement);
        // Only update if there are properties to update
        if (notionPage.properties || notionPage.icon) {
            // Update page properties and icon separately to avoid type conflicts
            const updatePayload = {
                page_id: pageId,
            };
            if (notionPage.properties) {
                updatePayload.properties = notionPage.properties;
            }
            if (notionPage.icon) {
                updatePayload.icon = notionPage.icon;
            }
            await this.client.pages.update(updatePayload);
        }
    }
    async search({ filter, }) {
        return this.client.search({
            filter,
        });
    }
}
exports.NotionDestinationRepository = NotionDestinationRepository;
