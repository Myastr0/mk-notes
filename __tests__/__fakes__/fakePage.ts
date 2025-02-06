import { Page } from '@/domains/synchronization';

import { NotionPage } from '../../src/infrastructure/notion';

export class FakePage implements Page {
  pageId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(pageId: string, createdAt: Date, updatedAt: Date) {
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

  constructor() {
    super({
      children: [],
      createdAt: undefined,
      icon: undefined,
      pageId: '',
      updatedAt: undefined,
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
