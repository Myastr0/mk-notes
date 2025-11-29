import {
  BlockObjectRequestWithoutChildren as _BlockObjectRequestWithoutChildren,
  CreatePageParameters,
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialUserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { SupportedEmoji } from '@/domains/elements/types';

export type PartialCreatePageBodyParameters = Pick<
  CreatePageBodyParameters,
  'properties' | 'children' | 'icon'
>;

export type BlockObjectRequestWithoutChildren =
  _BlockObjectRequestWithoutChildren;

// Common types
type IdRequest = string;
type StringRequest = string;
type TextRequest = string;
type SelectColor = string;
type DateRequest = string;
type EmptyObject = Record<string, never>;

type TextAnnotation = {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?:
    | 'default'
    | 'gray'
    | 'brown'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'pink'
    | 'red'
    | 'gray_background'
    | 'brown_background'
    | 'orange_background'
    | 'yellow_background'
    | 'green_background'
    | 'blue_background'
    | 'purple_background'
    | 'pink_background'
    | 'red_background';
};
type TextItemRequest = {
  type?: 'text';
  text: {
    content: string;
    link?: { url: string } | null;
  };
  annotations?: TextAnnotation;
  plain_text?: string;
  href?: string | null;
};

type EquationItemRequest = {
  type?: 'equation';
  equation: {
    expression: string;
  };
  annotations?: TextAnnotation;
  plain_text?: string;
  href?: string | null;
};

export type RichTextItemRequest = TextItemRequest | EquationItemRequest;

export type Parent = CreatePageParameters['parent'];

// Property Interfaces
export interface TitleProperty {
  title: Array<RichTextItemRequest>;
  id: 'title';
  type?: 'title';
}

export interface RichTextProperty {
  rich_text: Array<RichTextItemRequest>;
  type?: 'rich_text';
}

export interface NumberProperty {
  number: number | null;
  type?: 'number';
}

export interface UrlProperty {
  url: TextRequest | null;
  type?: 'url';
}

export interface SelectOption {
  id: StringRequest;
  name?: StringRequest;
  color?: SelectColor;
  description?: StringRequest | null;
}

export interface SelectProperty {
  select: SelectOption | null;
  type?: 'select';
}

export interface MultiSelectProperty {
  multi_select: Array<SelectOption>;
  type?: 'multi_select';
}

export interface Person {
  id: IdRequest;
  person?: {
    email?: string;
  };
  type?: 'person';
  name?: string | null;
  avatar_url?: string | null;
  object?: 'user';
}

export interface Bot {
  bot:
    | EmptyObject
    | {
        owner:
          | {
              type: 'user';
              user: Person | PartialUserObjectResponse;
            }
          | {
              type: 'workspace';
              workspace: true;
            };
        workspace_name: string | null;
      };
  id: IdRequest;
  type?: 'bot';
  name?: string | null;
  avatar_url?: string | null;
  object?: 'user';
}

export interface PeopleProperty {
  people: Array<Person | Bot>;
  type?: 'people';
}

export interface EmailProperty {
  email: StringRequest | null;
  type?: 'email';
}

export interface PhoneNumberProperty {
  phone_number: StringRequest | null;
  type?: 'phone_number';
}

export interface DateProperty {
  date: DateRequest | null;
  type?: 'date';
}

export interface CheckboxProperty {
  checkbox: boolean;
  type?: 'checkbox';
}

export interface RelationProperty {
  relation: Array<{ id: IdRequest }>;
  type?: 'relation';
}

export interface FileProperty {
  file: {
    url: string;
    expiry_time?: string;
  };
  name: StringRequest;
  type?: 'file';
}

export interface ExternalFileProperty {
  external: {
    url: TextRequest;
  };
  name: StringRequest;
  type?: 'external';
}

export interface FilesProperty {
  files: Array<FileProperty | ExternalFileProperty>;
  type?: 'files';
}

export interface StatusProperty {
  status: SelectOption | null;
  type?: 'status';
}

// Icon Interfaces
export interface EmojiIcon {
  emoji: SupportedEmoji;
  type?: 'emoji';
}

export interface ExternalIcon {
  external: {
    url: TextRequest;
  };
  type?: 'external';
}

export type Icon = EmojiIcon | ExternalIcon;

// Cover Interfaces
export interface ExternalCover {
  external: {
    url: TextRequest;
  };
  type?: 'external';
}

export type Cover = ExternalCover;

export type PageProperties = Record<
  string,
  | TitleProperty
  | RichTextProperty
  | NumberProperty
  | UrlProperty
  | SelectProperty
  | MultiSelectProperty
  | PeopleProperty
  | EmailProperty
  | PhoneNumberProperty
  | DateProperty
  | CheckboxProperty
  | RelationProperty
  | FilesProperty
  | StatusProperty
>;

// CreatePageBodyParameters Interface
export interface CreatePageBodyParameters {
  parent: Parent;
  properties: PageProperties;
  icon?: Icon | null;
  cover?: Cover | null;
  content?: Array<BlockObjectRequest>;
  children?: Array<BlockObjectRequest>;
}

export type ApiColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background';
export type LanguageRequest =
  | 'abap'
  | 'agda'
  | 'arduino'
  | 'assembly'
  | 'bash'
  | 'basic'
  | 'bnf'
  | 'c'
  | 'c#'
  | 'c++'
  | 'clojure'
  | 'coffeescript'
  | 'coq'
  | 'css'
  | 'dart'
  | 'dhall'
  | 'diff'
  | 'docker'
  | 'ebnf'
  | 'elixir'
  | 'elm'
  | 'erlang'
  | 'f#'
  | 'flow'
  | 'fortran'
  | 'gherkin'
  | 'glsl'
  | 'go'
  | 'graphql'
  | 'groovy'
  | 'haskell'
  | 'html'
  | 'idris'
  | 'java'
  | 'javascript'
  | 'json'
  | 'julia'
  | 'kotlin'
  | 'latex'
  | 'less'
  | 'lisp'
  | 'livescript'
  | 'llvm ir'
  | 'lua'
  | 'makefile'
  | 'markdown'
  | 'markup'
  | 'matlab'
  | 'mathematica'
  | 'mermaid'
  | 'nix'
  | 'notion formula'
  | 'objective-c'
  | 'ocaml'
  | 'pascal'
  | 'perl'
  | 'php'
  | 'plain text'
  | 'powershell'
  | 'prolog'
  | 'protobuf'
  | 'purescript'
  | 'python'
  | 'r'
  | 'racket'
  | 'reason'
  | 'ruby'
  | 'rust'
  | 'sass'
  | 'scala'
  | 'scheme'
  | 'scss'
  | 'shell'
  | 'solidity'
  | 'sql'
  | 'swift'
  | 'toml'
  | 'typescript'
  | 'vb.net'
  | 'verilog'
  | 'vhdl'
  | 'visual basic'
  | 'webassembly'
  | 'xml'
  | 'yaml'
  | 'java/c/c++/c#';

// Block Interfaces
export interface EmbedBlock {
  embed: {
    url: string;
    caption?: Array<RichTextItemRequest>;
  };
  type?: 'embed';
  object?: 'block';
}

export interface BookmarkBlock {
  bookmark: {
    url: string;
    caption?: Array<RichTextItemRequest>;
  };
  type?: 'bookmark';
  object?: 'block';
}

export interface ExternalFileBlock {
  external: {
    url: TextRequest;
  };
  type?: 'external';
  caption?: Array<RichTextItemRequest>;
}

export interface NotionFileBlock {
  file: {
    url: string;
    expiry_time: string;
  };
  type?: 'file';
  caption?: Array<RichTextItemRequest>;
}

export interface ImageBlock {
  image: ExternalFileBlock;
  type?: 'image';
  object?: 'block';
}

export interface VideoBlock {
  video: ExternalFileBlock;
  type?: 'video';
  object?: 'block';
}

export interface PdfBlock {
  pdf: ExternalFileBlock;
  type?: 'pdf';
  object?: 'block';
}

export interface FileBlock {
  file: ExternalFileBlock & {
    name?: StringRequest;
  };
  type?: 'file';
  object?: 'block';
}

export interface AudioBlock {
  audio: ExternalFileBlock;
  type?: 'audio';
  object?: 'block';
}

export interface CodeBlock {
  code: {
    rich_text: Array<RichTextItemRequest>;
    language: LanguageRequest;
    caption?: Array<RichTextItemRequest>;
  };
  type?: 'code';
  object?: 'block';
}

export interface EquationBlock {
  equation: {
    expression: string;
  };
  type?: 'equation';
  object?: 'block';
}

export interface DividerBlock {
  divider: EmptyObject;
  type?: 'divider';
  object?: 'block';
}

export interface BreadcrumbBlock {
  breadcrumb: EmptyObject;
  type?: 'breadcrumb';
  object?: 'block';
}

export interface TableOfContentsBlock {
  table_of_contents: {
    color?: ApiColor;
  };
  type?: 'table_of_contents';
  object?: 'block';
}

export interface LinkToPageBlock {
  link_to_page:
    | {
        page_id: IdRequest;
        type?: 'page_id';
      }
    | {
        database_id: IdRequest;
        type?: 'database_id';
      }
    | {
        comment_id: IdRequest;
        type?: 'comment_id';
      };
  type?: 'link_to_page';
  object?: 'block';
}

export interface TableRowBlock {
  table_row: {
    cells: Array<Array<RichTextItemRequest>>;
  };
  type?: 'table_row';
  object?: 'block';
}

export interface TableBlock {
  table: {
    table_width: number;
    children: Array<TableRowBlock>;
    has_column_header?: boolean;
    has_row_header?: boolean;
  };
  type?: 'table';
  object?: 'block';
}

export interface ColumnBlock {
  column: {
    children: Array<BlockObjectRequestWithoutChildren>;
  };
  type?: 'column';
  object?: 'block';
}

export interface ColumnListBlock {
  column_list: {
    children: Array<ColumnBlock>;
  };
  type?: 'column_list';
  object?: 'block';
}

export interface HeadingBlock {
  rich_text: Array<RichTextItemRequest>;
  color?: ApiColor;
  is_toggleable?: boolean;
  children?: Array<BlockObjectRequestWithoutChildren>;
}

export interface Heading1Block {
  heading_1: HeadingBlock;
  type?: 'heading_1';
  object?: 'block';
}

export interface Heading2Block {
  heading_2: HeadingBlock;
  type?: 'heading_2';
  object?: 'block';
}

export interface Heading3Block {
  heading_3: HeadingBlock;
  type?: 'heading_3';
  object?: 'block';
}

export interface ParagraphBlock {
  paragraph: {
    rich_text: Array<RichTextItemRequest>;
    color?: ApiColor;
    children?: Array<BlockObjectRequestWithoutChildren>;
  };
  type?: 'paragraph';
  object?: 'block';
}

export interface ListItemBlock {
  rich_text: Array<RichTextItemRequest>;
  color?: ApiColor;
  children?: Array<BlockObjectRequestWithoutChildren>;
}

export interface BulletedListItemBlock {
  bulleted_list_item: ListItemBlock;
  type?: 'bulleted_list_item';
  object?: 'block';
}

export interface NumberedListItemBlock {
  numbered_list_item: ListItemBlock;
  type?: 'numbered_list_item';
  object?: 'block';
}

export interface QuoteBlock {
  quote: ListItemBlock;
  type?: 'quote';
  object?: 'block';
}

export interface ToDoBlock {
  to_do: ListItemBlock & {
    checked?: boolean;
  };
  type?: 'to_do';
  object?: 'block';
}

export interface ToggleBlock {
  toggle: ListItemBlock;
  type?: 'toggle';
  object?: 'block';
}

export interface TemplateBlock {
  template: {
    rich_text: Array<RichTextItemRequest>;
    children?: Array<BlockObjectRequestWithoutChildren>;
  };
  type?: 'template';
  object?: 'block';
}

export interface CalloutBlock {
  callout: ListItemBlock & {
    icon?: EmojiIcon | ExternalIcon;
  };
  type?: 'callout';
  object?: 'block';
}

export interface SyncedBlock {
  synced_block: {
    synced_from: {
      block_id: IdRequest;
      type?: 'block_id';
    } | null;
    children?: Array<BlockObjectRequestWithoutChildren>;
  };
  type?: 'synced_block';
  object?: 'block';
}

// Icon Interfaces
export interface EmojiIcon {
  emoji: SupportedEmoji;
  type?: 'emoji';
}

export interface ExternalIcon {
  external: {
    url: TextRequest;
  };
  type?: 'external';
}

// BlockObjectRequest Interface
export type BlockObjectRequest =
  | EmbedBlock
  | BookmarkBlock
  | ImageBlock
  | VideoBlock
  | PdfBlock
  | FileBlock
  | AudioBlock
  | CodeBlock
  | EquationBlock
  | DividerBlock
  | BreadcrumbBlock
  | TableOfContentsBlock
  | LinkToPageBlock
  | TableRowBlock
  | TableBlock
  | ColumnBlock
  | ColumnListBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | ParagraphBlock
  | BulletedListItemBlock
  | NumberedListItemBlock
  | QuoteBlock
  | ToDoBlock
  | ToggleBlock
  | TemplateBlock
  | CalloutBlock
  | SyncedBlock;

export const isPageObjectResponse = (
  obj: Record<string, unknown>
): obj is PageObjectResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    obj.object === 'page' &&
    typeof obj.id === 'string' &&
    typeof obj.created_time === 'string' &&
    typeof obj.last_edited_time === 'string' &&
    typeof obj.archived === 'boolean' &&
    typeof obj.in_trash === 'boolean' &&
    typeof obj.url === 'string' &&
    (typeof obj.public_url === 'string' || obj.public_url === null) &&
    isParent(obj.parent) &&
    typeof obj.properties === 'object' &&
    isIcon(obj.icon) &&
    isCover(obj.cover) &&
    isCreatedBy(obj.created_by) &&
    isLastEditedBy(obj.last_edited_by)
  );
};

