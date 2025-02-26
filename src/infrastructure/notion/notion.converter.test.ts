import { NotionConverterRepository } from './notion.converter';
import {
  CalloutElement,
  CodeElement,
  ElementCodeLanguage,
  ElementType,
  LinkElement,
  ListItemElement,
  PageElement,
  QuoteElement,
  TableElement,
  TextElement,
  TextElementLevel,
  ToggleElement,
} from '@/domains/elements';

import winston from 'winston';

describe.skip('NotionConverterRepository', () => {
  let converter: NotionConverterRepository;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
    } as unknown as winston.Logger;

    converter = new NotionConverterRepository({ logger: mockLogger });
  });

  describe('convertFromElement', () => {
    it('should convert a basic page element', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
      });

      const result = converter.convertFromElement(pageElement);

      expect(result.toCreatePageBodyParameters()).toMatchObject({
        properties: {
          title: {
            title: [{
              text: { content: 'Test Page' }
            }]
          }
        },
        children: []
      });
    });

    it('should convert a page with icon', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        icon: '👋'
      });

      const result = converter.convertFromElement(pageElement);

      expect(result.toCreatePageBodyParameters()).toMatchObject({
        icon: { type: 'emoji', emoji: '👋' }
      });
    });

    it('should convert text elements with different levels', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new TextElement({ text: 'Heading 1', level: TextElementLevel.Heading1 }),
          new TextElement({ text: 'Paragraph', level: TextElementLevel.Paragraph })
        ]
      });

      const result = converter.convertFromElement(pageElement);

      const children = result.children;
      expect(result.children).toHaveLength(2);
      expect(children[0]).toMatchObject({
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: 'Heading 1' } }]
        }
      });
      expect(children[1]).toMatchObject({
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: 'Paragraph' } }]
        }
      });
    });

    it('should convert list items', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new ListItemElement({ text: [new TextElement({ text: 'Bullet item' })], listType: 'unordered' }),
          new ListItemElement({ text: [new TextElement({ text: 'hello'})], listType: 'ordered' })
        ]
      });

      const result = converter.convertFromElement(pageElement);
      const children = result.children;

      expect(children).toHaveLength(2);
      expect(children[0]).toMatchObject({
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: 'Bullet item' } }]
        }
      });
      expect(children[1]).toMatchObject({
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [{ text: { content: 'Numbered item' } }]
        }
      });
    });

    it('should convert code blocks with language', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new CodeElement({
            text: 'const x = 1;',
            language: ElementCodeLanguage.TypeScript
          })
        ]
      });

      const result = converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'code',
        code: {
          rich_text: [{ text: { content: 'const x = 1;' } }],
          language: 'typescript'
        }
      });
    });

    it('should convert tables', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new TableElement({
            rows: [
              ['Header 1', 'Header 2'],
              ['Cell 1', 'Cell 2']
            ]
          })
        ]
      });

      const result = converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'table',
        table: {
          table_width: 2,
          children: [
            {
              type: 'table_row',
              table_row: {
                cells: [
                  [{ text: { content: 'Header 1' } }],
                  [{ text: { content: 'Header 2' } }]
                ]
              }
            },
            {
              type: 'table_row',
              table_row: {
                cells: [
                  [{ text: { content: 'Cell 1' } }],
                  [{ text: { content: 'Cell 2' } }]
                ]
              }
            }
          ]
        }
      });
    });

    it('should convert callouts with icons', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new CalloutElement({
            text: 'Note content',
            icon: '💡'
          })
        ]
      });

      const result = converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'callout',
        callout: {
          rich_text: [{ text: { content: 'Note content' } }],
          icon: { type: 'emoji', emoji: '💡' }
        }
      });
    });

    it('should convert toggle blocks', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new ToggleElement({
            title: 'Toggle title',
            content: [
              new TextElement({ text: 'Toggle content', level: TextElementLevel.Paragraph })
            ]
          })
        ]
      });

      const result = converter.convertFromElement(pageElement);

      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'toggle',
        toggle: {
          rich_text: [{ text: { content: 'Toggle title' } }],
          children: [{
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: 'Toggle content' } }]
            }
          }]
        }
      });
    });

    it('should handle unsupported element types', () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          { type: 'unsupported' as ElementType } as any
        ]
      });

      expect(() => converter.convertFromElement(pageElement))
        .toThrow('Unsupported element type: unsupported');
    });
  });
}); 