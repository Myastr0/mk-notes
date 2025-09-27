export declare class TreeNode {
    id: string;
    name: string;
    filepath: string;
    children: TreeNode[];
    parent: TreeNode | null;
    constructor({ id, name, filepath, children, parent, }: {
        id: string;
        name: string;
        filepath: string;
        children?: TreeNode[];
        parent?: TreeNode | null;
    });
    toJSON(): Record<string, unknown>;
    static fromJSON(json: Record<string, unknown>, parent?: TreeNode | null): TreeNode;
}
