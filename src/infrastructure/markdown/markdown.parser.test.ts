import { MarkdownParser } from './markdown.parser';
import { HtmlParser } from '@/infrastructure/html';
import {
  TextElementLevel,
  TextElementStyle,
  ElementCodeLanguage,
  SupportedEmoji,
  ElementType,
  TextElement,
  ListItemElement,
  QuoteElement,
  CalloutElement,
  LinkElement,
  ImageElement,
  EquationElement,
} from '@/domains/elements';
import winston from 'winston';
import { assert } from 'console';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;
  let mockHtmlParser: jest.Mocked<HtmlParser>;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockHtmlParser = {
      parse: jest.fn().mockReturnValue({ content: [] }),
    } as unknown as jest.Mocked<HtmlParser>;

    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as winston.Logger;

    parser = new MarkdownParser({
      htmlParser: mockHtmlParser,
      logger: mockLogger,
    });
  });

  describe('parse', () => {
    it('should parse headings with different levels', () => {
      const markdown = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
`;

      const result = parser.parse({ content: markdown });

      expect(result.content).toHaveLength(6);
      expect(result.content[0]).toMatchObject({
        text: 'Heading 1',
        level: TextElementLevel.Heading1,
      });
      expect(result.content[5]).toMatchObject({
        text: 'Heading 6',
        level: TextElementLevel.Heading6,
      });
    });

    it('should parse text styling', () => {
      const markdown = `
**Bold text**
*Italic text*
~~Strikethrough text~~
`;

      const result = parser.parse({ content: markdown });

      expect(result.content).toHaveLength(1);

      assert(result.content[0] instanceof TextElement);
      expect(result.content[0].type).toBe(ElementType.Text);

      const textElement = result.content[0] as TextElement;
      
      expect(textElement).toBeInstanceOf(TextElement);
      
      expect(textElement.text).toMatchObject([
        { text: 'Bold text', styles: { bold: true } },
        { text: '\n', styles: { bold: false } },
        { text: 'Italic text', styles: { italic: true } },
        { text: '\n', styles: { italic: false } },
        { text: 'Strikethrough text', styles: { strikethrough: true } },
      ]);
    });

    it('should parse lists', () => {
      const markdown = `
- Unordered item 1
- Unordered item 2
1. Ordered item 1
2. Ordered item 2
`;

      const result = parser.parse({ content: markdown });

      expect(result.content).toHaveLength(4);
      assert(result.content[0] instanceof ListItemElement);
      const listItemElement = result.content[0] as ListItemElement;

      expect(listItemElement).toBeInstanceOf(ListItemElement);

      expect(listItemElement.listType).toBe('unordered');

      assert(listItemElement.text[0] instanceof TextElement);
      const textElement = listItemElement.text[0] as TextElement;

      expect(textElement).toBeInstanceOf(TextElement);
      expect(textElement).toMatchObject({ text: 'Unordered item 1', styles: { bold: false, italic: false, strikethrough: false, underline: false } });

      assert(result.content[1] instanceof ListItemElement);
      const listItemElement2 = result.content[1] as ListItemElement;

      expect(listItemElement2).toBeInstanceOf(ListItemElement);

      expect(listItemElement2.listType).toBe('unordered');

      assert(listItemElement2.text[0] instanceof TextElement);
      const textElement2 = listItemElement2.text[0] as TextElement;

      expect(textElement2).toBeInstanceOf(TextElement);
      expect(textElement2).toMatchObject({ text: 'Unordered item 2', styles: { bold: false, italic: false, strikethrough: false, underline: false } });

      assert(result.content[2] instanceof ListItemElement);
      const listItemElement3 = result.content[2] as ListItemElement;

      expect(listItemElement3).toBeInstanceOf(ListItemElement);

      expect(listItemElement3.listType).toBe('ordered');

      assert(listItemElement3.text[0] instanceof TextElement);
      const textElement3 = listItemElement3.text[0] as TextElement;

      expect(textElement3).toBeInstanceOf(TextElement);
      expect(textElement3).toMatchObject({ text: 'Ordered item 1', styles: { bold: false, italic: false, strikethrough: false, underline: false } });

      
    });

    it('should parse code blocks with language', () => {
      const markdown = '```typescript\nconst x = 1;\n```';

      const result = parser.parse({ content: markdown });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        text: 'const x = 1;',
        language: ElementCodeLanguage.TypeScript,
      });
    });

    it('should parse simple blockquotes', () => {
      const markdown = `
> Regular quote
`;

      const result = parser.parse({ content: markdown });

      expect(result.content).toHaveLength(1);

      assert(result.content[0] instanceof QuoteElement);
      const quoteElement = result.content[0] as QuoteElement;

      expect(quoteElement).toBeInstanceOf(QuoteElement);

    });

    it('should parse callouts', () => {
      const markdown = `
> [!NOTE] This is a callout
`;

      const result = parser.parse({ content: markdown });

      expect(result.content).toHaveLength(1);

      assert(result.content[0] instanceof CalloutElement);
      const calloutElement = result.content[0] as CalloutElement;

      expect(calloutElement).toBeInstanceOf(CalloutElement);
      expect(calloutElement).toMatchObject({ text: 'This is a callout', icon: '💡' });
    });

    it('should parse tables', () => {
      const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;

      const result = parser.parse({ content: markdown });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        rows: [
          ['Header 1', 'Header 2'],
          ['Cell 1', 'Cell 2'],
        ],
      });
    });

    it('should parse links and images', () => {
      const markdown = `
[Link text](https://example.com)
![Image alt](https://example.com/image.jpg)
`;

      const result = parser.parse({ content: markdown });

      console.log({result});
      const textElement = result.content[0] as TextElement;

      expect(textElement).toBeInstanceOf(TextElement);
      expect(textElement.text).toHaveLength(3);
      const linkElement = textElement.text[0] as LinkElement;

      expect(linkElement).toBeInstanceOf(LinkElement);
      expect(linkElement).toMatchObject({ text: 'Link text', url: 'https://example.com' });

      const newLineElement = textElement.text[1] as TextElement;
      expect(newLineElement).toBeInstanceOf(TextElement);
      expect(newLineElement).toMatchObject({ text: '\n', styles: { bold: false, italic: false, strikethrough: false, underline: false } });

      const imageElement = textElement.text[2] as ImageElement;

      expect(imageElement).toBeInstanceOf(ImageElement);
      expect(imageElement).toMatchObject({ url: 'https://example.com/image.jpg', caption: 'Image alt' });
    });

    it('should parse equations', () => {
      const markdown = `
$$
a^2 + b^2 = c^2
$$

This is an inline equation: $E=mc^2$.

- This is an item with an equation: $E=mc^2$.
`;

      const result = parser.parse({ content: markdown });
      expect(result.content).toHaveLength(3);

      const blockEquation = result.content[0] as EquationElement;
      expect(blockEquation).toBeInstanceOf(EquationElement);
      expect(blockEquation).toMatchObject({ equation: 'a^2 + b^2 = c^2' });

      const textWithInlineEquation = result.content[1] as TextElement;
      expect(textWithInlineEquation).toBeInstanceOf(TextElement);
      expect(textWithInlineEquation.text).toHaveLength(3);

      const textPart = textWithInlineEquation.text[0] as TextElement;
      expect(textPart).toBeInstanceOf(TextElement);
      expect(textPart.text).toBe('This is an inline equation: ');

      const inlineEquation = textWithInlineEquation.text[1] as EquationElement;
      expect(inlineEquation).toBeInstanceOf(EquationElement);
      expect(inlineEquation).toMatchObject({ equation: 'E=mc^2' });

      const textPart2 = textWithInlineEquation.text[2] as TextElement;
      expect(textPart2).toBeInstanceOf(TextElement);
      expect(textPart2.text).toBe('.');

      const listItemWithEquation = result.content[2] as ListItemElement;
      expect(listItemWithEquation).toBeInstanceOf(ListItemElement);
      expect(listItemWithEquation.text).toHaveLength(3);

      const listItemTextPart = listItemWithEquation.text[0] as TextElement;
      expect(listItemTextPart).toBeInstanceOf(TextElement);
      expect(listItemTextPart.text).toBe('This is an item with an equation: ');

      const listItemInlineEquation = listItemWithEquation.text[1] as EquationElement;
      expect(listItemInlineEquation).toBeInstanceOf(EquationElement);
      expect(listItemInlineEquation.equation).toBe('E=mc^2');

      const listItemTextPart2 = listItemWithEquation.text[2] as TextElement;
      expect(listItemTextPart2).toBeInstanceOf(TextElement);
      expect(listItemTextPart2.text).toBe('.');
    });

    it('should parse front matter metadata', () => {
      const markdown = `---
title: Test Title
icon: 👋
---
Content
`;

      const result = parser.parse({ content: markdown });

      expect(result.title).toBe('Test Title');
      expect(result.icon).toBe('👋' as SupportedEmoji);
      expect(result.content).toHaveLength(1);
    });

    it('should handle HTML content', () => {
      const markdown = '<div>HTML content</div>';
      mockHtmlParser.parse.mockReturnValue({
        content: [new TextElement({ text: 'Parsed HTML' })],
      });

      const result = parser.parse({ content: markdown });

      expect(mockHtmlParser.parse).toHaveBeenCalledWith({
        content: markdown,
      });
      expect(result.content).toHaveLength(1);
    });

    it.failing('should handle mixed inline styles', () => {
      const markdown = 'This is **bold and *italic* text**';

      const result = parser.parse({ content: markdown });

      assert(result.content[0] instanceof TextElement);
      const textElement = result.content[0] as TextElement;

      expect(textElement).toBeInstanceOf(TextElement);
      expect(textElement.text).toHaveLength(5);
      
      const boldElement = textElement.text[0] as TextElement;
      expect(boldElement).toBeInstanceOf(TextElement);
      expect(boldElement).toMatchObject({ text: 'This is ', styles: { bold: false, italic: false , strikethrough: false, underline: false } });

      const italicElement = textElement.text[1] as TextElement;
      expect(italicElement).toBeInstanceOf(TextElement);
      expect(italicElement).toMatchObject({ text: 'bold and ', styles: { bold: false, italic: true, strikethrough: false, underline: false } });

      const boldItalicElement = textElement.text[2] as TextElement;
      expect(boldItalicElement).toBeInstanceOf(TextElement);
      expect(boldItalicElement).toMatchObject({ text: 'italic', styles: { bold: true, italic: true, strikethrough: false, underline: false } });

      const textElement2 = textElement.text[3] as TextElement;
      expect(textElement2).toBeInstanceOf(TextElement);
      expect(textElement2).toMatchObject({ text: ' text', styles: { bold: false, italic: false, strikethrough: false, underline: false } });
      
    });
  });
}); 