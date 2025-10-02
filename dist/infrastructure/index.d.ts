import { Logger } from 'winston';
import { DestinationRepository, ElementConverterRepository, PageElement, SourceRepository } from '../domains';
import { FileConverter } from '../infrastructure/filesystem';
import { HtmlParser } from '../infrastructure/html';
import { MarkdownParser } from '../infrastructure/markdown';
import { NotionPage } from '../infrastructure/notion';
interface getInfrastructureInstanceProps {
    logger: Logger;
    notionApiKey: string;
}
export interface InfrastructureInstances {
    fileSystemSource: SourceRepository<{
        path: string;
    }>;
    fileConverter: FileConverter;
    htmlParser: HtmlParser;
    markdownParser: MarkdownParser;
    notionDestination: DestinationRepository<NotionPage>;
    notionConverter: ElementConverterRepository<PageElement, NotionPage>;
}
export declare const getInfrastructureInstances: (args: getInfrastructureInstanceProps) => InfrastructureInstances;
export {};
