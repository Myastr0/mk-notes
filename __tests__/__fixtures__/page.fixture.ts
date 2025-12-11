import { Page } from '@/domains/synchronization';

import { NotionPage } from '../../src/domains/notion/entities/NotionPage';

export class PageFixture implements Page {
  pageId: string;
  createdAt: Date;
  updatedAt: Date;
  isLocked: boolean;
  constructor({
    pageId,
    createdAt,
    updatedAt,
    isLocked,
  }: {
    pageId: string;
    createdAt: Date;
    updatedAt: Date;
    isLocked: boolean;
  }) {
    this.pageId = pageId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isLocked = isLocked;
  }
}

export class FakeNotionPage extends NotionPage {
  children = [];
  title = 'fake title';
  properties = {};
  createdAt = new Date();
  updatedAt = new Date();

  constructor({
    pageId,
    createdAt,
    updatedAt,
    isLocked,
  }: {
    pageId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isLocked?: boolean;
  } = {}) {
    super({
      children: [],
      createdAt: createdAt ?? new Date(),
      icon: undefined,
      pageId: pageId ?? 'fake-page-id',
      updatedAt: updatedAt ?? new Date(),
      properties: undefined,
      isLocked: isLocked ?? false,
    });
  }

  withTitle(title: string): FakeNotionPage {
    this.title = title;
    return this;
  }
}

export const aFakeNotionPage = (): FakeNotionPage => {
  return new FakeNotionPage();
};
