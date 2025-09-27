"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNode = void 0;
class TreeNode {
    id;
    name;
    filepath;
    children;
    parent; // New parent property
    constructor({ id, name, filepath, children = [], parent = null, }) {
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
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            children: this.children.map((child) => child.toJSON()),
            filepath: this.filepath,
        };
    }
    static fromJSON(json, parent = null) {
        const node = new TreeNode({
            id: json.id,
            name: json.name,
            filepath: json.filepath,
            parent, // Set the parent when creating the node
        });
        // Recursively create children and set their parent
        node.children = json.children.map((child) => this.fromJSON(child, node));
        return node;
    }
}
exports.TreeNode = TreeNode;
