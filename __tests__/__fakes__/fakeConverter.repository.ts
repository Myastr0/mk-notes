import { Logger } from 'winston';

import { PageElement } from '@/domains/elements';
import { File, Page } from '@/domains/synchronization';

import { FileConverter } from '../../src/infrastructure/filesystem';
import { HtmlParser } from '../../src/infrastructure/html';
import { MarkdownParser } from '../../src/infrastructure/markdown';
import {
  NotionConverterRepository,
  NotionPage,
} from '../../src/infrastructure/notion';
import { aFakePageElement } from './fakeElement';
import { aFakeNotionPage } from './fakePage';

export class FakeFileConverter extends FileConverter {
  constructor({
    logger,
    htmlParser,
    markdownParser,
  }: {
    htmlParser: HtmlParser;
    markdownParser: MarkdownParser;
    logger: Logger;
  }) {
    super({ logger, htmlParser, markdownParser });
  }

  public convertToElement(file: File): PageElement {
    return aFakePageElement();
  }
}

export class FakeNotionConverter extends NotionConverterRepository {
  public convertFromElement(elem: PageElement): NotionPage {
    return aFakeNotionPage();
  }
}
