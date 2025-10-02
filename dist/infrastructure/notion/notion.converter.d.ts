import { Logger } from 'winston';
import { type ElementConverterRepository, PageElement } from '@/domains/elements';
import { NotionPage } from '@/domains/notion/NotionPage';
import { NotionFileUploadService } from './file-upload.service';
export declare class NotionConverterRepository implements ElementConverterRepository<PageElement, NotionPage> {
    private logger;
    private fileUploadService?;
    private currentFilePath?;
    private basePath?;
    constructor({ logger, fileUploadService, }: {
        logger: Logger;
        fileUploadService?: NotionFileUploadService;
    });
    setCurrentFilePath(filePath: string): void;
    setBasePath(basePath: string): void;
    /**
     * Determine if an image URL is a local file path (relative or absolute local path)
     */
    private isLocalImagePath;
    private convertPageElement;
    private convertElement;
    convertFromElement(element: PageElement): Promise<NotionPage>;
    private convertText;
    private convertQuote;
    private convertCallout;
    private convertListItem;
    private convertBulletedListItem;
    private convertNumberedListItem;
    private convertTable;
    private convertTableRow;
    private convertToggle;
    private convertLink;
    private convertDivider;
    private getNotionLanguageFromElementLanguage;
    private convertCodeBlock;
    private convertImage;
    /**
     * Convert local image using file upload service
     */
    private convertLocalImage;
    /**
     * Convert external image using external URL (original behavior)
     */
    private convertExternalImage;
    private convertHtml;
    private convertEquation;
    private convertRichText;
    private convertTableOfContents;
    convertToElement(): PageElement;
}
