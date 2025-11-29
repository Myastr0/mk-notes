import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { Page } from '@/domains';
import {
  BlockObjectRequest,
  Icon,
  PageProperties,
  PartialCreatePageBodyParameters,
} from '@/domains/notion/types/types';

export class NotionPage implements Page {
  public readonly pageId?: string;
  public readonly icon?: Icon;
  public readonly title?: string;
  public readonly properties?: PageProperties;
  public readonly children: (
    | BlockObjectResponse
    | PartialBlockObjectResponse
    | BlockObjectRequest
  )[];
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly isLocked?: boolean;

  constructor({
    pageId,
    children,
    createdAt,
    icon,
    updatedAt,
    properties,
    isLocked,
  }: {
    pageId?: string;
    children: (
      | BlockObjectResponse
      | PartialBlockObjectResponse
      | BlockObjectRequest
    )[];
    createdAt?: Date;
    icon?: Icon;
    updatedAt?: Date;
    properties?: PageProperties;
    isLocked?: boolean;
  }) {
    this.pageId = pageId;
    this.children = children;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt || createdAt;
    this.icon = icon;
    this.properties = properties;
    this.isLocked = isLocked;
  }

  static fromPartialCreatePageBodyParameters(
    args: PartialCreatePageBodyParameters
  ) {
    return new NotionPage({
      children: args.children ?? [],
      properties: args.properties,
      icon:
        args.icon !== undefined && args.icon !== null ? args.icon : undefined,
      // Notion page is not locked on creation
      isLocked: false,
    });
  }
  toCreatePageBodyParameters(): PartialCreatePageBodyParameters {
    return {
      children: this.children as BlockObjectRequest[],
      properties: this.properties as PageProperties,
      icon: this.icon,
    };
  }
}
