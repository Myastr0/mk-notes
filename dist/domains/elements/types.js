"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedEmoji = void 0;
const isSupportedEmoji = (text) => {
    const emojiRegex = /\p{Emoji}/u;
    return emojiRegex.test(text);
};
exports.isSupportedEmoji = isSupportedEmoji;
