import { Logger } from 'winston';

import {
  Element,
  ElementConverterRepository,
  PageElement,
  PageElementProperties,
  PageElementPropertyValue,
  ParserRepository,
  SupportedEmoji,
} from '@/domains/elements';
import { File } from '@/domains/synchronization';
import type { HtmlParser } from '@/infrastructure/parsers/html/html.parser';
import type { MarkdownParser } from '@/infrastructure/parsers/markdown/markdown.parser';

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

    const result = parser.parse({ content, filepath: file.path });

    return new PageElement({
      ...args,
      ...result,
      source: file,
    });
  }

  public convertFromElement(pageElement: PageElement): File {
    if (!pageElement.source || !(pageElement.source instanceof File)) {
      throw new Error(
        'Filepath is required to convert from PageElement to File'
      );
    }

    return new File({
      name: pageElement.title,
      extension: pageElement.source.extension,
      content: [
        this.getFrontmatterString(pageElement),
        this.removeFrontmatterFromContent(pageElement.source.content),
      ].join('\n'),
      lastUpdated: pageElement.source.lastUpdated,
      path: pageElement.source.path,
    });
  }

  private getFrontmatterString(pageElement: PageElement): string {
    const frontmatter: string[] = ['---'];

    if (pageElement.id) {
      frontmatter.push(`id: ${pageElement.id}`);
    }

    if (pageElement.title) {
      frontmatter.push(`title: ${pageElement.title}`);
    }

    if (pageElement.icon) {
      frontmatter.push(`icon: ${pageElement.icon}`);
    }

    if (pageElement.properties) {
      frontmatter.push('properties:');
      frontmatter.push(
        this.getPageElementPropertiesString(pageElement.properties)
      );
    }

    frontmatter.push('---');

    return frontmatter.join('\n');
  }

  private getPageElementPropertiesString(
    properties: PageElementProperties[]
  ): string {
    const propertiesString: string[] = [];

    if (!properties) {
      return '';
    }

    properties.forEach((property) => {
      propertiesString.push(
        ...[
          `  - name: ${property.name}`,
          `    value: ${this.getPropertyValueString(property.value)}`,
        ]
      );
    });

    return propertiesString.join('\n');
  }

  private getPropertyValueString(value: PageElementPropertyValue): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'boolean') {
      return value.toString();
    }

    if (Array.isArray(value)) {
      return this.getPropertyValueStringArray(value);
    }

    if (value === null) {
      return 'null';
    }

    if (typeof value === 'undefined') {
      return 'undefined';
    }

    throw new Error(`Unsupported property value type: ${typeof value}`);
  }

  private getPropertyValueStringArray(
    value: PageElementPropertyValue[]
  ): string {
    return [
      `[`,
      value.map((v) => this.getPropertyValueString(v)).join(','),
      `]`,
    ].join('');
  }

  private removeFrontmatterFromContent(content: string): string {
    return content.replace(/^-{3,}\n.*?\n-{3,}/s, '').trim();
  }
}
