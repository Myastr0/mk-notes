"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquationElement = exports.TableOfContentsElement = exports.ToggleElement = exports.HtmlElement = exports.LinkElement = exports.ImageElement = exports.DividerElement = exports.CalloutElement = exports.SpecialCalloutType = exports.CodeElement = exports.isElementCodeLanguage = exports.ElementCodeLanguage = exports.QuoteElement = exports.TextElement = exports.TextElementStyle = exports.TextElementLevel = exports.TableElement = exports.ListItemElement = exports.FileElement = exports.PageElement = exports.Element = exports.ElementType = void 0;
var ElementType;
(function (ElementType) {
    ElementType["Page"] = "page";
    ElementType["File"] = "file";
    ElementType["Text"] = "text";
    ElementType["Quote"] = "quote";
    ElementType["Code"] = "code";
    ElementType["Callout"] = "callout";
    ElementType["Divider"] = "divider";
    ElementType["Image"] = "image";
    ElementType["Link"] = "link";
    ElementType["Table"] = "table";
    ElementType["ListItem"] = "list-item";
    ElementType["Html"] = "html";
    ElementType["Toggle"] = "toggle";
    ElementType["Equation"] = "equation";
    ElementType["TableOfContents"] = "table-of-contents";
})(ElementType || (exports.ElementType = ElementType = {}));
class Element {
    type;
    constructor(type) {
        this.type = type;
    }
}
exports.Element = Element;
/**
 * Element that represents the concept of page (in knowledge management systems)
 */
class PageElement extends Element {
    title;
    icon;
    content;
    constructor({ title, icon, content = [], }) {
        super(ElementType.Page);
        this.title = title;
        this.icon = icon;
        this.content = content;
    }
    getIcon() {
        return this.icon;
    }
    addElementToBeginning(element) {
        this.content.unshift(element);
    }
    addElementToEnd(element) {
        this.content.push(element);
    }
}
exports.PageElement = PageElement;
/**
 * Element that represents a file in the system
 */
