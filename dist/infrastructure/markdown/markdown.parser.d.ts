import { Logger } from 'winston';
import { ParseResult, ParserRepository } from '../../domains/elements';
import { HtmlParser } from '../../infrastructure/html';
export interface MarkdownMetadata {
    title?: string;
    icon?: string;
}
export declare class MarkdownParser extends ParserRepository {
    private htmlParser;
    private currentFilePath?;
    constructor({ htmlParser, logger, }: {
        htmlParser: HtmlParser;
        logger: Logger;
    });
    setCurrentFilePath(filePath: string): void;
    private preParseMarkdown;
    getMetadata(src: string): MarkdownMetadata;
    private getTextLevelFromDepth;
    /**
     * Parse a heading token
     */
    private parseHeadingToken;
    private parseListToken;
    private parseBlockQuoteToken;
    private parseCodeToken;
    private parseCalloutToken;
    private parseTableToken;
    private parseImageToken;
    private parseHtmlToken;
    private parseLinkToken;
    private parseTextToken;
    private parseBlockKatexToken;
    private parseRawText;
    private parseParagraphToken;
    private parseToken;
    parse({ content }: {
        content: string;
    }): ParseResult;
}
