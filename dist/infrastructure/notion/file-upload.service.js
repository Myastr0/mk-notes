"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionFileUploadService = void 0;
const client_1 = require("@notionhq/client");
const crypto = __importStar(require("crypto"));
const form_data_1 = __importDefault(require("form-data"));
const fs = __importStar(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const path = __importStar(require("path"));
class NotionFileUploadService {
    client;
    apiKey;
    logger;
    workspaceLimits = null;
    constructor({ apiKey, logger }) {
        this.client = new client_1.Client({ auth: apiKey });
        this.apiKey = apiKey;
        this.logger = logger;
    }
    /**
     * Get the workspace file upload limits by retrieving bot user information
     */
    async getWorkspaceFileLimits() {
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
            const user = response;
            if (user.type !== 'bot' || !user.bot || typeof user.bot !== 'object') {
                throw new Error('Expected bot user, but got different user type');
            }
            const bot = user.bot;
            if (!bot.workspace_limits || typeof bot.workspace_limits !== 'object') {
                throw new Error('No workspace_limits found in bot user response');
            }
            const workspaceLimits = bot.workspace_limits;
            const maxFileUploadSize = workspaceLimits.max_file_upload_size_in_bytes;
            if (typeof maxFileUploadSize !== 'number') {
                throw new Error('max_file_upload_size_in_bytes is not a number');
            }
            // Cache the limits
            this.workspaceLimits = {
                maxFileSize: maxFileUploadSize,
                detectedAt: new Date(),
            };
            this.logger.info(`Retrieved workspace file upload limit: ${maxFileUploadSize} bytes (${(maxFileUploadSize / (1024 * 1024)).toFixed(1)} MB)`);
            return this.workspaceLimits;
        }
        catch (error) {
            this.logger.error('Failed to retrieve workspace limits:', error);
            // Fallback to conservative 5MB limit for free workspaces
            const fallbackLimit = 5 * 1024 * 1024; // 5MB in bytes
            this.logger.warn(`Using fallback file size limit: ${fallbackLimit} bytes (5MB)`);
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
    isLocalFile(imagePath) {
        // Check if it's not a URL
        return (!imagePath.startsWith('http://') && !imagePath.startsWith('https://'));
    }
    /**
     * Resolve the absolute path of a file based on the markdown file location
     */
    resolveFilePath(imagePath, basePath) {
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
    async uploadFile({ filePath, basePath, }) {
        try {
            const resolvedPath = this.resolveFilePath(filePath, basePath);
            // Check if file exists
            if (!fs.existsSync(resolvedPath)) {
                throw new Error(`File not found: ${resolvedPath} (original path: ${filePath}, basePath: ${basePath})`);
            }
            const fileName = path.basename(resolvedPath);
            const fileStats = fs.statSync(resolvedPath);
            const fileSize = fileStats.size;
            // Get workspace-specific file size limits
            const workspaceLimits = await this.getWorkspaceFileLimits();
            if (fileSize > workspaceLimits.maxFileSize) {
                const maxSizeMB = (workspaceLimits.maxFileSize / (1024 * 1024)).toFixed(1);
                const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
                throw new Error(`File too large: ${fileName} (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB for this workspace.`);
            }
            this.logger.info(`Uploading file: ${fileName} (${fileSize} bytes)`);
            // Step 1: Create file upload
            const fileUpload = await this.createFileUpload(fileName, fileSize, resolvedPath);
            // Step 2: Send file content
            await this.sendFileContent(fileUpload.upload_url, resolvedPath);
            // No step 3 needed - file is ready to use after step 2
            this.logger.info(`Successfully uploaded file: ${fileName} with ID: ${fileUpload.id}`);
            return {
                id: fileUpload.id,
                type: 'file_upload',
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload file ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Generate a unique 8-character hash from filename and file path
     */
    generateFileHash(fileName, filePath) {
        const uniqueContent = filePath ? `${filePath}${fileName}` : fileName;
        return crypto
            .createHash('md5')
            .update(uniqueContent)
            .digest('hex')
            .substring(0, 8);
    }
    /**
     * Split filename into base name and extension
     */
    parseFileName(fileName) {
        const extension = path.extname(fileName);
        const baseName = path.basename(fileName, extension);
        return { baseName, extension };
    }
    /**
     * Truncate base name to fit within available space (accounting for extension + hash suffix)
     */
    truncateToFitAvailableSpace(baseName, availableSpace) {
        return baseName.length > availableSpace
            ? baseName.substring(0, availableSpace)
            : baseName;
    }
    /**
     * Construct filename with hash suffix, ensuring total filename length (including extension)
     * fits within the Notion API limit of 900 bytes
     */
    constructHashedFileName(baseName, extension, hash, maxLength) {
        const hashSuffix = `-${hash}`;
        const reservedLength = extension.length + hashSuffix.length;
        const availableSpaceForBaseName = maxLength - reservedLength;
        if (availableSpaceForBaseName <= 0) {
            // If even the hash + extension is too long, just return hash + extension
            return `${hash}${extension}`.substring(0, maxLength);
        }
        const truncatedBase = this.truncateToFitAvailableSpace(baseName, availableSpaceForBaseName);
        return `${truncatedBase}${hashSuffix}${extension}`;
    }
    /**
     * Generate a unique filename with hash suffix to ensure uniqueness and comply with Notion API limits
     * According to Notion API docs, maximum filename length is 900 bytes
     * Always adds a hash suffix for consistency, regardless of original filename length
     */
    generateUniqueFileName(fileName, filePath, maxLength = 900) {
        const { baseName, extension } = this.parseFileName(fileName);
        const hash = this.generateFileHash(fileName, filePath);
        return this.constructHashedFileName(baseName, extension, hash, maxLength);
    }
    /**
     * Step 1: Create a file upload in Notion using the client's request method
     */
    async createFileUpload(fileName, fileSize, filePath) {
        try {
            // Generate unique filename to avoid conflicts and comply with Notion API length limitations
            const uniqueFileName = this.generateUniqueFileName(fileName, filePath);
            const result = await this.client.request({
                path: 'file_uploads',
                method: 'post',
                body: {
                    filename: uniqueFileName,
                    file_size: fileSize,
                },
            });
            // Type-safe property access with type guards
            if (!result || typeof result !== 'object') {
                throw new Error('Invalid response from file upload API');
            }
            const resultObj = result;
            const uploadId = resultObj.id;
            const uploadUrl = resultObj.upload_url;
            if (typeof uploadId !== 'string' || typeof uploadUrl !== 'string') {
                throw new Error('Invalid response format from file upload API');
            }
            this.logger.info(`Created file upload - ID: ${uploadId}, Upload URL: ${uploadUrl}`);
            return {
                id: uploadId,
                upload_url: uploadUrl,
            };
        }
        catch (error) {
            this.logger.error(`Create file upload failed:`, error);
            throw error;
        }
    }
    /**
     * Step 2: Send file content to the upload URL using FormData
     */
    async sendFileContent(uploadUrl, filePath) {
        this.logger.info(`Sending file content to URL: ${uploadUrl}`);
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const uniqueFileName = this.generateUniqueFileName(fileName, filePath);
        const formData = new form_data_1.default();
        formData.append('file', fileBuffer, {
            filename: uniqueFileName,
            contentType: this.getMimeType(filePath),
        });
        const response = await (0, node_fetch_1.default)(uploadUrl, {
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
            throw new Error(`Send file content failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        this.logger.info(`Successfully sent file content for: ${fileName}`);
    }
    /**
     * Step 3: Complete the file upload using the client's request method
     */
    async completeFileUpload(fileUploadId) {
        try {
            await this.client.request({
                path: `file_uploads/${fileUploadId}/complete`,
                method: 'post',
                body: {},
            });
            this.logger.info(`Completed file upload: ${fileUploadId}`);
        }
        catch (error) {
            this.logger.error(`Complete file upload failed:`, error);
            throw error;
        }
    }
    /**
     * Get MIME type based on file extension
     */
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
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
    isSupportedImageType(filePath) {
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
exports.NotionFileUploadService = NotionFileUploadService;
