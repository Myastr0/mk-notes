import { SupportedEmoji } from './types';

export enum ElementType {
  Page = 'page',
  File = 'file',
  Text = 'text',
  Quote = 'quote',
  Code = 'code',
  Callout = 'callout',
  Divider = 'divider',
  Image = 'image',
  Link = 'link',
  Table = 'table',
  ListItem = 'list-item',
  Html = 'html',
  Toggle = 'toggle',
  Equation = 'equation',
  TableOfContents = 'table-of-contents',
}

export class Element {
  public type: ElementType;

  constructor(type: ElementType) {
    this.type = type;
  }
}

/**
 * Element that represents the concept of page (in knowledge management systems)
 */
export class PageElement extends Element {
  public title: string;
  public icon?: SupportedEmoji;
  public content: Element[];

  constructor({
    title,
    icon,
    content = [],
  }: {
    title: string;
    icon?: SupportedEmoji;
    content: Element[];
  }) {
    super(ElementType.Page);
    this.title = title;
    this.icon = icon;
    this.content = content;
  }

  public getIcon(): SupportedEmoji | undefined {
    return this.icon;
  }

  public addElementToBeginning(element: Element): void {
    this.content.unshift(element);
  }

  public addElementToEnd(element: Element): void {
    this.content.push(element);
  }
}

/**
 * Element that represents a file in the system
 */
export class FileElement extends Element {
  public content: string;
  public name?: string;
  public creationDate?: Date;
  public lastUpdatedDate?: Date;
  public extension?: string;

  constructor({
    content,
    name,
    creationDate,
    lastUpdatedDate,
    extension,
  }: {
    content: string;
    name?: string;
    creationDate?: Date;
    lastUpdatedDate?: Date;
    extension?: string;
  }) {
    super(ElementType.File);
    this.content = content;
    this.name = name;
    this.creationDate = creationDate;
    this.lastUpdatedDate = lastUpdatedDate;
    this.extension = extension;
  }
}

export class ListItemElement extends Element {
  public listType: 'ordered' | 'unordered';
  public text: RichTextElement;
  public children?: Element[];
  constructor({
    listType,
    text,
    children,
  }: {
    listType: 'ordered' | 'unordered';
    text: RichTextElement;
    children?: Element[];
  }) {
    super(ElementType.ListItem);
    this.listType = listType;
    this.text = text;
    this.children = children;
  }
}

export class TableElement extends Element {
  public rows: string[][];

  constructor({ rows }: { rows: string[][] }) {
    super(ElementType.Table);
    this.rows = rows;
  }
}

export enum TextElementLevel {
  Heading1 = 'heading_1',
  Heading2 = 'heading_2',
  Heading3 = 'heading_3',
  Heading4 = 'heading_4',
  Heading5 = 'heading_5',
  Heading6 = 'heading_6',
  Paragraph = 'paragraph',
}

export enum TextElementStyle {
  Italic = 'italic',
  Bold = 'bold',
  Strikethrough = 'strikethrough',
  Underline = 'underline',
}

export type RichTextElement = (
  | TextElement
  | LinkElement
  | ImageElement
  | EquationElement
  | ListItemElement
)[];

export type TextElementStyles = {
  italic: boolean;
  bold: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
};

export class TextElement extends Element {
  public text: string | RichTextElement;
  public level: TextElementLevel;
  public styles: TextElementStyles = {
    italic: false,
    bold: false,
    strikethrough: false,
    underline: false,
    code: false,
  };

  constructor({
    text,
    level = TextElementLevel.Paragraph,
    styles,
  }: {
    text: string | RichTextElement;
    level?: TextElementLevel;
    styles?: {
      italic?: boolean;
      bold?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      code?: boolean;
    };
  }) {
    super(ElementType.Text);
    this.text = text;
    this.level = level;
    this.styles.bold = styles?.bold || false;
    this.styles.italic = styles?.italic || false;
    this.styles.strikethrough = styles?.strikethrough || false;
    this.styles.underline = styles?.underline || false;
    this.styles.code = styles?.code || false;
  }
}

export class QuoteElement extends Element {
  public text: string;

  constructor({ text }: { text: string }) {
    super(ElementType.Quote);
    this.text = text;
  }
}

export enum ElementCodeLanguage {
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  Java = 'java',
  CSharp = 'csharp',
  CPlusPlus = 'c++',
  Go = 'go',
  Ruby = 'ruby',
  Swift = 'swift',
  Kotlin = 'kotlin',
  Rust = 'rust',
  Shell = 'shell',
  Scala = 'scala',
  SQL = 'sql',
  HTML = 'html',
  CSS = 'css',
  JSON = 'json',
  YAML = 'yaml',
  Markdown = 'markdown',
  Mermaid = 'mermaid',
  PlainText = 'plaintext',
}

export const isElementCodeLanguage = (
  value: string
): value is ElementCodeLanguage => {
  return Object.values(ElementCodeLanguage).includes(
    value as ElementCodeLanguage
  );
};
export class CodeElement extends Element {
  public language: ElementCodeLanguage;
  public text: string;

