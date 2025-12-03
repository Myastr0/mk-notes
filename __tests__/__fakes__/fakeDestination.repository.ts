import { type PageElement } from '@/domains/elements';
import {
  DestinationRepository,
  ObjectType,
  Page,
  PageLockedStatus,
} from '@/domains/synchronization/destination.repository';

import { FakePage } from './fakePage';

export class FakeDestinationRepository<T extends Page>
  implements DestinationRepository<T>
{
  async getObjectType({ id }: { id: string }): Promise<ObjectType> {
    return Promise.resolve('page');
  }

  getObjectIdFromObjectUrl({ objectUrl }: { objectUrl: string }): string {
    const urlObj = new URL(objectUrl);

    // Notion IDs are 32-character hexadecimal strings (UUID without dashes)
    // They can be embedded in path segments like "MK-Notes-4dd0bd3dc73648a9a55dcf05dd03080f"
    const notionIdRegex = /[a-f0-9]{32}/gi;
    const matches = urlObj.pathname.match(notionIdRegex);

    if (!matches || matches.length === 0) {
      throw new Error('Invalid Notion URL: No valid Notion ID found');
    }

    // Return the last match (closest to the end of the URL path)
    return matches[matches.length - 1];
  }

  // Simulate creating a new page
  // eslint-disable-next-line @typescript-eslint/require-await
  async createPage({
    pageElement,
    parentObjectId,
    parentObjectType,
  }: {
    pageElement: PageElement;
    parentObjectId: string;
    parentObjectType: ObjectType;
  }): Promise<T> {
    // Here you would implement the logic to create a new page in the fake destination
    const fakePage = new FakePage({
      pageId: 'fakePageId',
      createdAt: new Date(),
      updatedAt: new Date(),
      isLocked: false,
    });
    return fakePage as unknown as T;
  }

  // Simulate updating an existing page
  // eslint-disable-next-line @typescript-eslint/require-await
  async updatePage({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }): Promise<T> {
    // Here you would implement the logic to update an existing page in the fake destination
    const updatedFakePage = new FakePage({
      pageId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isLocked: false,
    });
    return updatedFakePage as unknown as T;
  }

  // Simulate checking if the destination is accessible
  // eslint-disable-next-line @typescript-eslint/require-await
  async destinationIsAccessible({
    parentObjectId,
  }: {
    parentObjectId: string;
  }): Promise<boolean> {
    // Here you would implement the logic to check if the destination is accessible
    // For demonstration purposes, let's return a boolean value
    return true;
  }

  async deleteChildBlocks({
    parentPageId,
  }: {
    parentPageId: string;
  }): Promise<void> {
    // no-op in fake repository
  }

  async appendToPage({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }): Promise<void> {
    // no-op in fake repository for testing
  }

  async updatePageProperties({
    pageId,
    pageElement,
  }: {
    pageId: string;
    pageElement: PageElement;
  }): Promise<void> {
    // no-op in fake repository for testing
  }

  async setPageLockedStatus({
    pageId,
    lockStatus,
  }: {
    pageId: string;
    lockStatus: PageLockedStatus;
  }): Promise<void> {
    // no-op in fake repository for testing
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getPageLockedStatus({
    pageId,
  }: {
    pageId: string;
  }): Promise<PageLockedStatus> {
    return 'unlocked';
  }

  async getObjectIdInDatabaseByMkNotesInternalId({
    dataSourceId,
    mkNotesInternalId,
  }: {
    dataSourceId: string;
    mkNotesInternalId: string;
  }): Promise<string[]> {
    return Promise.resolve([]);
  }

  async getDataSourceIdFromDatabaseId({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<string> {
    return Promise.resolve('');
  }

  async deleteObjectById({ objectId }: { objectId: string }): Promise<void> {
    // no-op in fake repository for testing
    return Promise.resolve();
  }

  async deletePagesInDatabaseByInternalId({
    databaseId,
    mkNotesInternalId,
  }: {
    databaseId: string;
    mkNotesInternalId: string;
  }): Promise<void> {
    // no-op in fake repository for testing
    return Promise.resolve();
  }
}
