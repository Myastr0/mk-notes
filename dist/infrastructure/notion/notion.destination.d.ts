import { BlockObjectResponse, PageObjectResponse, PartialBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { PageElement } from '@/domains/elements/Element';
import { NotionPage } from '@/domains/notion/NotionPage';
import { DestinationRepository, PageLockedStatus } from '@/domains/synchronization/destination.repository';
import { BlockObjectRequest, BlockObjectRequestWithoutChildren, Icon } from '../../domains/notion/types';
import { NotionConverterRepository } from './notion.converter';
export interface UpdatePageInput {
    pageId: string;
    blocks?: BlockObjectRequest[] | BlockObjectRequestWithoutChildren[];
    title?: string;
    icon?: Icon;
}
export declare class NotionDestinationRepository implements DestinationRepository<NotionPage> {
    private client;
    private notionConverter;
    constructor({ apiKey, notionConverter, }: {
        apiKey: string;
        notionConverter: NotionConverterRepository;
    });
    /**
     * Delete all child blocks from a parent page
     */
    deleteChildBlocks({ parentPageId, }: {
        parentPageId: string;
    }): Promise<void>;
    getPageIdFromPageUrl({ pageUrl }: {
        pageUrl: string;
    }): string;
    destinationIsAccessible({ parentPageId, }: {
        parentPageId: string;
    }): Promise<boolean>;
    getPageById({ notionPageId, }: {
        notionPageId: string;
    }): Promise<NotionPage>;
    createPage({ parentPageId, pageElement, filePath, }: {
        parentPageId: string;
        pageElement: PageElement;
        filePath?: string;
    }): Promise<NotionPage>;
    updateBlock({ blockId, block, }: {
        blockId: string;
        block: BlockObjectRequest;
    }): Promise<import("@notionhq/client").UpdateBlockResponse>;
    getPage({ pageId }: {
        pageId: string;
    }): Promise<PageObjectResponse>;
    getChildBlocksFromBlock({ blockId, }: {
        blockId: string;
    }): Promise<BlockObjectResponse[]>;
    getBlocksFromPage({ notionPageId, }: {
        notionPageId: string;
    }): Promise<(BlockObjectResponse | PartialBlockObjectResponse)[]>;
    updatePage({ pageId, pageElement, filePath, }: {
        pageId: string;
        pageElement: PageElement;
        filePath?: string;
    }): Promise<NotionPage>;
    appendToPage({ pageId, pageElement, }: {
        pageId: string;
        pageElement: PageElement;
    }): Promise<void>;
    updatePageProperties({ pageId, pageElement, }: {
        pageId: string;
        pageElement: PageElement;
    }): Promise<void>;
    search({ filter, }: {
        filter: {
            property: 'object';
            value: 'page' | 'data_source';
        };
    }): Promise<import("@notionhq/client").SearchResponse>;
    setPageLockedStatus({ pageId, lockStatus, }: {
        pageId: string;
        lockStatus: PageLockedStatus;
    }): Promise<void>;
    getPageLockedStatus({ pageId, }: {
        pageId: string;
    }): Promise<PageLockedStatus>;
}
