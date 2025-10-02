import winston from 'winston';
import { PreviewFormat } from '@/domains';
/**
 * MkNotes client
 */
export declare class MkNotes {
    readonly logger: winston.Logger;
    private infrastructureInstances;
    constructor({ LOG_LEVEL, logger, notionApiKey, }: {
        logger?: winston.Logger;
        LOG_LEVEL?: string;
        notionApiKey: string;
    });
    /**
     * Preview the synchronization of a markdown file to Notion
     */
    previewSynchronization({ inputPath, format, output, }: {
        inputPath: string;
        format: PreviewFormat;
        output?: string;
    }): Promise<string>;
    /**
     * Synchronize a markdown file to Notion
     */
    synchronizeMarkdownToNotionFromFileSystem({ inputPath, parentNotionPageId, cleanSync, lockPage, }: {
        inputPath: string;
        parentNotionPageId: string;
        cleanSync?: boolean;
        lockPage?: boolean;
    }): Promise<void>;
}
