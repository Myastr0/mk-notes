export class TreeNode {
  id: string;
  name: string;
  filepath: string;
  children: TreeNode[];
  parent: TreeNode | null; // New parent property

  constructor({
    id,
    name,
    filepath,
    children = [],
    parent = null,
  }: {
    id: string;
    name: string;
    filepath: string;
    children?: TreeNode[];
    parent?: TreeNode | null;
  }) {
    this.id = id;
    this.filepath = filepath;
    this.name = name;
    this.children = children;
    this.parent = parent;

    // Set this node as the parent of each child
    this.children.forEach((child) => {
      child.parent = this;
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      children: this.children.map((child) => child.toJSON()),
      filepath: this.filepath,
    };
  }

  static fromJSON(
    json: Record<string, unknown>,
    parent: TreeNode | null = null
  ): TreeNode {
    const node = new TreeNode({
      id: json.id as string,
      name: json.name as string,
      filepath: json.filepath as string,
      parent, // Set the parent when creating the node
    });

    // Recursively create children and set their parent
    node.children = (json.children as Record<string, unknown>[]).map((child) =>
      this.fromJSON(child, node)
    );

    return node;
  }
}
