import { Client } from '@notionhq/client';
import FormData from 'form-data';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import { Logger } from 'winston';

export interface FileUploadResult {
  id: string;
  type: 'file_upload';
}

interface FileUploadResponse {
  id: string;
  upload_url: string;
}

export interface FileUploadOptions {
  filePath: string;
  basePath?: string;
}

export interface WorkspaceFileLimits {
  maxFileSize: number;
  detectedAt: Date;
}

export class NotionFileUploadService {
  private client: Client;
  private apiKey: string;
  private logger: Logger;
  private workspaceLimits: WorkspaceFileLimits | null = null;

  constructor({ apiKey, logger }: { apiKey: string; logger: Logger }) {
    this.client = new Client({ auth: apiKey });
    this.apiKey = apiKey;
    this.logger = logger;
  }

  /**
   * Get the workspace file upload limits by retrieving bot user information
   */
  async getWorkspaceFileLimits(): Promise<WorkspaceFileLimits> {
    // Return cached limits if they exist and are recent (within 1 hour)
    if (this.workspaceLimits) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (this.workspaceLimits.detectedAt > oneHourAgo) {
        return this.workspaceLimits;
      }
    }

    try {
      // Retrieve bot user information to get workspace limits
      const response = await this.client.users.me({});

      // Type-safe property access with type guards
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from users.me() API');
      }

      const user = response as Record<string, unknown>;

      if (user.type !== 'bot' || !user.bot || typeof user.bot !== 'object') {
        throw new Error('Expected bot user, but got different user type');
      }

      const bot = user.bot as Record<string, unknown>;

      if (!bot.workspace_limits || typeof bot.workspace_limits !== 'object') {
        throw new Error('No workspace_limits found in bot user response');
      }

      const workspaceLimits = bot.workspace_limits as Record<string, unknown>;
      const maxFileUploadSize = workspaceLimits.max_file_upload_size_in_bytes;

      if (typeof maxFileUploadSize !== 'number') {
        throw new Error('max_file_upload_size_in_bytes is not a number');
      }

      // Cache the limits
      this.workspaceLimits = {
        maxFileSize: maxFileUploadSize,
        detectedAt: new Date(),
      };

      this.logger.info(
        `Retrieved workspace file upload limit: ${maxFileUploadSize} bytes (${(maxFileUploadSize / (1024 * 1024)).toFixed(1)} MB)`
      );

      return this.workspaceLimits;
    } catch (error) {
      this.logger.error('Failed to retrieve workspace limits:', error);

      // Fallback to conservative 5MB limit for free workspaces
      const fallbackLimit = 5 * 1024 * 1024; // 5MB in bytes
      this.logger.warn(
        `Using fallback file size limit: ${fallbackLimit} bytes (5MB)`
      );

      const fallbackLimits = {
        maxFileSize: fallbackLimit,
        detectedAt: new Date(),
      };

      this.workspaceLimits = fallbackLimits;
      return fallbackLimits;
    }
  }

  /**
   * Check if a path is a local file (not a URL)
   */
  isLocalFile(imagePath: string): boolean {
    // Check if it's not a URL
    return (
      !imagePath.startsWith('http://') && !imagePath.startsWith('https://')
    );
  }

  /**
   * Resolve the absolute path of a file based on the markdown file location
   */
  resolveFilePath(imagePath: string, basePath?: string): string {
    if (path.isAbsolute(imagePath)) {
      return imagePath;
    }

    // If basePath is provided, resolve relative to it
    if (basePath) {
      return path.resolve(basePath, imagePath);
    }

    // Otherwise resolve relative to current working directory
    return path.resolve(imagePath);
  }

  /**
   * Upload a file to Notion using the File Upload API workflow
   */
  async uploadFile({
    filePath,
    basePath,
  }: FileUploadOptions): Promise<FileUploadResult> {
    try {
      const resolvedPath = this.resolveFilePath(filePath, basePath);

      // Check if file exists
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(
          `File not found: ${resolvedPath} (original path: ${filePath}, basePath: ${basePath})`
        );
      }

      const fileName = path.basename(resolvedPath);
      const fileStats = fs.statSync(resolvedPath);
      const fileSize = fileStats.size;

      // Get workspace-specific file size limits
      const workspaceLimits = await this.getWorkspaceFileLimits();
      if (fileSize > workspaceLimits.maxFileSize) {
        const maxSizeMB = (workspaceLimits.maxFileSize / (1024 * 1024)).toFixed(
          1
        );
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
        throw new Error(
          `File too large: ${fileName} (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB for this workspace.`
        );
      }

      this.logger.info(`Uploading file: ${fileName} (${fileSize} bytes)`);

      // Step 1: Create file upload
      const fileUpload = await this.createFileUpload(fileName, fileSize);

      // Step 2: Send file content
      await this.sendFileContent(fileUpload.upload_url, resolvedPath);

      // No step 3 needed - file is ready to use after step 2

      this.logger.info(
        `Successfully uploaded file: ${fileName} with ID: ${fileUpload.id}`
      );

      return {
        id: fileUpload.id,
        type: 'file_upload',
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Step 1: Create a file upload in Notion using the client's request method
   */
  private async createFileUpload(
    fileName: string,
    fileSize: number
  ): Promise<FileUploadResponse> {
    try {
      const result = await this.client.request({
        path: 'file_uploads',
        method: 'post',
        body: {
          filename: fileName,
          file_size: fileSize,
        },
      });

      // Type-safe property access with type guards
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from file upload API');
      }

      const resultObj = result as Record<string, unknown>;
      const uploadId = resultObj.id;
      const uploadUrl = resultObj.upload_url;

      if (typeof uploadId !== 'string' || typeof uploadUrl !== 'string') {
        throw new Error('Invalid response format from file upload API');
      }

      this.logger.info(
        `Created file upload - ID: ${uploadId}, Upload URL: ${uploadUrl}`
      );
      return {
        id: uploadId,
        upload_url: uploadUrl,
      };
    } catch (error) {
      this.logger.error(`Create file upload failed:`, error);
      throw error;
    }
  }

  /**
   * Step 2: Send file content to the upload URL using FormData
   */
  private async sendFileContent(
    uploadUrl: string,
    filePath: string
  ): Promise<void> {
    this.logger.info(`Sending file content to URL: ${uploadUrl}`);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: this.getMimeType(filePath),
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Notion-Version': '2022-06-28',
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Send file content failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    this.logger.info(`Successfully sent file content for: ${fileName}`);
  }

  /**
   * Step 3: Complete the file upload using the client's request method
   */
  private async completeFileUpload(fileUploadId: string): Promise<void> {
    try {
      await this.client.request({
        path: `file_uploads/${fileUploadId}/complete`,
        method: 'post',
        body: {},
      });
      this.logger.info(`Completed file upload: ${fileUploadId}`);
    } catch (error) {
      this.logger.error(`Complete file upload failed:`, error);
      throw error;
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',
      '.heic': 'image/heic',
      '.webp': 'image/webp',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Check if file extension is supported by Notion
   */
  isSupportedImageType(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const supportedExtensions = [
      '.bmp',
      '.gif',
      '.heic',
      '.jpeg',
      '.jpg',
      '.png',
      '.svg',
      '.tif',
      '.tiff',
      '.webp',
    ];
    return supportedExtensions.includes(ext);
  }
}
