"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownParser = void 0;
const front_matter_1 = __importDefault(require("front-matter"));
const marked_1 = require("marked");
const marked_katex_extension_1 = __importDefault(require("marked-katex-extension"));
const elements_1 = require("../../domains/elements");
class MarkdownParser extends elements_1.ParserRepository {
    htmlParser;
    currentFilePath;
    constructor({ htmlParser, logger, }) {
        super({ logger });
        this.htmlParser = htmlParser;
        marked_1.marked.use((0, marked_katex_extension_1.default)({ throwOnError: false, nonStandard: true }));
    }
    setCurrentFilePath(filePath) {
        this.currentFilePath = filePath;
    }
    preParseMarkdown(src) {
        const { body } = (0, front_matter_1.default)(src);
        return marked_1.marked.lexer(body);
    }
    getMetadata(src) {
        const { attributes } = (0, front_matter_1.default)(src);
        if (!attributes || typeof attributes !== 'object') {
            return {};
        }
        return attributes;
    }
    getTextLevelFromDepth(depth) {
        const mapping = {
            1: elements_1.TextElementLevel.Heading1,
            2: elements_1.TextElementLevel.Heading2,
            3: elements_1.TextElementLevel.Heading3,
            4: elements_1.TextElementLevel.Heading4,
            5: elements_1.TextElementLevel.Heading5,
            6: elements_1.TextElementLevel.Heading6,
        };
        if (depth < 1 || depth > 6) {
            return elements_1.TextElementLevel.Paragraph;
        }
        return mapping[depth];
    }
    /**
     * Parse a heading token
     */
    parseHeadingToken(token) {
        const level = this.getTextLevelFromDepth(token.depth);
        return new elements_1.TextElement({
            text: token.text,
            level,
        });
    }
    parseListToken(token) {
        return token.items.map((item) => new elements_1.ListItemElement({
            listType: token.ordered ? 'ordered' : 'unordered',
            text: this.parseRawText(item.text),
        }));
    }
    parseBlockQuoteToken(token) {
        const text = token.text.trim();
        if (text.startsWith('[!NOTE]')) {
            return new elements_1.CalloutElement({
                text: text.replace('[!NOTE]', '').trim(),
                icon: '💡',
            });
        }
        return new elements_1.QuoteElement({
            text: text,
        });
    }
    parseCodeToken(token) {
        const language = token.lang || elements_1.ElementCodeLanguage.PlainText;
        if (language === 'js') {
            return new elements_1.CodeElement({
                text: token.text,
                language: elements_1.ElementCodeLanguage.JavaScript,
            });
        }
        const isSupportedLanguage = (0, elements_1.isElementCodeLanguage)(language);
        if (!isSupportedLanguage) {
            return new elements_1.CodeElement({
                text: token.text,
                language: elements_1.ElementCodeLanguage.PlainText,
            });
        }
        return new elements_1.CodeElement({
            text: token.text,
            language,
        });
    }
    parseCalloutToken(token) {
        if (!token.callout || typeof token.callout !== 'string') {
            throw new Error('Callout token does not have a callout property');
        }
        return new elements_1.CalloutElement({
            text: token.callout,
            icon: '💡',
        });
    }
    parseTableToken(token) {
        const headers = token.header.map((cell) => cell.text);
        const rows = token.rows.map((row) => row.map((cell) => cell.text));
        return new elements_1.TableElement({
            rows: [headers, ...rows],
        });
    }
    parseImageToken(token) {
        return new elements_1.ImageElement({
            url: token.href,
            caption: token.text,
            filepath: this.currentFilePath,
        });
    }
    parseHtmlToken(token) {
        const { content } = this.htmlParser.parse({ content: token.text });
        return content;
    }
    parseLinkToken(token) {
        return new elements_1.LinkElement({
            text: token.text,
            url: token.href,
        });
    }
    parseTextToken(token) {
        if (token.type === 'strong') {
            return new elements_1.TextElement({
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
            return new elements_1.TextElement({
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
            return new elements_1.TextElement({
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
            return new elements_1.TextElement({
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
        return new elements_1.TextElement({
            text: token.text,
        });
    }
    parseBlockKatexToken(token) {
        return new elements_1.EquationElement({
            equation: token.text,
            styles: {
                italic: false,
                bold: false,
                strikethrough: false,
                underline: false,
            },
        });
    }
    parseRawText(text) {
        const tokens = this.preParseMarkdown(text);
        const elements = [];
        for (const t of tokens) {
            switch (t.type) {
                case 'paragraph':
                    elements.push(...this.parseParagraphToken(t));
                    break;
                case 'text':
                    elements.push(this.parseTextToken(t));
                    break;
            }
        }
        return elements;
    }
    parseParagraphToken(token) {
        const elements = [];
        token.tokens.forEach((t) => {
            switch (t.type) {
                case 'text':
                    elements.push(this.parseTextToken(t));
                    break;
                case 'inlineKatex':
                    elements.push(this.parseBlockKatexToken(t));
                    break;
                case 'strong':
                    elements.push(this.parseTextToken(t));
                    break;
                case 'em':
                    elements.push(this.parseTextToken(t));
                    break;
                case 'del':
                    elements.push(this.parseTextToken(t));
                    break;
                case 'codespan':
                    elements.push(this.parseTextToken(t));
                    break;
                case 'link':
                    elements.push(this.parseLinkToken(t));
                    break;
                case 'image':
                    elements.push(this.parseImageToken(t));
                    break;
            }
        });
        return elements;
    }
    parseToken(token) {
        const elements = [];
        switch (token.type) {
            case 'heading': {
                elements.push(this.parseHeadingToken(token));
                break;
            }
            case 'paragraph': {
                if (token.tokens?.length === 1 && token.tokens[0].type === 'image') {
                    elements.push(this.parseImageToken(token.tokens[0]));
                }
                else {
                    elements.push(new elements_1.TextElement({
                        text: this.parseParagraphToken(token),
                        level: elements_1.TextElementLevel.Paragraph,
                    }));
                }
                break;
            }
            case 'text': {
                elements.push(this.parseTextToken(token));
                break;
            }
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
                elements.push(new elements_1.DividerElement());
                break;
            case 'image':
                elements.push(this.parseImageToken(token));
                break;
            case 'html':
                elements.push(...this.parseHtmlToken(token));
                break;
            case 'link':
                elements.push(this.parseLinkToken(token));
                break;
            case 'strong':
            case 'em':
            case 'del':
                elements.push(this.parseTextToken(token));
                break;
            case 'blockKatex':
                elements.push(this.parseBlockKatexToken(token));
                break;
            case 'inlineKatex':
                elements.push(this.parseBlockKatexToken(token));
                break;
            default:
                break;
        }
        return elements;
    }
    parse({ content }) {
        const tokens = this.preParseMarkdown(content);
        const elements = [];
        for (const token of tokens) {
            elements.push(...this.parseToken(token));
        }
        const result = {
            content: elements,
        };
        const fileMetadata = this.getMetadata(content);
        if (fileMetadata.title) {
            result.title = fileMetadata.title;
        }
        if (fileMetadata.icon) {
            result.icon = fileMetadata.icon;
        }
        return result;
    }
}
exports.MarkdownParser = MarkdownParser;
