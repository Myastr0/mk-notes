import { Logger } from 'winston';

import { PageElement } from '@/domains/elements';
import { File } from '@/domains/synchronization';

import { NotionPage } from '../../../src/domains/notion/entities/NotionPage';
import { FileConverter } from '../../../src/infrastructure/converters/file/file.converter';
import { NotionConverterRepository } from '../../../src/infrastructure/converters/notion/notion.converter';
import { HtmlParser } from '../../../src/infrastructure/parsers/html';
import { MarkdownParser } from '../../../src/infrastructure/parsers/markdown';
import { aFakePageElement } from '../../__fixtures__/element.fixture';
import { aFakeNotionPage } from '../../__fixtures__/page.fixture';

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
  public convertFromElement(elem: PageElement): Promise<NotionPage> {
    return Promise.resolve(aFakeNotionPage());
  }
}
