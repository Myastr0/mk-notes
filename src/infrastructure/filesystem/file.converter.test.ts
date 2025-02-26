import { FileConverter } from './file.converter';
import { PageElement, Element, TextElement, DividerElement, TableOfContentsElement } from '@/domains/elements';
import { SupportedEmoji } from '@/domains/elements/types';
import { FakeParserRepository, FakeMarkdownParser } from '../../../__tests__/__fakes__/fakeParser.repository';
import { fakeLogger } from '../../../__tests__/__fakes__/fakeLogger';
import { FakeFile } from '../../../__tests__/__fakes__/fakeFile';

describe('FileConverter', () => {
  let fileConverter: FileConverter;
  let htmlParser: FakeParserRepository;
  let markdownParser: FakeMarkdownParser;

  beforeEach(() => {
    htmlParser = new FakeParserRepository({ logger: fakeLogger });
    markdownParser = new FakeMarkdownParser({ logger: fakeLogger, htmlParser });

    fileConverter = new FileConverter({
      htmlParser,
      markdownParser,
      logger: fakeLogger,
    });
  });

  describe('convertToElement', () => {
    it('should convert a markdown file to a PageElement', () => {
      const file = new FakeFile({
        name: 'test.md',
        extension: 'md',
        content: '# Test Content',
        lastUpdated: new Date(),
      });

      const mockParseResult = {
        title: 'Parsed Title',
        content: [new TextElement({text: 'Test Content'})] as Element[],
        icon: '📝' as SupportedEmoji,
      };

      jest.spyOn(markdownParser, 'parse').mockReturnValue(mockParseResult);

      const result = fileConverter.convertToElement(file);

      expect(result).toBeInstanceOf(PageElement);
      expect(markdownParser.parse).toHaveBeenCalledWith({ content: file.content });
      expect(result).toEqual(
        new PageElement({
          title: mockParseResult.title,
          content: mockParseResult.content,
          icon: mockParseResult.icon,
        })
      );
    });

    it('should convert an HTML file to a PageElement', () => {
      const file = new FakeFile({
        name: 'test.html',
        extension: 'html',
        content: '<h1>Test Content</h1>',
        lastUpdated: new Date(),
      });

      const mockParseResult = {
        title: 'Parsed Title',
        content: [new TextElement({text: 'Test Content'})] as Element[],
        icon: '🌐' as SupportedEmoji,
      };

      jest.spyOn(htmlParser, 'parse').mockReturnValue(mockParseResult);

      const result = fileConverter.convertToElement(file);

      expect(result).toBeInstanceOf(PageElement);
      expect(htmlParser.parse).toHaveBeenCalledWith({ content: file.content });
      expect(result).toEqual(
        new PageElement({
          title: mockParseResult.title,
          content: mockParseResult.content,
          icon: mockParseResult.icon,
        })
      );
    });

    it('should throw an error for an unsupported file extension', () => {
      const file = new FakeFile({
        name: 'test.txt',
        extension: 'txt',
        content: 'Test Content',
        lastUpdated: new Date(),
      });

      expect(() => fileConverter.convertToElement(file)).toThrow('File extension not supported');
    });

    it('should use the file title as the page title', () => {
      const file = new FakeFile({
        name: 'Custom Title.md',
        extension: 'md',
        content: '# Different Title',
        lastUpdated: new Date(),
      });

      const mockParseResult = {
        title: 'Parsed Title',
        content: [new TextElement({text: 'Test Content'})] as Element[],
        icon: '📝' as SupportedEmoji,
      };

      jest.spyOn(markdownParser, 'parse').mockReturnValue(mockParseResult);

      const result = fileConverter.convertToElement(file);

      expect(result.title).toBe('Parsed Title');
    });

    it('should preserve the parser metadata in the PageElement', () => {
      const file = new FakeFile({
        name: 'test.md',
        extension: 'md',
        content: '# Test Content',
        lastUpdated: new Date(),
      });

      const mockParseResult = {
        title: 'Parsed Title',
        content: [
          new TextElement({text: 'Test Content'}),
          new DividerElement(),
          new TableOfContentsElement(),
        ] as Element[],
        icon: '📚' as SupportedEmoji,
      };

      jest.spyOn(markdownParser, 'parse').mockReturnValue(mockParseResult);

      const result = fileConverter.convertToElement(file);

      expect(result.content).toEqual(mockParseResult.content);
      expect(result.icon).toBe(mockParseResult.icon);
    });
  });
}); 