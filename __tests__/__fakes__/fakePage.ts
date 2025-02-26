import { Page } from '@/domains/synchronization';

import { NotionPage } from '../../src/infrastructure/notion';

export class FakePage implements Page {
  pageId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    pageId,
    createdAt,
    updatedAt,
  }: {
    pageId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.pageId = pageId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
  }: { pageId?: string; createdAt?: Date; updatedAt?: Date } = {}) {
    super({
      children: [],
      createdAt: createdAt ?? new Date(),
      icon: undefined,
      pageId: pageId ?? 'fake-page-id',
      updatedAt: updatedAt ?? new Date(),
      properties: undefined,
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
