import { Logger } from 'winston';

import {
  CalloutElement,
  CodeElement,
  Element,
  ElementCodeLanguage,
  type ElementConverterRepository,
  ElementType,
  EquationElement,
  HtmlElement,
  ImageElement,
  LinkElement,
  ListItemElement,
  PageElement,
  QuoteElement,
  RichTextElement,
  TableElement,
  TextElement,
  TextElementLevel,
  ToggleElement,
} from '@/domains/elements';
import { NotionPage } from '@/domains/notion/NotionPage';

import {
  BlockObjectRequest,
  BlockObjectRequestWithoutChildren,
  BulletedListItemBlock,
  CalloutBlock,
  CreatePageBodyParameters,
  EquationBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  LanguageRequest,
  NumberedListItemBlock,
  ParagraphBlock,
  QuoteBlock,
  RichTextItemRequest,
  TableBlock,
  TableOfContentsBlock,
  TableRowBlock,
  TitleProperty,
  ToggleBlock,
} from '../../domains/notion/types';

type PartialCreatePageBodyParameters = Pick<
  CreatePageBodyParameters,
  'properties' | 'children' | 'icon'
>;

const SUPPORTED_IMAGE_URL_EXTENSIONS = [
  '.bmp',
  '.gif',
  '.heic',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.tif',
  '.tiff',
];
export class NotionConverterRepository
  implements ElementConverterRepository<PageElement, NotionPage>
{
  private logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
  }

  private convertPageElement(
    element: PageElement
  ): PartialCreatePageBodyParameters {
    const title: TitleProperty = {
      id: 'title',
      type: 'title',
      title: [
        {
          type: 'text',
          text: {
            content: element.title,
            link: null,
          },
        },
      ],
    };

    const result: PartialCreatePageBodyParameters = {
      children: [],
      properties: {
        title,
      },
    };

    for (const contentElement of element.content) {
      const convertedElement = this.convertElement(contentElement);

      if (convertedElement) {
        result.children?.push(convertedElement as BlockObjectRequest);
      }
    }

    const icon = element.getIcon();

    if (icon) {
      result.icon = { type: 'emoji', emoji: icon };
    }

    return result;
  }

  private convertElement(element: Element) {
    switch (element.type) {
      case ElementType.Page:
        return this.convertPageElement(element as PageElement);
      case ElementType.Text:
        return this.convertText(element as TextElement);
      case ElementType.Quote:
        return this.convertQuote(element as QuoteElement);
      case ElementType.Callout:
        return this.convertCallout(element as CalloutElement);
      case ElementType.ListItem:
        return this.convertListItem(element as ListItemElement);
      case ElementType.Table:
        return this.convertTable(element as TableElement);
      case ElementType.Toggle:
        return this.convertToggle(element as ToggleElement);
      case ElementType.Link:
        return this.convertLink(element as LinkElement);
      case ElementType.Divider:
        return this.convertDivider();
      case ElementType.Code:
        return this.convertCodeBlock(element as CodeElement);
      case ElementType.Image:
        return this.convertImage(element as ImageElement);
      case ElementType.Html:
        return this.convertHtml(element as HtmlElement);
      case ElementType.TableOfContents:
        return this.convertTableOfContents();
      case ElementType.Equation:
        return this.convertEquation(element as EquationElement);
      default:
        this.logger.warn(`Unsupported element type: ${element.type}`);
        return null;
    }
  }
  convertFromElement(element: PageElement): NotionPage {
    const notionPageInput = this.convertPageElement(element);

    return NotionPage.fromPartialCreatePageBodyParameters(notionPageInput);
  }

  private convertText(
    element: TextElement
  ): ParagraphBlock | Heading1Block | Heading2Block | Heading3Block {
    switch (element.level) {
      case TextElementLevel.Heading1:
        return {
          type: 'heading_1',
          object: 'block',
          heading_1: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
            is_toggleable: false, // Set based on your requirements
          },
        };

      case TextElementLevel.Heading2:
        return {
          type: 'heading_2',
          object: 'block',
          heading_2: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
            is_toggleable: false,
          },
        };

      case TextElementLevel.Heading3:
        return {
          type: 'heading_3',
          object: 'block',
          heading_3: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
            is_toggleable: false,
          },
        };

      case TextElementLevel.Paragraph:
        return {
          type: 'paragraph',
          object: 'block',
          paragraph: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
          },
        };
      default:
        this.logger.warn(
          `Unsupported text level ${element.level} - using paragraph`
        );

        return {
          type: 'paragraph',
          object: 'block',
          paragraph: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
          },
        };
    }
  }

  private convertQuote(element: QuoteElement): QuoteBlock {
    return {
      type: 'quote',
      object: 'block',
      quote: {
        rich_text: this.convertRichText(element.text),
      },
    };
  }

  private convertCallout(element: CalloutElement): CalloutBlock {
    const icon = element.getIcon();
    const calloutParams = {
      rich_text: this.convertRichText(element.text),
      icon: undefined,
    };

    if (icon) {
      // @ts-expect-error - Notion API types are incorrect
      calloutParams.icon = { type: 'emoji', emoji: icon };
    }

    return {
      type: 'callout',
      object: 'block',
      callout: calloutParams,
    };
  }

  private convertListItem(element: ListItemElement): BlockObjectRequest {
    if (element.listType === 'unordered') {
      return this.convertBulletedListItem(element);
    } else {
      return this.convertNumberedListItem(element);
    }
  }

  private convertBulletedListItem(
    element: ListItemElement
  ): BulletedListItemBlock {
    return {
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: this.convertRichText(element.text),
      },
    };
  }

  private convertNumberedListItem(
    element: ListItemElement
  ): NumberedListItemBlock {
    return {
      type: 'numbered_list_item',
      object: 'block',
      numbered_list_item: {
        rich_text: this.convertRichText(element.text),
      },
    };
  }

  private convertTable(element: TableElement): TableBlock {
    return {
      type: 'table',
      object: 'block',
      table: {
        table_width: element.rows[0]?.length || 0,
        has_column_header: false, // Customize as needed
        has_row_header: false, // Customize as needed
        children: element.rows.map((row) => this.convertTableRow(row)),
      },
    };
  }

  private convertTableRow(row: string[]): TableRowBlock {
    return {
      type: 'table_row',
      object: 'block',
      table_row: {
        cells: row.map((cell) => this.convertRichText(cell)),
      },
    };
  }

  private convertToggle(element: ToggleElement): ToggleBlock {
    const children: BlockObjectRequestWithoutChildren[] = [];

    for (const contentElement of element.content) {
      children.push(
        this.convertElement(contentElement) as BlockObjectRequestWithoutChildren
      );
    }

    return {
      type: 'toggle',
      object: 'block',
      toggle: {
        rich_text: this.convertRichText(element.title),
        children,
      },
    };
  }

  private convertLink(element: LinkElement): BlockObjectRequest {
    return {
      type: 'paragraph',
      object: 'block',
      paragraph: {
        rich_text: [
          {
            text: {
              content: element.text,
              link: element.url.startsWith('http')
                ? { url: element.url }
                : null,
            },
          },
        ],
        color: 'default',
      },
    };
  }

  private convertDivider(): BlockObjectRequest {
    return {
      type: 'divider',
      object: 'block',
      divider: {},
    };
  }

  private getNotionLanguageFromElementLanguage(
    language: ElementCodeLanguage
  ): LanguageRequest {
    const languageMap: Record<ElementCodeLanguage, LanguageRequest> = {
      [ElementCodeLanguage.JavaScript]: 'javascript',
      [ElementCodeLanguage.TypeScript]: 'typescript',
      [ElementCodeLanguage.Python]: 'python',
      [ElementCodeLanguage.Java]: 'java',
      [ElementCodeLanguage.CSharp]: 'c#',
      [ElementCodeLanguage.CPlusPlus]: 'c++',
      [ElementCodeLanguage.Go]: 'go',
      [ElementCodeLanguage.Ruby]: 'ruby',
      [ElementCodeLanguage.Swift]: 'swift',
      [ElementCodeLanguage.Kotlin]: 'kotlin',
      [ElementCodeLanguage.Rust]: 'rust',
      [ElementCodeLanguage.Shell]: 'bash', // Mapping to 'bash' as Notion supports bash/shell
      [ElementCodeLanguage.SQL]: 'sql',
      [ElementCodeLanguage.HTML]: 'html',
      [ElementCodeLanguage.CSS]: 'css',
      [ElementCodeLanguage.JSON]: 'json',
      [ElementCodeLanguage.YAML]: 'yaml',
      [ElementCodeLanguage.Markdown]: 'markdown',
      [ElementCodeLanguage.PlainText]: 'plain text', // Mapping to 'plain text' as Notion supports this
    };

    // Return the mapped Notion language, or 'plain text' as a fallback
    return languageMap[language] || 'plain text';
  }
  private convertCodeBlock(element: CodeElement): BlockObjectRequest {
    return {
      type: 'code',
      object: 'block',
      code: {
        rich_text: this.convertRichText(element.text),
        language: this.getNotionLanguageFromElementLanguage(element.language),
      },
    };
  }

  private convertImage(element: ImageElement): BlockObjectRequest {
    if (
      element.url &&
      !SUPPORTED_IMAGE_URL_EXTENSIONS.some((extension) =>
        element.url?.endsWith(extension)
      )
    ) {
      this.logger.warn(`Unsupported image URL extension: ${element.url}`);

      return {
        type: 'paragraph',
        object: 'block',
        paragraph: {
          rich_text: [],
          color: 'default',
        },
      };
    }

    return {
      type: 'image',
      object: 'block',
      image: {
        type: 'external',
        external: {
          url: element.url || '',
        },
      },
    };
  }

  private convertHtml(element: HtmlElement): BlockObjectRequest {
    return {
      type: 'code',
      object: 'block',
      code: {
        language: 'html',
        rich_text: this.convertRichText(element.html),
      },
    };
  }

  private convertEquation(element: EquationElement): EquationBlock {
    return {
      type: 'equation',
      object: 'block',
      equation: { expression: element.equation },
    };
  }

  private convertRichText(
    content: undefined | string | RichTextElement
  ): RichTextItemRequest[] {
    if (content === undefined) {
      return [];
    }

    if (typeof content === 'string') {
      // Split string into chunks of 2000 characters
      const MAX_LENGTH = 2000;
      const chunks: string[] = [];
      for (let i = 0; i < content.length; i += MAX_LENGTH) {
        chunks.push(content.slice(i, i + MAX_LENGTH));
      }
      return chunks.map((chunk) => ({
        type: 'text',
        text: {
          content: chunk,
        },
      }));
    }

    if (Array.isArray(content)) {
      return content.reduce<RichTextItemRequest[]>((acc, element) => {
        if (element.type === ElementType.Text) {
          acc.push({
            type: 'text',
            text: {
              content: (element as TextElement).text as string,
            },
            annotations: {
              bold: (element as TextElement).styles.bold,
              italic: (element as TextElement).styles.italic,
              strikethrough: (element as TextElement).styles.strikethrough,
              underline: (element as TextElement).styles.underline,
            },
          });
        }

        if (element instanceof LinkElement) {
          acc.push({
            type: 'text',
            text: {
              content: element.text,
              link: element.url.startsWith('http')
                ? { url: element.url }
                : null,
            },
          });
        }

        if (element instanceof EquationElement) {
          acc.push({
            type: 'equation',
            equation: {
              expression: element.equation,
            },
            annotations: {
              bold: element.styles.bold,
              italic: element.styles.italic,
              strikethrough: element.styles.strikethrough,
              underline: element.styles.underline,
            },
          });
        }

        this.logger.warn(`Unsupported element type: ${element.type}`);
        return acc;
      }, []);
    }

    throw new Error(`Unsupported content type: ${typeof content}`);
  }

  private convertTableOfContents(): TableOfContentsBlock {
    return {
      type: 'table_of_contents',
      object: 'block',
      table_of_contents: {},
    };
  }

  public convertToElement(): PageElement {
    throw new Error('Method not implemented.');
  }
}
