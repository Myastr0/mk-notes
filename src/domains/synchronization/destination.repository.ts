import { type PageElement } from '@/domains/elements';

export interface Page {
  pageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DestinationRepository<T extends Page> {
  createPage: ({
    pageElement,
    parentPageId,
    filePath,
  }: {
    pageElement: PageElement;
    parentPageId: string;
    filePath?: string;
  }) => Promise<T>;
  updatePage: ({
    pageId,
    pageElement,
    filePath,
  }: {
    pageId: string;
    pageElement: PageElement;
    filePath?: string;
  }) => Promise<T>;
  destinationIsAccessible: ({
    parentPageId,
  }: {
    parentPageId: string;
  }) => Promise<boolean>;
  getPageIdFromPageUrl: ({ pageUrl }: { pageUrl: string }) => string;
  deleteChildBlocks: ({
    parentPageId,
  }: {
    parentPageId: string;
  }) => Promise<void>;
  appendToPage: ({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }) => Promise<void>;
  updatePageProperties: ({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }) => Promise<void>;
}
