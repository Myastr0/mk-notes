import { Logger } from 'winston';
import { Element, ElementConverterRepository } from '@/domains/elements';
import { type DestinationRepository, type File, type Page, type SourceRepository } from '@/domains/synchronization';
interface SynchronizationServiceParams<T, U extends Page> {
    sourceRepository: SourceRepository<T>;
    destinationRepository: DestinationRepository<U>;
    elementConverter: ElementConverterRepository<Element, File>;
    logger: Logger;
}
export interface SynchronizeOptions {
    /** When true, delete all existing content before syncing */
    cleanSync: boolean;
    /** When true, lock the Notion page after syncing */
    lockPage: boolean;
}
export declare class SynchronizeMarkdownToNotion<T, U extends Page> {
    private sourceRepository;
    private destinationRepository;
    private elementConverter;
    private logger;
    constructor(params: SynchronizationServiceParams<T, U>);
    execute(args: T & {
        notionParentPageUrl: string;
    } & SynchronizeOptions): Promise<void>;
    private synchronizeTreeNode;
}
export {};
