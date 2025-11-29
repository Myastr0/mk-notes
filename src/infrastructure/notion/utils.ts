import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import {
  BlockObjectRequest,
  BlockObjectRequestWithoutChildren,
} from '../../domains/notion/types/types';

export const normalizeBlock = (
  block:
    | BlockObjectRequest
    | BlockObjectRequestWithoutChildren
    | BlockObjectResponse
): string => {
  let normalizedContent = '';

  if (block === undefined) {
    return normalizedContent;
  }

  if ('paragraph' in block) {
    normalizedContent = block.paragraph.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('heading_1' in block) {
    normalizedContent = block.heading_1.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('heading_2' in block) {
    normalizedContent = block.heading_2.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('heading_3' in block) {
    normalizedContent = block.heading_3.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('bulleted_list_item' in block) {
    normalizedContent = block.bulleted_list_item.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('numbered_list_item' in block) {
    normalizedContent = block.numbered_list_item.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('to_do' in block) {
    normalizedContent = block.to_do.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('toggle' in block) {
    normalizedContent = block.toggle.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  } else if ('callout' in block) {
    normalizedContent = block.callout.rich_text
      .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
      .join(' ');
  }
  // Add other block types as needed

  return normalizedContent;
};

export const isBlockEquals = (
  blockRequest: BlockObjectRequest | BlockObjectRequestWithoutChildren,
  blockResponse: BlockObjectResponse
): boolean => {
  const newNormalizedContent = normalizeBlock(blockRequest);
  const existingNormalizedContent = normalizeBlock(blockResponse);

  return newNormalizedContent === existingNormalizedContent;
};
