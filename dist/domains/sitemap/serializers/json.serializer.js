"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeInJson = void 0;
const serializeInJson = (siteMap) => {
    const serializeNode = (node) => {
        const result = {
            name: node.name === 'root' ? 'Your parent Notion Page' : node.name,
            id: node.id,
            children: [],
        };
        node.children.forEach((childNode, index) => {
            result.children[index] = serializeNode(childNode);
        });
        return result;
    };
    return JSON.stringify(serializeNode(siteMap.root), null, 2);
};
exports.serializeInJson = serializeInJson;