  constructor({
    language,
    text,
  }: {
    language: ElementCodeLanguage;
    text: string;
  }) {
    super(ElementType.Code);
    this.language = language;
    this.text = text;
  }
}

const specialCalloutRegex =
  // eslint-disable-next-line no-useless-escape
  /^\s*\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*)/ims;

export enum SpecialCalloutType {
  Note = 'note',
  Tip = 'tip',
  Important = 'important',
  Warning = 'warning',
  Caution = 'caution',
}

export class CalloutElement extends Element {
  public text: string;
  private readonly icon?: SupportedEmoji;
  private readonly calloutType?: SpecialCalloutType;

  public static isSpecialCalloutText(text: string): boolean {
    return specialCalloutRegex.test(text.trim());
  }

  constructor({ icon, text }: { icon?: SupportedEmoji; text: string }) {
    super(ElementType.Callout);
    this.icon = icon;
    this.text = text;

    const { text: parsedText, calloutType } =
      this.getSpecialCalloutTypeAndText(text);

    if (calloutType) {
      this.calloutType = calloutType;
      this.text = parsedText;
    }
  }

  private getSpecialCalloutTypeAndText(text: string): {
    calloutType: SpecialCalloutType | null;
    text: string;
  } {
    const textToSpecialCalloutType: Record<string, SpecialCalloutType> = {
      note: SpecialCalloutType.Note,
      tip: SpecialCalloutType.Tip,
      important: SpecialCalloutType.Important,
      warning: SpecialCalloutType.Warning,
      caution: SpecialCalloutType.Caution,
    };

    const match = specialCalloutRegex.exec(text.trim());

    if (match) {
      const typeString = match[1].toLowerCase() as SpecialCalloutType;
      const text = match[2].trim();

      const calloutType = textToSpecialCalloutType[typeString];

      if (calloutType) {
        return { calloutType, text };
      }
    }

    return {
      calloutType: null,
      text,
    };
  }
  public getIcon(): SupportedEmoji | undefined {
    const iconMap: Record<SpecialCalloutType, SupportedEmoji> = {
      [SpecialCalloutType.Note]: 'ℹ️',
      [SpecialCalloutType.Tip]: '💡',
      [SpecialCalloutType.Important]: '⚠️',
      [SpecialCalloutType.Warning]: '⚠️',
      [SpecialCalloutType.Caution]: '⚠️',
    };

    if (this.calloutType && iconMap[this.calloutType]) {
      return iconMap[this.calloutType];
    }

    return this.icon;
  }
}

export class DividerElement extends Element {
  constructor() {
    super(ElementType.Divider);
  }
}

export class ImageElement extends Element {
  public base64?: string;
  public url?: string;
  public caption?: string;
  public name?: string;
  public creationDate?: Date;
  public lastUpdatedDate?: Date;
  public extension?: string;
  public filepath?: string;

  constructor({
    base64,
    url,
    name,
    creationDate,
    lastUpdatedDate,
    extension,
    caption,
    filepath,
  }: {
    base64?: string;
    url?: string;
    name?: string;
    creationDate?: Date;
    lastUpdatedDate?: Date;
    extension?: string;
    caption?: string;
    filepath?: string;
  }) {
    super(ElementType.Image);
    this.name = name;
    this.creationDate = creationDate;
    this.lastUpdatedDate = lastUpdatedDate;
    this.extension = extension;
    this.base64 = base64;
    this.url = url;
    this.caption = caption;
    this.filepath = filepath;
  }
}

export class LinkElement extends Element {
  public url: string;
  public text: string;
  public caption?: string;

  constructor({
    url,
    text,
    caption,
  }: {
    url: string;
    text: string;
    caption?: string;
  }) {
    super(ElementType.Link);
    this.url = url;
    this.text = text;
    this.caption = caption;
  }
}

export class HtmlElement extends Element {
  public html: string;

  constructor({ html }: { html: string }) {
    super(ElementType.Html);
    this.html = html;
  }
}

export class ToggleElement extends Element {
  public title: string;
  public children: Element[];

  constructor({ title, children }: { title: string; children: Element[] }) {
    super(ElementType.Toggle);
    this.title = title;
    this.children = children;
  }
}

export class TableOfContentsElement extends Element {
  constructor() {
    super(ElementType.TableOfContents);
  }
}

export class EquationElement extends Element {
  public equation: string;
  public styles: TextElementStyles = {
    italic: false,
    bold: false,
    strikethrough: false,
    underline: false,
    code: false,
  };

  constructor({
    equation,
    styles,
  }: {
    equation: string;
    styles?: {
      italic?: boolean;
      bold?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      code?: boolean;
    };
  }) {
    super(ElementType.Equation);
    this.equation = equation;
    this.styles.bold = styles?.bold || false;
    this.styles.italic = styles?.italic || false;
    this.styles.strikethrough = styles?.strikethrough || false;
    this.styles.underline = styles?.underline || false;
    this.styles.code = styles?.code || false;
  }
}
