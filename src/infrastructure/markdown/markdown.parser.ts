import fm from 'front-matter';
import { marked, Tokens } from 'marked';

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
  TextElementStyle,
} from '@/domains/elements';
import type { HtmlParser } from '@/infrastructure/html/html.parser';

import { ExtendedToken } from './types';

export interface MarkdownMetadata {
  title?: string;
  icon?: string;
}

export class MarkdownParser implements ParserRepository {
  private htmlParser: HtmlParser;

  constructor({ htmlParser }: { htmlParser: HtmlParser }) {
    this.htmlParser = htmlParser;
  }

  private preParseMarkdown(src: string): ExtendedToken[] {
    const { body } = fm(src);
    return marked.lexer(body);
  }

  private parseInlineText = (text: string): RichTextElement => {
    const elements: RichTextElement = [];

    const regex =
      /(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|(\[([^\]]+)\]\((http[^)]+)\)))/g;

    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, , linkMatch, linkText, linkUrl] = match;
      const startIndex = match.index;

      // Add any text before the match
      if (startIndex > lastIndex) {
        elements.push(
          new TextElement({
            text: text.slice(lastIndex, startIndex),
          })
        );
      }

      if (linkMatch) {
        // Add the link text
        elements.push(
          new LinkElement({
            text: linkText,
            url: linkUrl,
          })
        );
      } else {
        let content = fullMatch;

        let textStyle: TextElementStyle = TextElementStyle.Normal;

        if (fullMatch.startsWith('**') || fullMatch.startsWith('__')) {
          textStyle = TextElementStyle.Bold;
          content = content.slice(2, -2);
        } else if (fullMatch.startsWith('*') || fullMatch.startsWith('_')) {
          textStyle = TextElementStyle.Italic;
          content = content.slice(1, -1);
        }

        elements.push(new TextElement({ text: content, style: textStyle }));
      }

      lastIndex = startIndex + fullMatch.length;
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      elements.push(
        new TextElement({
          text: text.slice(lastIndex),
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
  private parseHeadingToken(
    token: Tokens.Heading | Tokens.Generic
  ): TextElement {
    if (typeof token.depth !== 'number') {
      throw new Error('Token depth is not a number');
    }

    const level = this.getTextLevelFromDepth(token.depth);
    return new TextElement({
      text: token.text,
      level,
    });
  }

  private parseListToken(
    token: Tokens.List | Tokens.Generic
  ): ListItemElement[] {
    return token.items!.map(
      (item: { text: string }) =>
        new ListItemElement({
          listType: token.ordered ? 'ordered' : 'unordered',
          text: this.parseInlineText(item.text),
        })
    );
  }

  private parseBlockQuoteToken(
    token: Tokens.Blockquote | Tokens.Generic
  ): QuoteElement | CalloutElement {
    if (CalloutElement.isSpecialCalloutText(token.text)) {
      return new CalloutElement({ text: token.text });
    }

    return new QuoteElement({ text: token.text });
  }

  private parseCodeToken(token: Tokens.Code | Tokens.Generic): CodeElement {
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
    return new CalloutElement({
      text: token.callout,
      icon: '💡',
    });
  }

  private parseTableToken(token: Tokens.Table | Tokens.Generic): TableElement {
    return new TableElement({
      rows: token.rows.map((row: Tokens.TableCell[]) =>
        row.map((cell) => this.parseInlineText(cell.text))
      ),
    });
  }

  private parseImageElement(
    token: Tokens.Image | Tokens.Generic
  ): ImageElement {
    return new ImageElement({
      url: token.href,
      caption: token.text,
    });
  }

  private parseHtmlElement(token: Tokens.HTML | Tokens.Generic): Element[] {
    const { content } = this.htmlParser.parse(token.text);

    return content;
  }

  parse({ content }: { content: string }): ParseResult {
    const tokens = this.preParseMarkdown(content);

    const elements: Element[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case 'heading': {
          elements.push(this.parseHeadingToken(token));
          break;
        }
        case 'paragraph':
          elements.push(
            new TextElement({ text: this.parseInlineText(token.text) })
          );
          break;
        case 'list':
          const listItems = this.parseListToken(token);
          elements.push(...listItems);
          break;
        case 'blockquote': {
          elements.push(this.parseBlockQuoteToken(token));
          break;
        }
        case 'code':
          elements.push(this.parseCodeToken(token));
          break;
        case 'callout':
          elements.push(this.parseCalloutToken(token));
          break;
        case 'table': {
          elements.push(this.parseTableToken(token));
          break;
        }
        case 'hr':
          elements.push(new DividerElement());
          break;
        case 'image':
          elements.push(this.parseImageElement(token));
          break;
        case 'html':
          elements.push(...this.parseHtmlElement(token));
          break;
        case 'link':
          elements.push(
            new LinkElement({
              text: token.text,
              url: token.href,
            })
          );
          break;
        case 'strong':
          elements.push(
            new TextElement({
              text: token.text,
              style: TextElementStyle.Bold,
            })
          );
          break;
        case 'em':
          elements.push(
            new TextElement({
              text: token.text,
              style: TextElementStyle.Italic,
            })
          );
          break;
        case 'del':
          elements.push(
            new TextElement({
              text: token.text,
              style: TextElementStyle.Strikethrough,
            })
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