// Helper function to check the parent field
function isParent(parent: unknown): boolean {
  return (
    typeof parent === 'object' &&
    parent !== null &&
    'type' in parent &&
    'database_id' in parent &&
    ((parent.type === 'database_id' &&
      typeof parent.database_id === 'string') ||
      (parent.type === 'page_id' &&
        'page_id' in parent &&
        typeof parent.page_id === 'string') ||
      (parent.type === 'block_id' &&
        'block_id' in parent &&
        typeof parent.block_id === 'string') ||
      (parent.type === 'workspace' &&
        'workspace' in parent &&
        parent.workspace === true))
  );
}

// Helper function to check the icon field
function isIcon(icon: unknown): boolean {
  return (
    icon === null ||
    (typeof icon === 'object' &&
      (('type' in icon &&
        typeof icon.type === 'string' &&
        icon.type === 'emoji' &&
        'emoji' in icon &&
        typeof icon.emoji === 'string') ||
        ('type' in icon &&
          typeof icon.type === 'string' &&
          icon.type === 'external' &&
          'external' in icon &&
          typeof icon.external === 'object' &&
          icon.external !== null &&
          'url' in icon.external &&
          typeof icon.external.url === 'string') ||
        ('type' in icon &&
          typeof icon.type === 'string' &&
          icon.type === 'file' &&
          'file' in icon &&
          typeof icon.file === 'object' &&
          icon.file !== null &&
          'url' in icon.file &&
          'expiry_time' in icon.file &&
          typeof icon.file.url === 'string' &&
          typeof icon.file.expiry_time === 'string')))
  );
}

