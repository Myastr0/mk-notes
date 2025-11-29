import * as path from 'path';
import { Logger } from 'winston';

import {
  CalloutElement,
  CodeElement,
  Element,
  ElementCodeLanguage,
  type ElementConverterRepository,
  ElementType,
  EquationElement,
  HtmlElement,
  ImageElement,
  LinkElement,
  ListItemElement,
  PageElement,
  PageElementProperties,
  PageElementPropertyValue,
  QuoteElement,
  RichTextElement,
  TableElement,
  TextElement,
  TextElementLevel,
  ToggleElement,
} from '@/domains/elements';
import { MK_NOTES_INTERNAL_ID_PROPERTY_NAME } from '@/domains/notion/constants';
import { NotionPage } from '@/domains/notion/NotionPage';

import {
  BlockObjectRequest,
  BlockObjectRequestWithoutChildren,
  BulletedListItemBlock,
  CalloutBlock,
  CheckboxProperty,
  CreatePageBodyParameters,
  DatabaseProperty,
  DatabasePropertyDefinition,
  DateProperty,
  EmailProperty,
  EquationBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  LanguageRequest,
  MultiSelectProperty,
  NumberedListItemBlock,
  NumberProperty,
  PageProperties,
  ParagraphBlock,
  PhoneNumberProperty,
  QuoteBlock,
  RichTextItemRequest,
  RichTextProperty,
  SelectProperty,
  StatusProperty,
  TableBlock,
  TableOfContentsBlock,
  TableRowBlock,
  TitleProperty,
  ToggleBlock,
  UrlProperty,
} from '../../domains/notion/types/types';
import { NotionFileUploadService } from './file-upload.service';

type PartialCreatePageBodyParameters = Pick<
  CreatePageBodyParameters,
  'properties' | 'children' | 'icon'
