import { type PageElement } from '@/domains/elements';

export interface Page {
  pageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isLocked?: boolean;
}

export type PageLockedStatus = 'locked' | 'unlocked';
export type ObjectType = 'page' | 'database' | 'unknown';

export interface DestinationRepository<T extends Page> {
  getPage: ({ pageId }: { pageId: string }) => Promise<T | null>;
  createPage: ({
    pageElement,
    parentObjectId,
    parentObjectType,
  }: {
    pageElement: PageElement;
    parentObjectId: string;
    parentObjectType: ObjectType;
  }) => Promise<T>;
  updatePage: ({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }) => Promise<T>;
  destinationIsAccessible: ({
    parentObjectId,
  }: {
    parentObjectId: string;
  }) => Promise<boolean>;
  getObjectIdFromObjectUrl: ({ objectUrl }: { objectUrl: string }) => string;
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
  setPageLockedStatus: ({
    pageId,
    lockStatus,
  }: {
    pageId: string;
    lockStatus: PageLockedStatus;
  }) => Promise<void>;
  getPageLockedStatus: ({
    pageId,
  }: {
    pageId: string;
  }) => Promise<PageLockedStatus>;
  getObjectType: ({ id }: { id: string }) => Promise<ObjectType>;
}
