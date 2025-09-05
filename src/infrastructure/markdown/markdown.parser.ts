import fm from 'front-matter';
import { marked, Tokens } from 'marked';
import { default as markedKatex } from 'marked-katex-extension';
import { Logger } from 'winston';

import {
  CalloutElement,
  CodeElement,
  DividerElement,
  Element,
  ElementCodeLanguage,
  EquationElement,
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

import { EquationToken, ExtendedToken } from './types';

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

    marked.use(markedKatex({ throwOnError: false, nonStandard: true }));
  }

  private preParseMarkdown(src: string): ExtendedToken[] {
    const { body } = fm(src);
    return marked.lexer(body);
  }

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
          text: this.parseRawText(item.text),
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
    token:
      | Tokens.Text
      | Tokens.Strong
      | Tokens.Em
      | Tokens.Del
      | Tokens.Codespan
  ): TextElement {
    if (token.type === 'strong') {
      return new TextElement({
        text: token.text,
        styles: {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
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
          code: false,
        },
      });
    }

    if (token.type === 'del') {
      return new TextElement({
        text: token.text,
        styles: {
          bold: false,
          italic: false,
          strikethrough: true,
          underline: false,
          code: false,
        },
      });
    }

    if (token.type === 'codespan') {
      return new TextElement({
        text: token.text,
        styles: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: true,
        },
      });
    }

    return new TextElement({
      text: token.text,
    });
  }

  private parseBlockKatexToken(token: EquationToken): EquationElement {
    return new EquationElement({
      equation: token.text,
      styles: {
        italic: false,
        bold: false,
        strikethrough: false,
        underline: false,
      },
    });
  }

  private parseRawText(text: string): RichTextElement {
    const tokens = this.preParseMarkdown(text);

    const elements: RichTextElement = [];

    for (const t of tokens) {
      switch (t.type) {
        case 'paragraph':
          elements.push(...this.parseParagraphToken(t as Tokens.Paragraph));
          break;
        case 'text':
          elements.push(this.parseTextToken(t as Tokens.Text));
          break;
      }
    }

    return elements;
  }

  private parseParagraphToken(token: Tokens.Paragraph): RichTextElement {
    const elements: RichTextElement = [];

    token.tokens.forEach((t) => {
      switch (t.type) {
        case 'text':
          elements.push(this.parseTextToken(t as Tokens.Text));
          break;
        case 'inlineKatex':
          elements.push(this.parseBlockKatexToken(t as EquationToken));
          break;
        case 'strong':
          elements.push(this.parseTextToken(t as Tokens.Strong));
          break;
        case 'em':
          elements.push(this.parseTextToken(t as Tokens.Em));
          break;
        case 'del':
          elements.push(this.parseTextToken(t as Tokens.Del));
          break;
        case 'codespan':
          elements.push(this.parseTextToken(t as Tokens.Codespan));
          break;
        case 'link':
          elements.push(this.parseLinkToken(t as Tokens.Link));
          break;
        case 'image':
          elements.push(this.parseImageToken(t as Tokens.Image));
          break;
      }
    });

    return elements;
  }
  private parseToken(token: ExtendedToken): Element[] {
    const elements: Element[] = [];

    switch (token.type) {
      case 'heading': {
        elements.push(this.parseHeadingToken(token as Tokens.Heading));
        break;
      }
      case 'paragraph': {
        if (token.tokens?.length === 1 && token.tokens[0].type === 'image') {
          elements.push(this.parseImageToken(token.tokens[0] as Tokens.Image));
        } else {
          elements.push(
            new TextElement({
              text: this.parseParagraphToken(token as Tokens.Paragraph),
              level: TextElementLevel.Paragraph,
            })
          );
        }

        break;
      }
      case 'text': {
        elements.push(this.parseTextToken(token as Tokens.Text));
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
        elements.push(this.parseTextToken(token as Tokens.Strong | Tokens.Em));
        break;
      case 'blockKatex':
        elements.push(this.parseBlockKatexToken(token as EquationToken));
        break;
      case 'inlineKatex':
        elements.push(this.parseBlockKatexToken(token as EquationToken));
        break;
      default:
        break;
    }

    return elements;
  }

  parse({ content }: { content: string }): ParseResult {
    const tokens = this.preParseMarkdown(content);

    const elements: Element[] = [];

    for (const token of tokens) {
      elements.push(...this.parseToken(token));
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
