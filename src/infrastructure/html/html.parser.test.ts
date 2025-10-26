import { HtmlParser } from './html.parser';
import { ElementCodeLanguage, TextElementStyle } from '@/domains/elements';
import winston from 'winston';

describe('HtmlParser', () => {
  let parser: HtmlParser;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
    } as unknown as winston.Logger;

    parser = new HtmlParser({ logger: mockLogger });
  });

  describe('parse', () => {
    it('should parse details/summary into toggle element', () => {
      const html = `
        <details>
          <summary>Toggle Title</summary>
          Toggle Content
        </details>
      `;

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        title: 'Toggle Title',
        children: [{ text: expect.stringContaining('Toggle Content') }]
      });
    });

    it('should parse kbd into code element', () => {
      const html = '<kbd>Ctrl + C</kbd>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        text: 'Ctrl + C',
        language: ElementCodeLanguage.PlainText
      });
    });

    it('should parse samp into code element', () => {
      const html = '<samp>Error: 404 Not Found</samp>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        text: 'Error: 404 Not Found',
        language: ElementCodeLanguage.PlainText
      });
    });

    it('should log warning for unsupported sub tag', () => {
      const html = '<sub>subscript</sub>';

      parser.parse({ content: html });

      expect(mockLogger.warn).toHaveBeenCalledWith('<sub> tag is not supported');
    });

    it('should log warning for unsupported sup tag', () => {
      const html = '<sup>superscript</sup>';

      parser.parse({ content: html });

      expect(mockLogger.warn).toHaveBeenCalledWith('<sup> tag is not supported');
    });

    it('should parse ins into underlined text element', () => {
      const html = '<ins>underlined text</ins>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        text: 'underlined text',
        styles: { underline: true }
      });
    });

    it('should parse del into strikethrough text element', () => {
      const html = '<del>deleted text</del>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        text: 'deleted text',
        styles: { strikethrough: true }
      });
    });

    it('should parse var into italic text element', () => {
      const html = '<var>variable</var>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        text: 'variable',
        styles: { italic: true }
      });
    });

    it('should parse q into quote element', () => {
      const html = '<q>quoted text</q>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        text: 'quoted text'
      });
    });

    it('should parse div into divider element', () => {
      const html = '<div></div>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toMatchObject({
        type: 'divider'
      });
    });

    it('should handle multiple elements', () => {
      const html = `
        <kbd>Ctrl + S</kbd>
        <var>x</var>
        <q>quote</q>
      `;

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(3);
      expect(result.content[0]).toMatchObject({ text: 'Ctrl + S' });
      expect(result.content[1]).toMatchObject({ text: 'x', styles: { italic: true } });
      expect(result.content[2]).toMatchObject({ text: 'quote' });
    });

    it('should ignore unsupported tags', () => {
      const html = '<unknown>ignored content</unknown>';

      const result = parser.parse({ content: html });

      expect(result.content).toHaveLength(0);
    });
  });
}); 