import { Logger } from 'winston';

import {
  Element,
  ElementConverterRepository,
  PageElement,
  ParserRepository,
  SupportedEmoji,
} from '@/domains/elements';
import { File } from '@/domains/synchronization';
import type { HtmlParser } from '@/infrastructure/html/html.parser';
import type { MarkdownParser } from '@/infrastructure/markdown/markdown.parser';

export class FileConverter
  implements ElementConverterRepository<PageElement, File>
{
  private htmlParser: HtmlParser;
  private markdownParser: MarkdownParser;
  private logger: Logger;

  constructor({
    htmlParser,
    markdownParser,
    logger,
  }: {
    htmlParser: HtmlParser;
    markdownParser: MarkdownParser;
    logger: Logger;
  }) {
    this.htmlParser = htmlParser;
    this.markdownParser = markdownParser;
    this.logger = logger;
  }

  setCurrentFilePath(filePath: string): void {
    if (this.markdownParser.setCurrentFilePath) {
      this.markdownParser.setCurrentFilePath(filePath);
    }
  }

  public convertToElement(file: File): PageElement {
    const { content } = file;

    const args: {
      title: string;
      content: Element[];
      icon: SupportedEmoji | undefined;
    } = {
      title: file.name,
      content: [],
      icon: undefined,
    };

    let parser: ParserRepository | null = null;

    if (file.extension === 'md') {
      parser = this.markdownParser;
    }

    if (file.extension === 'html') {
      parser = this.htmlParser;
    }

    if (!parser) {
      throw new Error('File extension not supported');
    }

    const result = parser.parse({ content });

    return new PageElement({
      ...args,
      ...result,
    });
  }
}
