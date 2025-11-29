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
  createPage: ({
    pageElement,
    parentObjectId,
    parentObjectType,
    filePath,
  }: {
    pageElement: PageElement;
    parentObjectId: string;
    parentObjectType: ObjectType;
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
  deleteObjectById: ({ objectId }: { objectId: string }) => Promise<void>;
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
  getObjectIdInDatabaseByMkNotesInternalId: ({
    dataSourceId,
    mkNotesInternalId,
  }: {
    dataSourceId: string;
    mkNotesInternalId: string;
  }) => Promise<string[]>;
  getDataSourceIdFromDatabaseId: ({
    databaseId,
  }: {
    databaseId: string;
  }) => Promise<string>;
}