// Helper function to check the cover field
function isCover(cover: unknown): boolean {
  return (
    cover === null ||
    (typeof cover === 'object' &&
      (('type' in cover &&
        typeof cover.type === 'string' &&
        cover.type === 'external' &&
        'external' in cover &&
        typeof cover.external === 'object' &&
        cover.external !== null &&
        'url' in cover.external &&
        typeof cover.external.url === 'string') ||
        ('type' in cover &&
          typeof cover.type === 'string' &&
          cover.type === 'file' &&
          'file' in cover &&
          cover.file !== null &&
          typeof cover.file === 'object' &&
          'url' in cover.file &&
          'expiry_time' in cover.file &&
          typeof cover.file.url === 'string' &&
          typeof cover.file.expiry_time === 'string')))
  );
}

// Helper function to check created_by field
function isCreatedBy(created_by: unknown): boolean {
  return typeof created_by === 'object'; // Assuming PartialUserObjectResponse is an object, refine this if needed
}

// Helper function to check last_edited_by field
function isLastEditedBy(last_edited_by: unknown): boolean {
  return typeof last_edited_by === 'object'; // Assuming PartialUserObjectResponse is an object, refine this if needed
}

// Database Property Definition Types
// These represent the schema/definition of properties in a Notion database

export type DatabasePropertyDefinition =
  DataSourceObjectResponse['properties'][string];
export type DatabasePropertyType = DatabasePropertyDefinition['type'];

export interface DatabaseProperty {
  name: string;
  definition: DatabasePropertyDefinition;
  type: DatabasePropertyType;
}
