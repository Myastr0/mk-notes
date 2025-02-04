import * as DomSerializer from 'dom-serializer';
import { DomUtils, parseDocument } from 'htmlparser2';
import { Logger } from 'winston';

import {
  CodeElement,
  DividerElement,
  Element,
  ElementCodeLanguage,
  type ParseResult,
  type ParserRepository,
  QuoteElement,
  TextElement,
  TextElementStyle,
  ToggleElement,
} from '@/domains/elements';

export class HtmlParser implements ParserRepository {
  private logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
  }

  parse({ content }: { content: string }): ParseResult {
    const document = parseDocument(content);
    const elements: Element[] = [];

    for (const node of document.children) {
      if (node.type === 'tag') {
        switch (node.name) {
          case 'details': {
            const summaryNode = DomUtils.findOne(
              (n) => n.name === 'summary',
              node.children
            );

            const detailsContent = DomSerializer.render(node);

            elements.push(
              new ToggleElement({
                title: summaryNode ? DomUtils.textContent(summaryNode) : '',
                content: this.parse({
                  content: detailsContent,
                }).content,
              })
            );

            break;
          }
          case 'kbd':
          case 'samp':
            const codeElement = new CodeElement({
              text: DomUtils.textContent(node),
              language: ElementCodeLanguage.PlainText,
            });

            elements.push(codeElement);
            break;
          case 'sub':
            this.logger.warn('<sub> tag is not supported');
            break;
          case 'sup':
            this.logger.warn('<sup> tag is not supported');
            break;
          case 'ins':
            elements.push(
              new TextElement({
                text: DomUtils.textContent(node),
                style: TextElementStyle.Underline,
              })
            );
            break;
          case 'del':
            elements.push(
              new TextElement({
                text: DomUtils.textContent(node),
                style: TextElementStyle.Strikethrough,
              })
            );
            break;
          case 'var':
            elements.push(
              new TextElement({
                text: DomUtils.textContent(node),
                style: TextElementStyle.Italic,
              })
            );
            break;
          case 'q':
            elements.push(
              new QuoteElement({
                text: DomUtils.textContent(node),
              })
            );
            break;
          case 'div':
            elements.push(new DividerElement());
            break;
          default:
            break;
        }
      }
    }

    return {
      content: elements,
    };
  }
}
