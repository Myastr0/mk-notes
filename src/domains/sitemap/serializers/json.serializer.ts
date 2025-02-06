import { type TreeNode } from '../TreeNode';
import { type SitemapSerializer } from './types';

interface NodePreview {
  name: string;
  id: string;
  children: NodePreview[];
}

export const serializeInJson: SitemapSerializer = (siteMap) => {
  const serializeNode = (node: TreeNode): NodePreview => {
    const result: NodePreview = {
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
