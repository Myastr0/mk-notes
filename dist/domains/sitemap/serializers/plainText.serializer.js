"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeInPlainText = void 0;
const serializeInPlainText = (siteMap) => {
    const serializeNode = (node, depth = 0, prefix = '') => {
        // Start with the current node line
        let result = `${prefix}├─ ${node.id} (${node.name === 'root' ? 'Your parent Notion Page' : node.name})\n`;
        // Iterate over children to build their serialization
        node.children.forEach((childNode, index, array) => {
            // Determine the correct prefix for children
            const childPrefix = prefix + (index === array.length ? '    ' : '│   ');
            result += serializeNode(childNode, depth + 1, childPrefix);
        });
        return result;
    };
    // Start serialization from the root with no prefix
    return serializeNode(siteMap.root);
};
exports.serializeInPlainText = serializeInPlainText;
