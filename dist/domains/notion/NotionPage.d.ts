import { BlockObjectResponse, PartialBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Page } from '@/domains';
import { BlockObjectRequest, Icon, PageProperties, PartialCreatePageBodyParameters } from '@/domains/notion/types';
export declare class NotionPage implements Page {
    readonly pageId?: string;
    readonly icon?: Icon;
    readonly title?: string;
    readonly properties?: PageProperties;
    readonly children: (BlockObjectResponse | PartialBlockObjectResponse | BlockObjectRequest)[];
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly isLocked?: boolean;
    constructor({ pageId, children, createdAt, icon, updatedAt, properties, isLocked, }: {
        pageId?: string;
        children: (BlockObjectResponse | PartialBlockObjectResponse | BlockObjectRequest)[];
        createdAt?: Date;
        icon?: Icon;
        updatedAt?: Date;
        properties?: PageProperties;
        isLocked?: boolean;
    });
    static fromPartialCreatePageBodyParameters(args: PartialCreatePageBodyParameters): NotionPage;
    toCreatePageBodyParameters(): PartialCreatePageBodyParameters;
}
