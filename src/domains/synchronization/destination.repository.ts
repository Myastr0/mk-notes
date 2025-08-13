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
  }: {
    pageElement: PageElement;
    parentPageId: string;
  }) => Promise<T>;
  updatePage: ({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
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
}
