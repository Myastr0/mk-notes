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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionConverterRepository = void 0;
const path = __importStar(require("path"));
const elements_1 = require("../../domains/elements");
const NotionPage_1 = require("../../domains/notion/NotionPage");
const SUPPORTED_IMAGE_URL_EXTENSIONS = [
    '.bmp',
    '.gif',
    '.heic',
    '.jpeg',
    '.jpg',
    '.png',
    '.svg',
    '.tif',
    '.tiff',
];
class NotionConverterRepository {
    logger;
    fileUploadService;
    currentFilePath;
    basePath;
    constructor({ logger, fileUploadService, }) {
        this.logger = logger;
        this.fileUploadService = fileUploadService;
    }
    setCurrentFilePath(filePath) {
        this.currentFilePath = filePath;
    }
    setBasePath(basePath) {
        this.basePath = basePath;
    }
    /**
     * Determine if an image URL is a local file path (relative or absolute local path)
     */
    isLocalImagePath(url) {
        if (!url)
            return false;
        // External URLs (http/https)
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return false;
        }
        // Data URLs
        if (url.startsWith('data:')) {
            return false;
        }
        // Relative paths or absolute local paths
        return true;
    }
    async convertPageElement(element) {
        const title = {
            id: 'title',
            type: 'title',
            title: [
                {
                    type: 'text',
                    text: {
                        content: element.title,
                        link: null,
                    },
                },
            ],
        };
        const result = {
            children: [],
            properties: {
                title,
            },
        };
        for (const contentElement of element.content) {
            const convertedElement = await this.convertElement(contentElement);
            if (convertedElement) {
                result.children?.push(convertedElement);
            }
        }
        const icon = element.getIcon();
        if (icon) {
            result.icon = { type: 'emoji', emoji: icon };
        }
        return result;
    }
    async convertElement(element) {
        switch (element.type) {
            case elements_1.ElementType.Page:
                return null; // Pages should not be converted as child blocks
            case elements_1.ElementType.Text:
                return this.convertText(element);
            case elements_1.ElementType.Quote:
                return this.convertQuote(element);
            case elements_1.ElementType.Callout:
                return this.convertCallout(element);
            case elements_1.ElementType.ListItem:
                return this.convertListItem(element);
            case elements_1.ElementType.Table:
                return this.convertTable(element);
            case elements_1.ElementType.Toggle:
                return await this.convertToggle(element);
            case elements_1.ElementType.Link:
                return this.convertLink(element);
            case elements_1.ElementType.Divider:
                return this.convertDivider();
            case elements_1.ElementType.Code:
                return this.convertCodeBlock(element);
            case elements_1.ElementType.Image:
                return await this.convertImage(element);
            case elements_1.ElementType.Html:
                return this.convertHtml(element);
            case elements_1.ElementType.TableOfContents:
                return this.convertTableOfContents();
            case elements_1.ElementType.Equation:
                return this.convertEquation(element);
            default:
                this.logger.warn(`Unsupported element type: ${element.type}`);
                return null;
        }
    }
    async convertFromElement(element) {
        const notionPageInput = await this.convertPageElement(element);
        return NotionPage_1.NotionPage.fromPartialCreatePageBodyParameters(notionPageInput);
    }
    convertText(element) {
        switch (element.level) {
            case elements_1.TextElementLevel.Heading1:
                return {
                    type: 'heading_1',
                    object: 'block',
                    heading_1: {
                        rich_text: this.convertRichText(element.text),
                        color: 'default',
                        is_toggleable: false, // Set based on your requirements
                    },
                };
            case elements_1.TextElementLevel.Heading2:
                return {
                    type: 'heading_2',
                    object: 'block',
                    heading_2: {
                        rich_text: this.convertRichText(element.text),
                        color: 'default',
                        is_toggleable: false,
                    },
                };
            case elements_1.TextElementLevel.Heading3:
                return {
                    type: 'heading_3',
                    object: 'block',
                    heading_3: {
                        rich_text: this.convertRichText(element.text),
                        color: 'default',
                        is_toggleable: false,
                    },
                };
            case elements_1.TextElementLevel.Paragraph:
                return {
                    type: 'paragraph',
                    object: 'block',
                    paragraph: {
                        rich_text: this.convertRichText(element.text),
                        color: 'default',
                    },
                };
            default:
                this.logger.warn(`Unsupported text level ${element.level} - using paragraph`);
                return {
                    type: 'paragraph',
                    object: 'block',
                    paragraph: {
                        rich_text: this.convertRichText(element.text),
                        color: 'default',
                    },
                };
        }
    }
    convertQuote(element) {
        return {
            type: 'quote',
            object: 'block',
            quote: {
                rich_text: this.convertRichText(element.text),
            },
        };
    }
    convertCallout(element) {
        const icon = element.getIcon();
        const calloutParams = {
            rich_text: this.convertRichText(element.text),
            icon: undefined,
        };
        if (icon) {
            // @ts-expect-error - Notion API types are incorrect
            calloutParams.icon = { type: 'emoji', emoji: icon };
        }
        return {
            type: 'callout',
            object: 'block',
            callout: calloutParams,
        };
    }
    convertListItem(element) {
        if (element.listType === 'unordered') {
            return this.convertBulletedListItem(element);
        }
        else {
            return this.convertNumberedListItem(element);
        }
    }
    convertBulletedListItem(element) {
        return {
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: this.convertRichText(element.text),
            },
        };
    }
    convertNumberedListItem(element) {
        return {
            type: 'numbered_list_item',
            object: 'block',
            numbered_list_item: {
                rich_text: this.convertRichText(element.text),
            },
        };
    }
    convertTable(element) {
        return {
            type: 'table',
            object: 'block',
            table: {
                table_width: element.rows[0]?.length || 0,
                has_column_header: false, // Customize as needed
                has_row_header: false, // Customize as needed
                children: element.rows.map((row) => this.convertTableRow(row)),
            },
        };
    }
    convertTableRow(row) {
        return {
            type: 'table_row',
            object: 'block',
            table_row: {
                cells: row.map((cell) => this.convertRichText(cell)),
            },
        };
    }
    async convertToggle(element) {
        const children = [];
        for (const contentElement of element.content) {
            const convertedElement = await this.convertElement(contentElement);
            if (convertedElement) {
                children.push(convertedElement);
            }
        }
        return {
            type: 'toggle',
            object: 'block',
            toggle: {
                rich_text: this.convertRichText(element.title),
                children,
            },
        };
    }
    convertLink(element) {
        return {
            type: 'paragraph',
            object: 'block',
            paragraph: {
                rich_text: [
                    {
                        text: {
                            content: element.text,
                            link: element.url.startsWith('http')
                                ? { url: element.url }
                                : null,
                        },
                    },
                ],
                color: 'default',
            },
        };
    }
    convertDivider() {
        return {
            type: 'divider',
            object: 'block',
            divider: {},
        };
    }
    getNotionLanguageFromElementLanguage(language) {
        const languageMap = {
            [elements_1.ElementCodeLanguage.JavaScript]: 'javascript',
            [elements_1.ElementCodeLanguage.TypeScript]: 'typescript',
            [elements_1.ElementCodeLanguage.Python]: 'python',
            [elements_1.ElementCodeLanguage.Java]: 'java',
            [elements_1.ElementCodeLanguage.CSharp]: 'c#',
            [elements_1.ElementCodeLanguage.CPlusPlus]: 'c++',
            [elements_1.ElementCodeLanguage.Go]: 'go',
            [elements_1.ElementCodeLanguage.Ruby]: 'ruby',
            [elements_1.ElementCodeLanguage.Swift]: 'swift',
            [elements_1.ElementCodeLanguage.Kotlin]: 'kotlin',
            [elements_1.ElementCodeLanguage.Rust]: 'rust',
            [elements_1.ElementCodeLanguage.Shell]: 'bash', // Mapping to 'bash' as Notion supports bash/shell
            [elements_1.ElementCodeLanguage.SQL]: 'sql',
            [elements_1.ElementCodeLanguage.HTML]: 'html',
            [elements_1.ElementCodeLanguage.CSS]: 'css',
            [elements_1.ElementCodeLanguage.JSON]: 'json',
            [elements_1.ElementCodeLanguage.YAML]: 'yaml',
            [elements_1.ElementCodeLanguage.Markdown]: 'markdown',
            [elements_1.ElementCodeLanguage.PlainText]: 'plain text', // Mapping to 'plain text' as Notion supports this
        };
        // Return the mapped Notion language, or 'plain text' as a fallback
        return languageMap[language] || 'plain text';
    }
    convertCodeBlock(element) {
        return {
            type: 'code',
            object: 'block',
            code: {
                rich_text: this.convertRichText(element.text),
                language: this.getNotionLanguageFromElementLanguage(element.language),
            },
        };
    }
    async convertImage(element) {
        // Check if it's a local image path
        if (this.isLocalImagePath(element.url)) {
            return this.convertLocalImage(element);
        }
        else {
            return this.convertExternalImage(element);
        }
    }
    /**
     * Convert local image using file upload service
     */
    async convertLocalImage(element) {
        if (!this.fileUploadService || !element.url) {
            this.logger.warn('File upload service not available or no image URL provided, converting to paragraph');
            return {
                type: 'paragraph',
                object: 'block',
                paragraph: {
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: `[Image: ${element.caption || element.url || 'unknown'}]`,
                            },
                        },
                    ],
                    color: 'default',
                },
            };
        }
        try {
            // Determine the base path for resolving relative image paths
            // Prefer the filepath from the ImageElement, fallback to currentFilePath, then basePath
            let imageBasePath;
            if (element.filepath) {
                imageBasePath = path.dirname(element.filepath);
            }
            else if (this.currentFilePath) {
                imageBasePath = path.dirname(this.currentFilePath);
            }
            else {
                imageBasePath = this.basePath;
            }
            this.logger.info(`Uploading local image: ${element.url}`);
            const uploadResult = await this.fileUploadService.uploadFile({
                filePath: element.url,
                basePath: imageBasePath,
            });
            return {
                type: 'image',
                object: 'block',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                image: {
                    type: 'file_upload',
                    file_upload: {
                        id: uploadResult.id,
                    },
                    caption: element.caption
                        ? [{ type: 'text', text: { content: element.caption } }]
                        : [],
                }, // eslint-disable-line @typescript-eslint/no-explicit-any -- Notion file upload block structure not in types yet
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload local image ${element.url}:`, error);
            // Fallback to paragraph with image reference
            return {
                type: 'paragraph',
                object: 'block',
                paragraph: {
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: `[Failed to upload image: ${element.caption || element.url}]`,
                            },
                        },
                    ],
                    color: 'default',
                },
            };
        }
    }
    /**
     * Convert external image using external URL (original behavior)
     */
    convertExternalImage(element) {
        if (element.url &&
            !SUPPORTED_IMAGE_URL_EXTENSIONS.some((extension) => element.url?.endsWith(extension))) {
            this.logger.warn(`Unsupported image URL extension: ${element.url}`);
            return {
                type: 'paragraph',
                object: 'block',
                paragraph: {
                    rich_text: [],
                    color: 'default',
                },
            };
        }
        return {
            type: 'image',
            object: 'block',
            image: {
                type: 'external',
                external: {
                    url: element.url || '',
                },
            },
        };
    }
    convertHtml(element) {
        return {
            type: 'code',
            object: 'block',
            code: {
                language: 'html',
                rich_text: this.convertRichText(element.html),
            },
        };
    }
    convertEquation(element) {
        return {
            type: 'equation',
            object: 'block',
            equation: { expression: element.equation },
        };
    }
    convertRichText(content) {
        if (content === undefined) {
            return [];
        }
        if (typeof content === 'string') {
            // Split string into chunks of 2000 characters
            const MAX_LENGTH = 2000;
            const chunks = [];
            for (let i = 0; i < content.length; i += MAX_LENGTH) {
                chunks.push(content.slice(i, i + MAX_LENGTH));
            }
            return chunks.map((chunk) => ({
                type: 'text',
                text: {
                    content: chunk,
                },
            }));
        }
        if (Array.isArray(content)) {
            return content.reduce((acc, element) => {
                if (element.type === elements_1.ElementType.Text) {
                    acc.push({
                        type: 'text',
                        text: {
                            content: element.text,
                        },
                        annotations: {
                            bold: element.styles.bold,
                            italic: element.styles.italic,
                            strikethrough: element.styles.strikethrough,
                            underline: element.styles.underline,
                            code: element.styles.code,
                        },
                    });
                }
                if (element instanceof elements_1.LinkElement) {
                    acc.push({
                        type: 'text',
                        text: {
                            content: element.text,
                            link: element.url.startsWith('http')
                                ? { url: element.url }
                                : null,
                        },
                    });
                }
                if (element instanceof elements_1.EquationElement) {
                    acc.push({
                        type: 'equation',
                        equation: {
                            expression: element.equation,
                        },
                        annotations: {
                            bold: element.styles.bold,
                            italic: element.styles.italic,
                            strikethrough: element.styles.strikethrough,
                            underline: element.styles.underline,
                            code: element.styles.code,
                        },
                    });
                }
                this.logger.warn(`Unsupported element type: ${element.type}`);
                return acc;
            }, []);
        }
        throw new Error(`Unsupported content type: ${typeof content}`);
    }
    convertTableOfContents() {
        return {
            type: 'table_of_contents',
            object: 'block',
            table_of_contents: {},
        };
    }
    convertToElement() {
        throw new Error('Method not implemented.');
    }
}
exports.NotionConverterRepository = NotionConverterRepository;
