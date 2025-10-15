import { SupportedEmoji } from './types';
export declare enum ElementType {
    Page = "page",
    File = "file",
    Text = "text",
    Quote = "quote",
    Code = "code",
    Callout = "callout",
    Divider = "divider",
    Image = "image",
    Link = "link",
    Table = "table",
    ListItem = "list-item",
    Html = "html",
    Toggle = "toggle",
    Equation = "equation",
    TableOfContents = "table-of-contents"
}
export declare class Element {
    type: ElementType;
    constructor(type: ElementType);
}
/**
 * Element that represents the concept of page (in knowledge management systems)
 */
export declare class PageElement extends Element {
    title: string;
    icon?: SupportedEmoji;
    content: Element[];
    constructor({ title, icon, content, }: {
        title: string;
        icon?: SupportedEmoji;
        content: Element[];
    });
    getIcon(): SupportedEmoji | undefined;
    addElementToBeginning(element: Element): void;
    addElementToEnd(element: Element): void;
}
/**
 * Element that represents a file in the system
 */
export declare class FileElement extends Element {
    content: string;
    name?: string;
    creationDate?: Date;
    lastUpdatedDate?: Date;
    extension?: string;
    constructor({ content, name, creationDate, lastUpdatedDate, extension, }: {
        content: string;
        name?: string;
        creationDate?: Date;
        lastUpdatedDate?: Date;
        extension?: string;
    });
}
export declare class ListItemElement extends Element {
    listType: 'ordered' | 'unordered';
    text: RichTextElement;
    constructor({ listType, text, }: {
        listType: 'ordered' | 'unordered';
        text: RichTextElement;
    });
}
export declare class TableElement extends Element {
    rows: string[][];
    constructor({ rows }: {
        rows: string[][];
    });
}
export declare enum TextElementLevel {
    Heading1 = "heading_1",
    Heading2 = "heading_2",
    Heading3 = "heading_3",
    Heading4 = "heading_4",
    Heading5 = "heading_5",
    Heading6 = "heading_6",
    Paragraph = "paragraph"
}
export declare enum TextElementStyle {
    Italic = "italic",
    Bold = "bold",
    Strikethrough = "strikethrough",
    Underline = "underline"
}
export type RichTextElement = (TextElement | LinkElement | ImageElement | EquationElement)[];
export type TextElementStyles = {
    italic: boolean;
    bold: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
};
export declare class TextElement extends Element {
    text: string | RichTextElement;
    level: TextElementLevel;
    styles: TextElementStyles;
    constructor({ text, level, styles, }: {
        text: string | RichTextElement;
        level?: TextElementLevel;
        styles?: {
            italic?: boolean;
            bold?: boolean;
            strikethrough?: boolean;
            underline?: boolean;
            code?: boolean;
        };
    });
}
export declare class QuoteElement extends Element {
    text: string;
    constructor({ text }: {
        text: string;
    });
}
export declare enum ElementCodeLanguage {
    JavaScript = "javascript",
    TypeScript = "typescript",
    Python = "python",
    Java = "java",
    CSharp = "csharp",
    CPlusPlus = "c++",
    Go = "go",
    Ruby = "ruby",
    Swift = "swift",
    Kotlin = "kotlin",
    Rust = "rust",
    Shell = "shell",
    Scala = "scala",
    SQL = "sql",
    HTML = "html",
    CSS = "css",
    JSON = "json",
    YAML = "yaml",
    Markdown = "markdown",
    PlainText = "plaintext"
}
export declare const isElementCodeLanguage: (value: string) => value is ElementCodeLanguage;
export declare class CodeElement extends Element {
    language: ElementCodeLanguage;
    text: string;
    constructor({ language, text, }: {
        language: ElementCodeLanguage;
        text: string;
    });
}
export declare enum SpecialCalloutType {
    Note = "note",
    Tip = "tip",
    Important = "important",
    Warning = "warning",
    Caution = "caution"
}
export declare class CalloutElement extends Element {
    text: string;
    private readonly icon?;
    private readonly calloutType?;
    static isSpecialCalloutText(text: string): boolean;
    constructor({ icon, text }: {
        icon?: SupportedEmoji;
        text: string;
    });
    private getSpecialCalloutTypeAndText;
    getIcon(): SupportedEmoji | undefined;
}
export declare class DividerElement extends Element {
    constructor();
}
export declare class ImageElement extends Element {
    base64?: string;
    url?: string;
    caption?: string;
    name?: string;
    creationDate?: Date;
    lastUpdatedDate?: Date;
    extension?: string;
    filepath?: string;
    constructor({ base64, url, name, creationDate, lastUpdatedDate, extension, caption, filepath, }: {
        base64?: string;
        url?: string;
        name?: string;
        creationDate?: Date;
        lastUpdatedDate?: Date;
        extension?: string;
        caption?: string;
        filepath?: string;
    });
}
export declare class LinkElement extends Element {
    url: string;
    text: string;
    caption?: string;
    constructor({ url, text, caption, }: {
        url: string;
        text: string;
        caption?: string;
    });
}
export declare class HtmlElement extends Element {
    html: string;
    constructor({ html }: {
        html: string;
    });
}
export declare class ToggleElement extends Element {
    title: string;
    content: Element[];
    constructor({ title, content }: {
        title: string;
        content: Element[];
    });
}
export declare class TableOfContentsElement extends Element {
    constructor();
}
export declare class EquationElement extends Element {
    equation: string;
    styles: TextElementStyles;
    constructor({ equation, styles, }: {
        equation: string;
        styles?: {
            italic?: boolean;
            bold?: boolean;
            strikethrough?: boolean;
            underline?: boolean;
            code?: boolean;
        };
    });
}
