import { Logger } from 'winston';
export interface FileUploadResult {
    id: string;
    type: 'file_upload';
}
export interface FileUploadOptions {
    filePath: string;
    basePath?: string;
}
export interface WorkspaceFileLimits {
    maxFileSize: number;
    detectedAt: Date;
}
export declare class NotionFileUploadService {
    private client;
    private apiKey;
    private logger;
    private workspaceLimits;
    constructor({ apiKey, logger }: {
        apiKey: string;
        logger: Logger;
    });
    /**
     * Get the workspace file upload limits by retrieving bot user information
     */
    getWorkspaceFileLimits(): Promise<WorkspaceFileLimits>;
    /**
     * Check if a path is a local file (not a URL)
     */
    isLocalFile(imagePath: string): boolean;
    /**
     * Resolve the absolute path of a file based on the markdown file location
     */
    resolveFilePath(imagePath: string, basePath?: string): string;
    /**
     * Upload a file to Notion using the File Upload API workflow
     */
    uploadFile({ filePath, basePath, }: FileUploadOptions): Promise<FileUploadResult>;
    /**
     * Generate a unique 8-character hash from filename and file path
     */
    private generateFileHash;
    /**
     * Split filename into base name and extension
     */
    private parseFileName;
    /**
     * Truncate base name to fit within available space (accounting for extension + hash suffix)
     */
    private truncateToFitAvailableSpace;
    /**
     * Construct filename with hash suffix, ensuring total filename length (including extension)
     * fits within the Notion API limit of 900 bytes
     */
    private constructHashedFileName;
    /**
     * Generate a unique filename with hash suffix to ensure uniqueness and comply with Notion API limits
     * According to Notion API docs, maximum filename length is 900 bytes
     * Always adds a hash suffix for consistency, regardless of original filename length
     */
    private generateUniqueFileName;
    /**
     * Step 1: Create a file upload in Notion using the client's request method
     */
    private createFileUpload;
    /**
     * Step 2: Send file content to the upload URL using FormData
     */
    private sendFileContent;
    /**
     * Step 3: Complete the file upload using the client's request method
     */
    private completeFileUpload;
    /**
     * Get MIME type based on file extension
     */
    private getMimeType;
    /**
     * Check if file extension is supported by Notion
     */
    isSupportedImageType(filePath: string): boolean;
}
