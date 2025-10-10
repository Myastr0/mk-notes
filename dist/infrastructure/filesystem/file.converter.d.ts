import { Logger } from 'winston';
import { ElementConverterRepository, PageElement } from '../../domains/elements';
import { File } from '../../domains/synchronization';
import type { HtmlParser } from '../../infrastructure/html/html.parser';
import type { MarkdownParser } from '../../infrastructure/markdown/markdown.parser';
export declare class FileConverter implements ElementConverterRepository<PageElement, File> {
    private htmlParser;
    private markdownParser;
    private logger;
    constructor({ htmlParser, markdownParser, logger, }: {
        htmlParser: HtmlParser;
        markdownParser: MarkdownParser;
        logger: Logger;
    });
    setCurrentFilePath(filePath: string): void;
    convertToElement(file: File): PageElement;
}
