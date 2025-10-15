import { TreeNode } from './TreeNode';
export declare class SiteMap {
    private _root;
    constructor();
    /**
     * Builds the sitemap tree from a list of file paths
     * @param filepaths - Array of file paths
     */
    static buildFromFilePaths(filepaths: string[]): SiteMap;
    private traverseAndUpdate;
    private removeUselessNodesTree;
    /**
     * Traverse the tree and update nodes based on the specified rules
     */
    _updateTree(): void;
    /**
     * TODO: Implement mkdocs.yaml sitemap parsing
     *
     * Parses the mkdocs.yaml content and adds nodes to the sitemap
     * @param config - Parsed YAML content from mkdocs.yaml
     */
    get root(): TreeNode;
    toJSON(): {
        root: Record<string, unknown>;
    };
    /**
     * Creates a new SiteMap instance from a JSON object
     * @param data - JSON object containing the sitemap structure
     */
    static fromJSON(data: Record<string, unknown>): SiteMap;
}
