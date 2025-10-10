import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { BlockObjectRequest, BlockObjectRequestWithoutChildren } from '../../domains/notion/types';
export declare const normalizeBlock: (block: BlockObjectRequest | BlockObjectRequestWithoutChildren | BlockObjectResponse) => string;
export declare const isBlockEquals: (blockRequest: BlockObjectRequest | BlockObjectRequestWithoutChildren, blockResponse: BlockObjectResponse) => boolean;
