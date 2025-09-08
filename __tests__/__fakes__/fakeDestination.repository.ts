import { type PageElement } from '@/domains/elements';
import {
  DestinationRepository,
  Page,
} from '@/domains/synchronization/destination.repository';

import { FakePage } from './fakePage';

export class FakeDestinationRepository<T extends Page>
  implements DestinationRepository<T>
{
  getPageIdFromPageUrl({ pageUrl }: { pageUrl: string }): string {
    return pageUrl.split('/').pop() ?? '';
  }

  // Simulate creating a new page
  // eslint-disable-next-line @typescript-eslint/require-await
  async createPage({
    pageElement,
    parentPageId,
  }: {
    pageElement: PageElement;
    parentPageId: string;
  }): Promise<T> {
    // Here you would implement the logic to create a new page in the fake destination
    const fakePage = new FakePage({
      pageId: 'fakePageId',
      createdAt: new Date(),
      updatedAt: new Date(),
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
    });
    return updatedFakePage as unknown as T;
  }

  // Simulate checking if the destination is accessible
  // eslint-disable-next-line @typescript-eslint/require-await
  async destinationIsAccessible({
    parentPageId,
  }: {
    parentPageId: string;
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
}
