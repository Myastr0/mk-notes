import fm from 'front-matter';
import { marked, Tokens } from 'marked';
import { Logger } from 'winston';

import {
  CalloutElement,
  CodeElement,
  DividerElement,
  Element,
  ElementCodeLanguage,
  ImageElement,
  isElementCodeLanguage,
  LinkElement,
  ListItemElement,
  ParseResult,
  ParserRepository,
  QuoteElement,
  RichTextElement,
  SupportedEmoji,
  TableElement,
  TextElement,
  TextElementLevel,
} from '@/domains/elements';
import { HtmlParser } from '@/infrastructure/html';

import { ExtendedToken } from './types';

export interface MarkdownMetadata {
  title?: string;
  icon?: string;
}

export class MarkdownParser extends ParserRepository {
  private htmlParser: HtmlParser;

  constructor({
    htmlParser,
    logger,
  }: {
    htmlParser: HtmlParser;
    logger: Logger;
  }) {
    super({ logger });
    this.htmlParser = htmlParser;
  }

  private preParseMarkdown(src: string): ExtendedToken[] {
    const { body } = fm(src);
    return marked.lexer(body);
  }

  private parseInlineText = (text: string): RichTextElement => {
    const elements: RichTextElement = [];

    const regex =
      /(!?\[([^\]]+)\]\(([^)]+)\)|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
    const cleanText = text.trim();
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(cleanText)) !== null) {
      const [fullMatch, , altText, url] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        elements.push(
          new TextElement({
            text: cleanText.slice(lastIndex, startIndex),
          })
        );
      }

      if (fullMatch.startsWith('![')) {
        elements.push(
          new ImageElement({
            url: url,
            caption: altText,
          })
        );
      } else if (fullMatch.startsWith('[')) {
        elements.push(
          new LinkElement({
            text: altText,
            url: url,
          })
        );
      } else if (fullMatch.startsWith('**')) {
        elements.push(
          new TextElement({
            text: fullMatch.slice(2, -2),
            styles: {
              bold: true,
            },
          })
        );
      } else if (fullMatch.startsWith('*')) {
        elements.push(
          new TextElement({
            text: fullMatch.slice(1, -1),
            styles: {
              italic: true,
            },
          })
        );
      } else if (fullMatch.startsWith('~~')) {
        elements.push(
          new TextElement({
            text: fullMatch.slice(2, -2),
            styles: {
              strikethrough: true,
            },
          })
        );
      }

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < cleanText.length) {
      elements.push(
        new TextElement({
          text: cleanText.slice(lastIndex),
        })
      );
    }

    return elements;
  };

  getMetadata(src: string): MarkdownMetadata {
    const { attributes } = fm(src);

    if (!attributes || typeof attributes !== 'object') {
      return {};
    }

    return attributes;
  }

  private getTextLevelFromDepth(depth: number): TextElementLevel {
    const mapping: Record<number, TextElementLevel> = {
      1: TextElementLevel.Heading1,
      2: TextElementLevel.Heading2,
      3: TextElementLevel.Heading3,
      4: TextElementLevel.Heading4,
      5: TextElementLevel.Heading5,
      6: TextElementLevel.Heading6,
    };

    if (depth < 1 || depth > 6) {
      return TextElementLevel.Paragraph;
    }

    return mapping[depth];
  }

  /**
   * Parse a heading token
   */
  private parseHeadingToken(token: Tokens.Heading): TextElement {
    const level = this.getTextLevelFromDepth(token.depth);
    return new TextElement({
      text: token.text,
      level,
    });
  }

  private parseListToken(token: Tokens.List): ListItemElement[] {
    return token.items.map(
      (item) =>
        new ListItemElement({
          listType: token.ordered ? 'ordered' : 'unordered',
          text: this.parseInlineText(item.text),
        })
    );
  }

  private parseBlockQuoteToken(
    token: Tokens.Blockquote
  ): QuoteElement | CalloutElement {
    const text = token.text.trim();
    if (text.startsWith('[!NOTE]')) {
      return new CalloutElement({
        text: text.replace('[!NOTE]', '').trim(),
        icon: '💡',
      });
    }
    return new QuoteElement({
      text: text,
    });
  }

  private parseCodeToken(token: Tokens.Code): CodeElement {
    const language = token.lang || ElementCodeLanguage.PlainText;

    if (language === 'js') {
      return new CodeElement({
        text: token.text,
        language: ElementCodeLanguage.JavaScript,
      });
    }

    const isSupportedLanguage = isElementCodeLanguage(language);

    if (!isSupportedLanguage) {
      return new CodeElement({
        text: token.text,
        language: ElementCodeLanguage.PlainText,
      });
    }

    return new CodeElement({
      text: token.text,
      language,
    });
  }

  private parseCalloutToken(token: Tokens.Generic): CalloutElement {
    if (!token.callout || typeof token.callout !== 'string') {
      throw new Error('Callout token does not have a callout property');
    }

    return new CalloutElement({
      text: token.callout,
      icon: '💡',
    });
  }

  private parseTableToken(token: Tokens.Table): TableElement {
    const headers = token.header.map((cell) => cell.text);
    const rows = token.rows.map((row) => row.map((cell) => cell.text));

    return new TableElement({
      rows: [headers, ...rows],
    });
  }

  private parseImageToken(token: Tokens.Image): ImageElement {
    return new ImageElement({
      url: token.href,
      caption: token.text,
    });
  }

  private parseHtmlToken(token: Tokens.HTML): Element[] {
    const { content } = this.htmlParser.parse({ content: token.text });

    return content;
  }

  private parseLinkToken(token: Tokens.Link): LinkElement {
    return new LinkElement({
      text: token.text,
      url: token.href,
    });
  }

  private parseTextToken(
    token: Tokens.Text | Tokens.Strong | Tokens.Em | Tokens.Del
  ): TextElement {
    if (token.type === 'strong') {
      return new TextElement({
        text: token.text,
        styles: {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
        },
      });
    }

    if (token.type === 'em') {
      return new TextElement({
        text: token.text,
        styles: {
          bold: false,
          italic: true,
          strikethrough: false,
          underline: false,
        },
      });
    }

    if (token.type === 'del') {
      return new TextElement({
        text: token.text,
        styles: {
          strikethrough: true,
        },
      });
    }

    return new TextElement({
      text: token.text,
    });
  }

  parse({ content }: { content: string }): ParseResult {
    const tokens = this.preParseMarkdown(content);

    const elements: Element[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case 'heading': {
          elements.push(this.parseHeadingToken(token as Tokens.Heading));
          break;
        }
        case 'paragraph': {
          const inlineElements = this.parseInlineText(token.text as string);
          if (inlineElements.length === 1) {
            elements.push(inlineElements[0]);
          } else {
            elements.push(
              new TextElement({
                text: inlineElements,
                level: TextElementLevel.Paragraph,
              })
            );
          }
          break;
        }
        case 'list':
          const listItems = this.parseListToken(token as Tokens.List);
          elements.push(...listItems);
          break;
        case 'blockquote': {
          elements.push(this.parseBlockQuoteToken(token as Tokens.Blockquote));
          break;
        }
        case 'code':
          elements.push(this.parseCodeToken(token as Tokens.Code));
          break;
        case 'callout':
          elements.push(this.parseCalloutToken(token));
          break;
        case 'table': {
          elements.push(this.parseTableToken(token as Tokens.Table));
          break;
        }
        case 'hr':
          elements.push(new DividerElement());
          break;
        case 'image':
          elements.push(this.parseImageToken(token as Tokens.Image));
          break;
        case 'html':
          elements.push(...this.parseHtmlToken(token as Tokens.HTML));
          break;
        case 'link':
          elements.push(this.parseLinkToken(token as Tokens.Link));
          break;
        case 'strong':
        case 'em':
        case 'del':
          elements.push(
            this.parseTextToken(token as Tokens.Strong | Tokens.Em)
          );
          break;
        default:
          break;
      }
    }

    const result: ParseResult = {
      content: elements,
    };

    const fileMetadata = this.getMetadata(content);

    if (fileMetadata.title) {
      result.title = fileMetadata.title;
    }

    if (fileMetadata.icon) {
      result.icon = fileMetadata.icon as SupportedEmoji;
    }

    return result;
  }
}