>;

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
export class NotionConverterRepository
  implements ElementConverterRepository<PageElement, NotionPage>
{
  private logger: Logger;
  private fileUploadService?: NotionFileUploadService;
  private currentFilePath?: string;
  private basePath?: string;

  constructor({
    logger,
    fileUploadService,
  }: {
    logger: Logger;
    fileUploadService?: NotionFileUploadService;
  }) {
    this.logger = logger;
    this.fileUploadService = fileUploadService;
  }

  setCurrentFilePath(filePath: string): void {
    this.currentFilePath = filePath;
  }

  setBasePath(basePath: string): void {
    this.basePath = basePath;
  }

  /**
   * Determine if an image URL is a local file path (relative or absolute local path)
   */
  private isLocalImagePath(url?: string): boolean {
    if (!url) return false;

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

  // ============================================
  // Property Conversion Functions
  // ============================================

  /**
   * Converts a string value to a Notion TitleProperty
   */
  private convertToTitleProperty(
    value: PageElementPropertyValue
  ): TitleProperty {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    return {
      id: 'title',
      type: 'title',
      title: [
        {
          type: 'text',
          text: {
            content: value,
            link: null,
          },
        },
      ],
    };
  }

  /**
   * Converts a string value to a Notion RichTextProperty
   */
  private convertToRichTextProperty(
    value: PageElementPropertyValue
  ): RichTextProperty {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    return {
      type: 'rich_text',
      rich_text: [
        {
          type: 'text',
          text: {
            content: value,
            link: null,
          },
        },
      ],
    };
  }

  /**
   * Converts a string value to a Notion NumberProperty
   * Returns null if the value cannot be parsed as a number
   */
  private convertToNumberProperty(
    value: PageElementPropertyValue
  ): NumberProperty | null {
    if (typeof value !== 'number') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    const parsed = value;

    if (isNaN(parsed)) {
      this.logger.warn(
        `Cannot convert "${value}" to number property, skipping`
      );
      return null;
    }
    return {
      type: 'number',
      number: parsed,
    };
  }

  /**
   * Converts a string value to a Notion UrlProperty
   */
  private convertToUrlProperty(value: PageElementPropertyValue): UrlProperty {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    return {
      type: 'url',
      url: value || null,
    };
  }

  /**
   * Converts a string value to a Notion SelectProperty
   * The value should match one of the available options in the database property definition
   */
  private convertToSelectProperty(
    value: PageElementPropertyValue,
    propertyDefinition: DatabasePropertyDefinition
  ): SelectProperty {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    // Type-narrow to access select options
    if (propertyDefinition.type === 'select') {
      const { options } = propertyDefinition.select;
      const matchingOption = options.find(
        (opt) => opt.name.toLowerCase() === value.toLowerCase()
      );

      if (matchingOption) {
        return {
          type: 'select',
          select: {
            id: matchingOption.id,
            name: matchingOption.name,
            color: matchingOption.color,
          },
        };
      }
    }

    // If no matching option found, create a new one with the provided value
    // Notion will create the option if it doesn't exist
    return {
      type: 'select',
      select: {
        id: '',
        name: value,
      },
    };
  }

  /**
   * Converts a string value to a Notion MultiSelectProperty
   * The value should be a comma-separated list of option names
   */
  private convertToMultiSelectProperty(
    value: PageElementPropertyValue,
    propertyDefinition: DatabasePropertyDefinition
  ): MultiSelectProperty {
    if (typeof value !== 'string' && !Array.isArray(value)) {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    const values = value instanceof Array ? value : [value];

    // Type-narrow to access multi_select options
    const options =
      propertyDefinition.type === 'multi_select'
        ? propertyDefinition.multi_select.options
        : [];

    const multiSelectOptions = values.map((val) => {
      const matchingOption = options.find(
        (opt) => opt.name.toLowerCase() === String(val).toLowerCase()
      );

      if (matchingOption) {
        return {
          id: matchingOption.id,
          name: matchingOption.name,
          color: matchingOption.color,
        };
      }

      // Create new option if not found
      return {
        id: '',
        name: String(val),
      };
    });

    return {
      type: 'multi_select',
      multi_select: multiSelectOptions,
    };
  }

  /**
   * Converts a string value to a Notion DateProperty
   * Supports ISO 8601 date strings (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
   */
  private convertToDateProperty(
    value: PageElementPropertyValue
  ): DateProperty | null {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    // Try to parse the date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.logger.warn(`Cannot convert "${value}" to date property, skipping`);
      return null;
    }

    // Format as ISO string (Notion expects ISO 8601 format)
    return {
      type: 'date',
      date: value, // Pass the original value if it's already in ISO format
    };
  }

  /**
   * Converts a string value to a Notion CheckboxProperty
   * Accepts: "true", "false", "yes", "no", "1", "0"
   */
  private convertToCheckboxProperty(
    value: PageElementPropertyValue
  ): CheckboxProperty {
    if (typeof value !== 'string' && typeof value !== 'boolean') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    if (typeof value === 'boolean') {
      return {
        type: 'checkbox',
        checkbox: value,
      };
    }

    const normalizedValue = value.toLowerCase().trim();
    const trueValues = ['true', 'yes', '1', 'on', 'checked'];
    const isChecked = trueValues.includes(normalizedValue);

    return {
      type: 'checkbox',
      checkbox: isChecked,
    };
  }

  /**
   * Converts a string value to a Notion EmailProperty
   */
  private convertToEmailProperty(
    value: PageElementPropertyValue
  ): EmailProperty {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    return {
      type: 'email',
      email: value || null,
    };
  }

  /**
   * Converts a string value to a Notion PhoneNumberProperty
   */
  private convertToPhoneNumberProperty(
    value: PageElementPropertyValue
  ): PhoneNumberProperty {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    return {
      type: 'phone_number',
      phone_number: value || null,
    };
  }

  /**
   * Converts a string value to a Notion StatusProperty
   * The value should match one of the available status options in the database property definition
   */
  private convertToStatusProperty(
    value: PageElementPropertyValue,
    propertyDefinition: DatabasePropertyDefinition
  ): StatusProperty {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value type: ${typeof value}`);
    }

    // Type-narrow to access status options
    if (propertyDefinition.type === 'status') {
      const { options } = propertyDefinition.status;
      const matchingOption = options.find(
        (opt) => opt.name.toLowerCase() === value.toLowerCase()
      );

      if (matchingOption) {
        return {
          type: 'status',
          status: {
            id: matchingOption.id,
            name: matchingOption.name,
            color: matchingOption.color,
          },
        };
      }
    }

    // If no matching option found, use the value as-is
    // Note: Notion may reject this if the status doesn't exist
    return {
      type: 'status',
      status: {
        id: '',
        name: value,
      },
    };
  }

  /**
   * Converts a PageElementProperty to the appropriate Notion property based on the database property definition
   */
  private convertPropertyValue(
    value: PageElementPropertyValue,
    propertyDefinition: DatabasePropertyDefinition
  ): PageProperties[string] | null {
    if (value instanceof Array) {
      if (propertyDefinition.type === 'multi_select') {
        return this.convertToMultiSelectProperty(value, propertyDefinition);
      }
      this.logger.warn(
        `Unsupported array value for property type "${propertyDefinition.type}"`
      );

      return null;
    }

    switch (propertyDefinition.type) {
      case 'title':
        return this.convertToTitleProperty(value);
      case 'rich_text':
        return this.convertToRichTextProperty(value);
      case 'number':
        return this.convertToNumberProperty(value);
      case 'url':
        return this.convertToUrlProperty(value);
      case 'select':
        return this.convertToSelectProperty(value, propertyDefinition);
      case 'multi_select':
        return this.convertToMultiSelectProperty(value, propertyDefinition);
      case 'date':
        return this.convertToDateProperty(value);
      case 'checkbox':
        return this.convertToCheckboxProperty(value);
      case 'email':
        return this.convertToEmailProperty(value);
      case 'phone_number':
        return this.convertToPhoneNumberProperty(value);
      case 'status':
        return this.convertToStatusProperty(value, propertyDefinition);
      case 'people':
      case 'files':
      case 'relation':
      case 'formula':
      case 'rollup':
      case 'created_time':
      case 'created_by':
      case 'last_edited_time':
      case 'last_edited_by':
      case 'unique_id':
        this.logger.warn(
          `Property type "${propertyDefinition.type}" cannot be converted from string, skipping property "${propertyDefinition.name}"`
        );
        return null;
    }
  }

  /**
   * Converts page element properties to Notion PageProperties based on database property definitions
   *
   * @param properties - Array of PageElementProperties from the markdown frontmatter
   * @param notionPropertyDefinitions - Array of database property definitions from Notion
   * @returns PageProperties object ready to be used in Notion API calls
   */
  private convertPageElementProperties(
    properties?: PageElementProperties[],
    notionProperties: DatabaseProperty[] = []
  ): PageProperties {
    const result: PageProperties = {};

    // Create a map of property definitions by name for quick lookup
    const definitionMap = new Map<string, DatabasePropertyDefinition>();
    for (const property of notionProperties) {
      definitionMap.set(property.name, property.definition);
    }

    // Convert each page element property
    for (const property of properties ?? []) {
      const definition = definitionMap.get(property.name);

      if (!definition) {
        this.logger.warn(
          `No matching Notion property definition found for "${property.name}", skipping`
        );
        continue;
      }

      const convertedValue = this.convertPropertyValue(
        property.value,
        definition
      );

      if (convertedValue !== null) {
        // Use the original definition name to preserve casing
        result[definition.name] = convertedValue;
      }
    }

    return result;
  }

  private async convertPageElement(
    element: PageElement,
    notionPropertyDefinitions: DatabaseProperty[] = []
  ): Promise<PartialCreatePageBodyParameters> {
    const title: TitleProperty = {
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

    const elementProperties = element.properties ?? [];

    if (element.mkNotesInternalId) {
      elementProperties.push({
        name: MK_NOTES_INTERNAL_ID_PROPERTY_NAME,
        value: element.mkNotesInternalId,
      });
    }

    // Convert page element properties to Notion properties
    const convertedProperties = this.convertPageElementProperties(
      elementProperties,
      notionPropertyDefinitions
    );

    const result: PartialCreatePageBodyParameters = {
      children: [],
      properties: {
        title,
        ...convertedProperties,
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

  private async convertElement(
    element: Element
  ): Promise<BlockObjectRequest | null> {
    switch (element.type) {
      case ElementType.Page:
        return null; // Pages should not be converted as child blocks
      case ElementType.Text:
        return this.convertText(element as TextElement);
      case ElementType.Quote:
        return this.convertQuote(element as QuoteElement);
      case ElementType.Callout:
        return this.convertCallout(element as CalloutElement);
      case ElementType.ListItem:
        return this.convertListItem(element as ListItemElement);
      case ElementType.Table:
        return this.convertTable(element as TableElement);
      case ElementType.Toggle:
        return await this.convertToggle(element as ToggleElement);
      case ElementType.Link:
        return this.convertLink(element as LinkElement);
      case ElementType.Divider:
        return this.convertDivider();
      case ElementType.Code:
        return this.convertCodeBlock(element as CodeElement);
      case ElementType.Image:
        return await this.convertImage(element as ImageElement);
      case ElementType.Html:
        return this.convertHtml(element as HtmlElement);
      case ElementType.TableOfContents:
        return this.convertTableOfContents();
      case ElementType.Equation:
        return this.convertEquation(element as EquationElement);
      default:
        this.logger.warn(`Unsupported element type: ${element.type}`);
        return null;
    }
  }
  async convertFromElement(
    element: PageElement,
    availableProperties: DatabaseProperty[] = []
  ): Promise<NotionPage> {
    const notionPageInput = await this.convertPageElement(
      element,
      availableProperties
    );
    return NotionPage.fromPartialCreatePageBodyParameters(notionPageInput);
  }

  private convertText(
    element: TextElement
  ): ParagraphBlock | Heading1Block | Heading2Block | Heading3Block {
    switch (element.level) {
      case TextElementLevel.Heading1:
        return {
          type: 'heading_1',
          object: 'block',
          heading_1: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
            is_toggleable: false, // Set based on your requirements
          },
        };

      case TextElementLevel.Heading2:
        return {
          type: 'heading_2',
          object: 'block',
          heading_2: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
            is_toggleable: false,
          },
        };

      case TextElementLevel.Heading3:
        return {
          type: 'heading_3',
          object: 'block',
          heading_3: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
            is_toggleable: false,
          },
        };

      case TextElementLevel.Paragraph:
        return {
          type: 'paragraph',
          object: 'block',
          paragraph: {
            rich_text: this.convertRichText(element.text),
            color: 'default',
          },
        };
      default:
        this.logger.warn(
          `Unsupported text level ${element.level} - using paragraph`
        );

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

  private convertQuote(element: QuoteElement): QuoteBlock {
    return {
      type: 'quote',
      object: 'block',
      quote: {
        rich_text: this.convertRichText(element.text),
      },
    };
  }

  private convertCallout(element: CalloutElement): CalloutBlock {
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

  private async convertListItem(
    element: ListItemElement
  ): Promise<BulletedListItemBlock | NumberedListItemBlock> {
    let item: BulletedListItemBlock | NumberedListItemBlock;
    if (element.listType === 'unordered') {
      item = await this.convertBulletedListItem(element);
    } else {
      item = await this.convertNumberedListItem(element);
    }

    return item;
  }

  private async convertBulletedListItem(
    element: ListItemElement
  ): Promise<BulletedListItemBlock> {
    return {
      type: 'bulleted_list_item',
      object: 'block',
      bulleted_list_item: {
        rich_text: this.convertRichText(element.text),
        children: await this.convertListItemChildren(element.children),
      },
    };
  }

  private async convertNumberedListItem(
    element: ListItemElement
  ): Promise<NumberedListItemBlock> {
    return {
      type: 'numbered_list_item',
      object: 'block',
      numbered_list_item: {
        rich_text: this.convertRichText(element.text),
        children: await this.convertListItemChildren(element.children),
      },
    };
  }

  private async convertListItemChildren(
    children: ListItemElement['children']
  ): Promise<BlockObjectRequestWithoutChildren[] | undefined> {
    const convertedChildren = (
      await Promise.all(
        children?.map(async (child) => this.convertElement(child)) ?? []
      )
    ).filter((child) => child !== null) as BlockObjectRequestWithoutChildren[];

    if (convertedChildren.length === 0) {
      return undefined;
    }

    return convertedChildren;
  }

  private convertTable(element: TableElement): TableBlock {
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

  private convertTableRow(row: string[]): TableRowBlock {
    return {
      type: 'table_row',
      object: 'block',
      table_row: {
        cells: row.map((cell) => this.convertRichText(cell)),
      },
    };
  }

  private async convertToggle(element: ToggleElement): Promise<ToggleBlock> {
    const children: BlockObjectRequestWithoutChildren[] = [];

    for (const contentElement of element.children) {
      const convertedElement = await this.convertElement(contentElement);
      if (convertedElement) {
        children.push(convertedElement as BlockObjectRequestWithoutChildren);
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

  private convertLink(element: LinkElement): BlockObjectRequest {
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

  private convertDivider(): BlockObjectRequest {
    return {
      type: 'divider',
      object: 'block',
      divider: {},
    };
  }

  private getNotionLanguageFromElementLanguage(
    language: ElementCodeLanguage
  ): LanguageRequest {
    const languageMap: Record<ElementCodeLanguage, LanguageRequest> = {
      [ElementCodeLanguage.JavaScript]: 'javascript',
      [ElementCodeLanguage.TypeScript]: 'typescript',
      [ElementCodeLanguage.Python]: 'python',
      [ElementCodeLanguage.Java]: 'java',
      [ElementCodeLanguage.CSharp]: 'c#',
      [ElementCodeLanguage.CPlusPlus]: 'c++',
      [ElementCodeLanguage.Go]: 'go',
      [ElementCodeLanguage.Ruby]: 'ruby',
      [ElementCodeLanguage.Swift]: 'swift',
      [ElementCodeLanguage.Kotlin]: 'kotlin',
      [ElementCodeLanguage.Rust]: 'rust',
      [ElementCodeLanguage.Scala]: 'scala',
      [ElementCodeLanguage.Shell]: 'bash', // Mapping to 'bash' as Notion supports bash/shell
      [ElementCodeLanguage.SQL]: 'sql',
      [ElementCodeLanguage.HTML]: 'html',
      [ElementCodeLanguage.CSS]: 'css',
      [ElementCodeLanguage.JSON]: 'json',
      [ElementCodeLanguage.YAML]: 'yaml',
      [ElementCodeLanguage.Markdown]: 'markdown',
      [ElementCodeLanguage.Mermaid]: 'mermaid',
      [ElementCodeLanguage.PlainText]: 'plain text', // Mapping to 'plain text' as Notion supports this
    };

    // Return the mapped Notion language, or 'plain text' as a fallback
    return languageMap[language] || 'plain text';
  }
  private convertCodeBlock(element: CodeElement): BlockObjectRequest {
    return {
      type: 'code',
      object: 'block',
      code: {
        rich_text: this.convertRichText(element.text),
        language: this.getNotionLanguageFromElementLanguage(element.language),
      },
    };
  }

  private async convertImage(
    element: ImageElement
  ): Promise<BlockObjectRequest> {
    // Check if it's a local image path
    if (this.isLocalImagePath(element.url)) {
      return this.convertLocalImage(element);
    } else {
      return this.convertExternalImage(element);
    }
  }

  /**
   * Convert local image using file upload service
   */
  private async convertLocalImage(
    element: ImageElement
  ): Promise<BlockObjectRequest> {
    if (!this.fileUploadService || !element.url) {
      this.logger.warn(
        'File upload service not available or no image URL provided, converting to paragraph'
      );
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
      let imageBasePath: string | undefined;

      if (element.filepath) {
        imageBasePath = path.dirname(element.filepath);
      } else if (this.currentFilePath) {
        imageBasePath = path.dirname(this.currentFilePath);
      } else {
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
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Notion file upload block structure not in types yet
      } as BlockObjectRequest;
    } catch (error) {
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
  private convertExternalImage(element: ImageElement): BlockObjectRequest {
    if (
      element.url &&
      !SUPPORTED_IMAGE_URL_EXTENSIONS.some((extension) =>
        element.url?.endsWith(extension)
      )
    ) {
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

  private convertHtml(element: HtmlElement): BlockObjectRequest {
    return {
      type: 'code',
      object: 'block',
      code: {
        language: 'html',
        rich_text: this.convertRichText(element.html),
      },
    };
  }

  private convertEquation(element: EquationElement): EquationBlock {
    return {
      type: 'equation',
      object: 'block',
      equation: { expression: element.equation },
    };
  }

  private convertRichText(
    content: undefined | string | RichTextElement
  ): RichTextItemRequest[] {
    if (content === undefined) {
      return [];
    }

    if (typeof content === 'string') {
      // Split string into chunks of 2000 characters
      const MAX_LENGTH = 2000;
      const chunks: string[] = [];
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
      return content.reduce<RichTextItemRequest[]>((acc, element) => {
        if (element.type === ElementType.Text) {
          acc.push({
            type: 'text',
            text: {
              content: (element as TextElement).text as string,
            },
            annotations: {
              bold: (element as TextElement).styles.bold,
              italic: (element as TextElement).styles.italic,
              strikethrough: (element as TextElement).styles.strikethrough,
              underline: (element as TextElement).styles.underline,
              code: (element as TextElement).styles.code,
            },
          });
        }

        if (element instanceof LinkElement) {
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

        if (element instanceof EquationElement) {
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

  private convertTableOfContents(): TableOfContentsBlock {
    return {
      type: 'table_of_contents',
      object: 'block',
      table_of_contents: {},
    };
  }

  public convertToElement(): PageElement {
    throw new Error('Method not implemented.');
  }
}
