import { type TreeNode } from '../entities/TreeNode';
import { type SitemapSerializer } from './types';

export const serializeInPlainText: SitemapSerializer = (siteMap) => {
  const serializeNode = (
    node: TreeNode,
    depth: number = 0,
    prefix: string = ''
  ): string => {
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
