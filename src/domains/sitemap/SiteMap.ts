import * as path from 'path';

import { TreeNode } from './TreeNode';

export class SiteMap {
  private _root: TreeNode;

  constructor() {
    this._root = new TreeNode({
      id: '',
      name: 'root',
      children: [],
      filepath: '',
      parent: null,
    });
  }

  /**
   * Builds the sitemap tree from a list of file paths
   * @param filepaths - Array of file paths
   */
  static buildFromFilePaths(filepaths: string[]): SiteMap {
    const siteMap = new SiteMap();
    // Sort filepaths alphabetically
    const sortedFilePaths = filepaths.sort();

    // Build raw tree structure
    for (const filepath of sortedFilePaths) {
      const parts = filepath.split(path.sep);
      let currentNode = siteMap._root;

      for (const part of parts) {
        let childNode = currentNode.children.find(
          (child) => child.name === part
        );

        if (!childNode) {
          const isLastPart = parts.indexOf(part) === parts.length - 1;
          const newNode = new TreeNode({
            id: path.join(...parts.slice(0, parts.indexOf(part) + 1)),
            name: part,
            filepath: isLastPart ? filepath : '',
            children: [],
            parent: currentNode,
          });

          currentNode.children.push(newNode);
          childNode = newNode;
        }

        currentNode = childNode;
      }
    }

    siteMap._updateTree();

    return siteMap;
  }

  private traverseAndUpdate(node: TreeNode): void {
    // Traverse children first
    for (const child of node.children) {
      this.traverseAndUpdate(child);
    }

    const { parent } = node;

    // Apply rules only if the parent exists and has no filepath
    if (parent && !parent.filepath && parent.id !== this._root.id) {
      // Check if there's an "index.md" file among the parent's children
      const indexChild = parent.children.find(
        (child) => child.filepath === path.join(parent.id, 'index.md')
      );

      if (indexChild) {
        // Handle the index.md logic
        parent.filepath = indexChild.filepath;
        parent.id = indexChild.id;

        // Merge and update children list and parent references
        const nonIndexChildren = parent.children.filter(
          (child) => child !== indexChild
        );
        parent.children = [...nonIndexChildren, ...indexChild.children];
        indexChild.children.forEach((child) => {
          child.parent = parent;
        });
      } else {
        // Apply firstChild logic if no index.md is found
        const firstChild = parent.children.find(
          (child) => !child.filepath.endsWith('/')
        );
        if (firstChild) {
          parent.filepath = firstChild.filepath;
          parent.id = firstChild.id;

          // Merge and update children list and parent references
          const remainingChildren = parent.children.filter(
            (child) => child !== firstChild
          );
          parent.children = [...firstChild.children, ...remainingChildren];
          firstChild.children.forEach((child) => {
            child.parent = parent;
          });
        }
      }
    }

    // Handle root-level index.md separately
    if (node === this._root && !node.filepath) {
      // Look for ANY index.md file that should be treated as root content
      // This includes both relative paths (index.md) and full paths (*/index.md)
      const rootIndexChild = node.children.find(
        (child) => path.basename(child.filepath) === 'index.md'
      );

      if (rootIndexChild) {
        node.filepath = rootIndexChild.filepath;
        // Remove index.md from children and merge its children
        const nonIndexChildren = node.children.filter(
          (child) => child !== rootIndexChild
        );
        node.children = [...nonIndexChildren, ...rootIndexChild.children];
        rootIndexChild.children.forEach((child) => {
          child.parent = node;
        });
      }
    }
  }

  private removeUselessNodesTree(node: TreeNode): TreeNode {
    while (
      node.children.length === 1 &&
      path.extname(node.children[0].filepath) === ''
    ) {
      const [child] = node.children;
      node.children = child.children;
      // Fix parent pointers for the adopted children
      node.children.forEach((grandChild) => {
        grandChild.parent = node;
      });
    }

    return node;
  }
  /**
   * Traverse the tree and update nodes based on the specified rules
   */
  _updateTree(): void {
    this.removeUselessNodesTree(this._root);
    this.traverseAndUpdate(this._root);
  }

  /**
   * Flattens the sitemap structure so all files are direct children of the root.
   * This is useful for flat synchronization mode.
   */
  flatten(): void {
    const allNodes: TreeNode[] = [];

    // Collect all nodes except root
    const collectNodes = (node: TreeNode) => {
      // We don't include the current node if it's the root
      if (node !== this._root) {
        allNodes.push(node);
      }
      node.children.forEach(collectNodes);
    };

    // Start collection from root's children
    this._root.children.forEach(collectNodes);

    // Clear existing children of root
    this._root.children = [];

    // Reassign all collected nodes as direct children of root
    // And clear their children since they are now flat
    allNodes.forEach((node) => {
      node.parent = this._root;
      node.children = [];
      this._root.children.push(node);
    });
  }

  /**
   * TODO: Implement mkdocs.yaml sitemap parsing
   *
   * Parses the mkdocs.yaml content and adds nodes to the sitemap
   * @param config - Parsed YAML content from mkdocs.yaml
   */
  // buildFromConfig(config: Record<string, unknown>): void {
  //   // Implement logic to handle mkdocs.yaml configuration and build the sitemap
  //   // This would require parsing the config and adding nodes appropriately
  // }

  get root(): TreeNode {
    return this._root;
  }

  toJSON() {
    return {
      root: this.root.toJSON(),
    };
  }

  /**
   * Creates a new SiteMap instance from a JSON object
   * @param data - JSON object containing the sitemap structure
   */
  static fromJSON(data: Record<string, unknown>): SiteMap {
    if (!data.root) {
      throw new Error('Invalid data');
    }

    const sitemap = new SiteMap();
    sitemap._root = TreeNode.fromJSON(data.root as Record<string, unknown>);
    return sitemap;
  }
}
