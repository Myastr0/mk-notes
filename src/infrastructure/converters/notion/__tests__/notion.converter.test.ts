import { NotionConverterRepository } from '../notion.converter';
import {
  CalloutElement,
  CodeElement,
  ElementCodeLanguage,
  ElementType,
  EquationElement,
  LinkElement,
  ListItemElement,
  PageElement,
  QuoteElement,
  TableElement,
  TextElement,
  TextElementLevel,
  ToggleElement,
} from '@/domains/elements';
import { DatabaseProperty, DatabasePropertyDefinition } from '@/domains/notion/types/types';

import winston from 'winston';

describe('NotionConverterRepository', () => {
  let converter: NotionConverterRepository;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as unknown as winston.Logger;

    converter = new NotionConverterRepository({ logger: mockLogger });
  });

  describe('convertFromElement', () => {
    it('should convert a basic page element', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
      });

      const result = await converter.convertFromElement(pageElement);

      expect(result.toCreatePageBodyParameters()).toMatchObject({
        properties: {
          title: {
            title: [{
              text: { content: 'Test Page' }
            }]
          }
        },
        children: []
      });
    });

    it('should convert a page with icon', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        icon: '👋'
      });

      const result = await converter.convertFromElement(pageElement);

      expect(result.toCreatePageBodyParameters()).toMatchObject({
        icon: { type: 'emoji', emoji: '👋' }
      });
    });

    it('should convert text elements with different levels', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new TextElement({ text: 'Heading 1', level: TextElementLevel.Heading1 }),
          new TextElement({ text: 'Paragraph', level: TextElementLevel.Paragraph })
        ]
      });

      const result = await converter.convertFromElement(pageElement);

      const children = result.children;
      expect(result.children).toHaveLength(2);
      expect(children[0]).toMatchObject({
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: 'Heading 1' } }]
        }
      });
      expect(children[1]).toMatchObject({
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: 'Paragraph' } }]
        }
      });
    });

    it('should convert list items', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new ListItemElement({ text: [new TextElement({ text: 'Bullet item' })], listType: 'unordered' }),
          new ListItemElement({ text: [new TextElement({ text: 'hello'})], listType: 'ordered' })
        ]
      });

      const result = await converter.convertFromElement(pageElement);
      const children = result.children;

      expect(children).toHaveLength(2);
      expect(children[0]).toMatchObject({
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: 'Bullet item' } }]
        }
      });
      expect(children[1]).toMatchObject({
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [{ text: { content: 'hello' } }]
        }
      });
    });

    it('should convert code blocks with language', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new CodeElement({
            text: 'const x = 1;',
            language: ElementCodeLanguage.TypeScript
          })
        ]
      });

      const result = await converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'code',
        code: {
          rich_text: [{ text: { content: 'const x = 1;' } }],
          language: 'typescript'
        }
      });
    });

    it('should convert mermaid code blocks to notion mermaid', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new CodeElement({
            text: 'graph TD;\n  A-->B;',
            language: ElementCodeLanguage.Mermaid
          })
        ]
      });

      const result = await converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'code',
        code: {
          rich_text: [{ text: { content: 'graph TD;\n  A-->B;' } }],
          language: 'mermaid'
        }
      });
    });

    it('should convert tables', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new TableElement({
            rows: [
              ['Header 1', 'Header 2'],
              ['Cell 1', 'Cell 2']
            ]
          })
        ]
      });

      const result = await converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'table',
        table: {
          table_width: 2,
          children: [
            {
              type: 'table_row',
              table_row: {
                cells: [
                  [{ text: { content: 'Header 1' } }],
                  [{ text: { content: 'Header 2' } }]
                ]
              }
            },
            {
              type: 'table_row',
              table_row: {
                cells: [
                  [{ text: { content: 'Cell 1' } }],
                  [{ text: { content: 'Cell 2' } }]
                ]
              }
            }
          ]
        }
      });
    });

    it('should convert callouts with icons', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new CalloutElement({
            text: 'Note content',
            icon: '💡'
          })
        ]
      });

      const result = await converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'callout',
        callout: {
          rich_text: [{ text: { content: 'Note content' } }],
          icon: { type: 'emoji', emoji: '💡' }
        }
      });
    });

    it('should convert toggle blocks', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new ToggleElement({
            title: 'Toggle title',
            children: [
              new TextElement({ text: 'Toggle content', level: TextElementLevel.Paragraph })
            ]
          })
        ]
      });

      const result = await converter.convertFromElement(pageElement);

      const children = result.children;
      expect(children[0]).toMatchObject({
        type: 'toggle',
        toggle: {
          rich_text: [{ text: { content: 'Toggle title' } }],
          children: [{
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: 'Toggle content' } }]
            }
          }]
        }
      });
    });

    it('should convert equation elements', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new EquationElement({
            equation: 'a^2 + b^2 = c^2',
          }),
        ],
      });

      const result = await converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children).toHaveLength(1);
      expect(children[0]).toMatchObject({
        type: 'equation',
        equation: {
          expression: 'a^2 + b^2 = c^2',
        },
      });
    });

    it('should convert rich text with inline equations', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          new TextElement({
            text: [
              new TextElement({ text: 'The equation is ' }),
              new EquationElement({ equation: 'E=mc^2' }),
            ],
            level: TextElementLevel.Paragraph,
          }),
        ],
      });

      const result = await converter.convertFromElement(pageElement);
      const children = result.children;
      expect(children).toHaveLength(1);
      expect(children[0]).toMatchObject({
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { text: { content: 'The equation is ' } },
            {
              type: 'equation',
              equation: {
                expression: 'E=mc^2',
              },
            },
          ],
        },
      });
    });

    it('should handle unsupported element types', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [
          { type: 'unsupported' as ElementType } as any
        ]
      });

      const result = await converter.convertFromElement(pageElement);
      
      // Unsupported elements should be filtered out (return null)
      expect(result.children).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Unsupported element type: unsupported'
      );
    });
  });

  describe('convertFromElement with database properties', () => {
    const createSelectPropertyDefinition = (
      name: string,
      options: Array<{ id: string; name: string; color?: string }>
    ): DatabaseProperty => ({
      name,
      type: 'select',
      definition: {
        type: 'select',
        select: {
          options: options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            color: opt.color || 'default',
          })),
        },
      } as DatabasePropertyDefinition,
    });

    const createMultiSelectPropertyDefinition = (
      name: string,
      options: Array<{ id: string; name: string; color?: string }>
    ): DatabaseProperty => ({
      name,
      type: 'multi_select',
      definition: {
        type: 'multi_select',
        multi_select: {
          options: options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            color: opt.color || 'default',
          })),
        },
      } as DatabasePropertyDefinition,
    });

    const createStatusPropertyDefinition = (
      name: string,
      options: Array<{ id: string; name: string; color?: string }>
    ): DatabaseProperty => ({
      name,
      type: 'status',
      definition: {
        type: 'status',
        status: {
          options: options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            color: opt.color || 'default',
          })),
        },
      } as DatabasePropertyDefinition,
    });

    const createRichTextPropertyDefinition = (name: string): DatabaseProperty => ({
      name,
      type: 'rich_text',
      definition: {
        type: 'rich_text',
        rich_text: {},
      } as DatabasePropertyDefinition,
    });

    it('should skip empty string values for select properties', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Team', value: '' },
          { name: 'Category', value: 'Published' },
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createSelectPropertyDefinition('Team', [
          { id: 'opt-1', name: 'Engineering' },
          { id: 'opt-2', name: 'Design' },
        ]),
        createSelectPropertyDefinition('Category', [
          { id: 'opt-3', name: 'Published' },
          { id: 'opt-4', name: 'Draft' },
        ]),
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      // Empty string property should be skipped
      expect(properties).not.toHaveProperty('Team');
      // Valid property should be included
      expect(properties).toHaveProperty('Category');
      expect(properties.Category).toMatchObject({
        type: 'select',
        select: {
          id: 'opt-3',
          name: 'Published',
        },
      });

      // Empty strings are filtered out early, so no warning should be logged
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should skip invalid select option values', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Status', value: 'InvalidOption' },
          { name: 'Priority', value: 'High' },
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createSelectPropertyDefinition('Status', [
          { id: 'opt-1', name: 'Active' },
          { id: 'opt-2', name: 'Inactive' },
        ]),
        createSelectPropertyDefinition('Priority', [
          { id: 'opt-3', name: 'High' },
          { id: 'opt-4', name: 'Low' },
        ]),
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      // Invalid option should be skipped
      expect(properties).not.toHaveProperty('Status');
      // Valid property should be included
      expect(properties).toHaveProperty('Priority');
      expect(properties.Priority).toMatchObject({
        type: 'select',
        select: {
          id: 'opt-3',
          name: 'High',
        },
      });

      // Should log a warning for invalid option
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No matching select option found for "InvalidOption"')
      );
    });

    it('should filter out invalid multi-select options', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Tags', value: 'ValidTag1, InvalidTag, ValidTag2' },
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createMultiSelectPropertyDefinition('Tags', [
          { id: 'tag-1', name: 'ValidTag1' },
          { id: 'tag-2', name: 'ValidTag2' },
          { id: 'tag-3', name: 'ValidTag3' },
        ]),
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      expect(properties).toHaveProperty('Tags');
      expect(properties.Tags).toMatchObject({
        type: 'multi_select',
        multi_select: [
          { id: 'tag-1', name: 'ValidTag1' },
          { id: 'tag-2', name: 'ValidTag2' },
        ],
      });

      // Should log a warning for invalid option
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No matching multi-select option found for "InvalidTag"')
      );
    });

    it('should skip multi-select property when all values are empty or invalid', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Labels', value: '' },
          { name: 'Tags', value: 'InvalidTag1, InvalidTag2' },
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createMultiSelectPropertyDefinition('Labels', [
          { id: 'label-1', name: 'Label1' },
        ]),
        createMultiSelectPropertyDefinition('Tags', [
          { id: 'tag-1', name: 'ValidTag' },
        ]),
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      // Empty string should be skipped
      expect(properties).not.toHaveProperty('Labels');
      // All invalid options should result in property being skipped
      expect(properties).not.toHaveProperty('Tags');
    });

    it('should skip invalid status option values', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Status', value: 'InvalidStatus' },
          { name: 'Workflow', value: 'In Progress' },
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createStatusPropertyDefinition('Status', [
          { id: 'status-1', name: 'Todo' },
          { id: 'status-2', name: 'Done' },
        ]),
        createStatusPropertyDefinition('Workflow', [
          { id: 'wf-1', name: 'In Progress' },
          { id: 'wf-2', name: 'Completed' },
        ]),
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      // Invalid status should be skipped
      expect(properties).not.toHaveProperty('Status');
      // Valid status should be included
      expect(properties).toHaveProperty('Workflow');
      expect(properties.Workflow).toMatchObject({
        type: 'status',
        status: {
          id: 'wf-1',
          name: 'In Progress',
        },
      });

      // Should log a warning for invalid status
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No matching status option found for "InvalidStatus"')
      );
    });

    it('should handle valid select, multi-select, and status properties', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Category', value: 'Published' },
          { name: 'Tags', value: 'Tag1, Tag2' },
          { name: 'Status', value: 'Active' },
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createSelectPropertyDefinition('Category', [
          { id: 'cat-1', name: 'Published' },
        ]),
        createMultiSelectPropertyDefinition('Tags', [
          { id: 'tag-1', name: 'Tag1' },
          { id: 'tag-2', name: 'Tag2' },
        ]),
        createStatusPropertyDefinition('Status', [
          { id: 'status-1', name: 'Active' },
        ]),
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      expect(properties.Category).toMatchObject({
        type: 'select',
        select: { id: 'cat-1', name: 'Published' },
      });

      expect(properties.Tags).toMatchObject({
        type: 'multi_select',
        multi_select: [
          { id: 'tag-1', name: 'Tag1' },
          { id: 'tag-2', name: 'Tag2' },
        ],
      });

      expect(properties.Status).toMatchObject({
        type: 'status',
        status: { id: 'status-1', name: 'Active' },
      });

      // Should not log any warnings for valid properties
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive matching for select options', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Category', value: 'published' }, // lowercase
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createSelectPropertyDefinition('Category', [
          { id: 'cat-1', name: 'Published' }, // capitalized
        ]),
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      expect(properties.Category).toMatchObject({
        type: 'select',
        select: { id: 'cat-1', name: 'Published' },
      });
    });

    it('should handle other property types normally (not affected by empty string check)', async () => {
      const pageElement = new PageElement({
        title: 'Test Page',
        content: [],
        properties: [
          { name: 'Description', value: 'Test description' },
          { name: 'URL', value: 'https://example.com' },
        ],
      });

      const availableProperties: DatabaseProperty[] = [
        createRichTextPropertyDefinition('Description'),
        {
          name: 'URL',
          type: 'url',
          definition: {
            type: 'url',
            url: {},
          } as DatabasePropertyDefinition,
        },
      ];

      const result = await converter.convertFromElement(
        pageElement,
        availableProperties
      );

      const properties = result.toCreatePageBodyParameters().properties;

      expect(properties).toHaveProperty('Description');
      expect(properties).toHaveProperty('URL');
    });
  });
});
