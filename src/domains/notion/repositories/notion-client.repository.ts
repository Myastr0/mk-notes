import {
  BlockObjectResponse,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  SearchResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { BlockObjectRequest, Icon, PageProperties, Parent } from '../types';

export interface CreatePageInput {
  parent: Parent;
  properties: PageProperties;
  icon?: Icon;
  children?: BlockObjectRequest[];
}
import { NotionPage } from '../entities/NotionPage';

export interface NotionClientRepository {
  /**
   * ------------------------------------------------------------
   * GENERAL METHODS
   * ------------------------------------------------------------
   */
  search({
    filter,
  }: {
    filter: { property: 'object'; value: 'page' | 'data_source' };
  }): Promise<SearchResponse>;

  /**
   * ------------------------------------------------------------
   * DATABASES METHODS
   * ------------------------------------------------------------
   */
  getDatabaseById({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<DatabaseObjectResponse | null>;

  /**
   * ------------------------------------------------------------
   * DATA SOURCES METHODS
   * ------------------------------------------------------------
   */
  getDataSourceById({
    dataSourceId,
  }: {
    dataSourceId: string;
  }): Promise<DataSourceObjectResponse | null>;

  getDataSourceIdFromDatabaseId({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<string | null>;

  /**
   * ------------------------------------------------------------
   * PAGES METHODS
   * ------------------------------------------------------------
   */
  createPage({
    parent,
    properties,
    icon,
    children,
  }: CreatePageInput): Promise<NotionPage>;
  updatePage({
    pageId,
    icon,
    properties,
    archived,
    isLocked,
  }: {
    pageId: string;
    icon?: Icon;
    properties?: PageProperties;
    archived?: boolean;
    isLocked?: boolean;
  }): Promise<NotionPage>;
  deletePage({ pageId }: { pageId: string }): Promise<void>;
  getPage({ pageId }: { pageId: string }): Promise<NotionPage | null>;
  getPageBlocks({ pageId }: { pageId: string }): Promise<BlockObjectResponse[]>;
  /**
   * ------------------------------------------------------------
   * BLOCKS METHODS
   * ------------------------------------------------------------
   */
  appendChildToBlock({
    blockId,
    children,
    afterBlockId,
  }: {
    blockId: string;
    children: BlockObjectRequest[];
    afterBlockId?: string;
  }): Promise<BlockObjectResponse[]>;
  deleteBlock({ blockId }: { blockId: string }): Promise<void>;
  deleteBlocks({ blockIds }: { blockIds: string[] }): Promise<void>;
  getBlock({ blockId }: { blockId: string }): Promise<BlockObjectResponse>;
  updateBlock({
    blockId,
    block,
  }: {
    blockId: string;
    block: BlockObjectRequest;
  }): Promise<BlockObjectResponse>;
  getBlockChildren({
    blockId,
  }: {
    blockId: string;
  }): Promise<BlockObjectResponse[]>;
}
