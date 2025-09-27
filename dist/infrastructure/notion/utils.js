"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlockEquals = exports.normalizeBlock = void 0;
const normalizeBlock = (block) => {
    let normalizedContent = '';
    if (block === undefined) {
        return normalizedContent;
    }
    if ('paragraph' in block) {
        normalizedContent = block.paragraph.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('heading_1' in block) {
        normalizedContent = block.heading_1.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('heading_2' in block) {
        normalizedContent = block.heading_2.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('heading_3' in block) {
        normalizedContent = block.heading_3.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('bulleted_list_item' in block) {
        normalizedContent = block.bulleted_list_item.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('numbered_list_item' in block) {
        normalizedContent = block.numbered_list_item.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('to_do' in block) {
        normalizedContent = block.to_do.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('toggle' in block) {
        normalizedContent = block.toggle.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    else if ('callout' in block) {
        normalizedContent = block.callout.rich_text
            .map((rich_text) => rich_text.type === 'text' && rich_text.text.content)
            .join(' ');
    }
    // Add other block types as needed
    return normalizedContent;
};
exports.normalizeBlock = normalizeBlock;
const isBlockEquals = (blockRequest, blockResponse) => {
    const newNormalizedContent = (0, exports.normalizeBlock)(blockRequest);
    const existingNormalizedContent = (0, exports.normalizeBlock)(blockResponse);
    return newNormalizedContent === existingNormalizedContent;
};
exports.isBlockEquals = isBlockEquals;