class FileElement extends Element {
    content;
    name;
    creationDate;
    lastUpdatedDate;
    extension;
    constructor({ content, name, creationDate, lastUpdatedDate, extension, }) {
        super(ElementType.File);
        this.content = content;
        this.name = name;
        this.creationDate = creationDate;
        this.lastUpdatedDate = lastUpdatedDate;
        this.extension = extension;
    }
}
exports.FileElement = FileElement;
class ListItemElement extends Element {
    listType;
    text;
    constructor({ listType, text, }) {
        super(ElementType.ListItem);
        this.listType = listType;
        this.text = text;
    }
}
exports.ListItemElement = ListItemElement;
class TableElement extends Element {
    rows;
    constructor({ rows }) {
        super(ElementType.Table);
        this.rows = rows;
    }
}
exports.TableElement = TableElement;
var TextElementLevel;
(function (TextElementLevel) {
    TextElementLevel["Heading1"] = "heading_1";
    TextElementLevel["Heading2"] = "heading_2";
    TextElementLevel["Heading3"] = "heading_3";
    TextElementLevel["Heading4"] = "heading_4";
    TextElementLevel["Heading5"] = "heading_5";
    TextElementLevel["Heading6"] = "heading_6";
    TextElementLevel["Paragraph"] = "paragraph";
})(TextElementLevel || (exports.TextElementLevel = TextElementLevel = {}));
var TextElementStyle;
(function (TextElementStyle) {
    TextElementStyle["Italic"] = "italic";
    TextElementStyle["Bold"] = "bold";
    TextElementStyle["Strikethrough"] = "strikethrough";
    TextElementStyle["Underline"] = "underline";
})(TextElementStyle || (exports.TextElementStyle = TextElementStyle = {}));
class TextElement extends Element {
    text;
    level;
    styles = {
        italic: false,
        bold: false,
        strikethrough: false,
        underline: false,
        code: false,
    };
    constructor({ text, level = TextElementLevel.Paragraph, styles, }) {
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
exports.TextElement = TextElement;
class QuoteElement extends Element {
    text;
    constructor({ text }) {
        super(ElementType.Quote);
        this.text = text;
    }
}
exports.QuoteElement = QuoteElement;
var ElementCodeLanguage;
(function (ElementCodeLanguage) {
    ElementCodeLanguage["JavaScript"] = "javascript";
    ElementCodeLanguage["TypeScript"] = "typescript";
    ElementCodeLanguage["Python"] = "python";
    ElementCodeLanguage["Java"] = "java";
    ElementCodeLanguage["CSharp"] = "csharp";
    ElementCodeLanguage["CPlusPlus"] = "c++";
    ElementCodeLanguage["Go"] = "go";
    ElementCodeLanguage["Ruby"] = "ruby";
    ElementCodeLanguage["Swift"] = "swift";
    ElementCodeLanguage["Kotlin"] = "kotlin";
    ElementCodeLanguage["Rust"] = "rust";
    ElementCodeLanguage["Shell"] = "shell";
    ElementCodeLanguage["Scala"] = "scala";
    ElementCodeLanguage["SQL"] = "sql";
    ElementCodeLanguage["HTML"] = "html";
    ElementCodeLanguage["CSS"] = "css";
    ElementCodeLanguage["JSON"] = "json";
    ElementCodeLanguage["YAML"] = "yaml";
    ElementCodeLanguage["Markdown"] = "markdown";
    ElementCodeLanguage["PlainText"] = "plaintext";
})(ElementCodeLanguage || (exports.ElementCodeLanguage = ElementCodeLanguage = {}));
const isElementCodeLanguage = (value) => {
    return Object.values(ElementCodeLanguage).includes(value);
};
exports.isElementCodeLanguage = isElementCodeLanguage;
class CodeElement extends Element {
    language;
    text;
    constructor({ language, text, }) {
        super(ElementType.Code);
        this.language = language;
        this.text = text;
    }
}
exports.CodeElement = CodeElement;
const specialCalloutRegex = 
// eslint-disable-next-line no-useless-escape
/^\s*\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*)/ims;
var SpecialCalloutType;
(function (SpecialCalloutType) {
    SpecialCalloutType["Note"] = "note";
    SpecialCalloutType["Tip"] = "tip";
    SpecialCalloutType["Important"] = "important";
    SpecialCalloutType["Warning"] = "warning";
    SpecialCalloutType["Caution"] = "caution";
})(SpecialCalloutType || (exports.SpecialCalloutType = SpecialCalloutType = {}));
class CalloutElement extends Element {
    text;
    icon;
    calloutType;
    static isSpecialCalloutText(text) {
        return specialCalloutRegex.test(text.trim());
    }
    constructor({ icon, text }) {
        super(ElementType.Callout);
        this.icon = icon;
        this.text = text;
        const { text: parsedText, calloutType } = this.getSpecialCalloutTypeAndText(text);
        if (calloutType) {
            this.calloutType = calloutType;
            this.text = parsedText;
        }
    }
    getSpecialCalloutTypeAndText(text) {
        const textToSpecialCalloutType = {
            note: SpecialCalloutType.Note,
            tip: SpecialCalloutType.Tip,
            important: SpecialCalloutType.Important,
            warning: SpecialCalloutType.Warning,
            caution: SpecialCalloutType.Caution,
        };
        const match = specialCalloutRegex.exec(text.trim());
        if (match) {
            const typeString = match[1].toLowerCase();
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
    getIcon() {
        const iconMap = {
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
exports.CalloutElement = CalloutElement;
class DividerElement extends Element {
    constructor() {
        super(ElementType.Divider);
    }
}
exports.DividerElement = DividerElement;
class ImageElement extends Element {
    base64;
    url;
    caption;
    name;
    creationDate;
    lastUpdatedDate;
    extension;
    filepath;
    constructor({ base64, url, name, creationDate, lastUpdatedDate, extension, caption, filepath, }) {
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
exports.ImageElement = ImageElement;
class LinkElement extends Element {
    url;
    text;
    caption;
    constructor({ url, text, caption, }) {
        super(ElementType.Link);
        this.url = url;
        this.text = text;
        this.caption = caption;
    }
}
exports.LinkElement = LinkElement;
class HtmlElement extends Element {
    html;
    constructor({ html }) {
        super(ElementType.Html);
        this.html = html;
    }
}
exports.HtmlElement = HtmlElement;
class ToggleElement extends Element {
    title;
    content;
    constructor({ title, content }) {
        super(ElementType.Toggle);
        this.title = title;
        this.content = content;
    }
}
exports.ToggleElement = ToggleElement;
class TableOfContentsElement extends Element {
    constructor() {
        super(ElementType.TableOfContents);
    }
}
exports.TableOfContentsElement = TableOfContentsElement;
class EquationElement extends Element {
    equation;
    styles = {
        italic: false,
        bold: false,
        strikethrough: false,
        underline: false,
        code: false,
    };
    constructor({ equation, styles, }) {
        super(ElementType.Equation);
        this.equation = equation;
        this.styles.bold = styles?.bold || false;
        this.styles.italic = styles?.italic || false;
        this.styles.strikethrough = styles?.strikethrough || false;
        this.styles.underline = styles?.underline || false;
        this.styles.code = styles?.code || false;
    }
}
exports.EquationElement = EquationElement;
