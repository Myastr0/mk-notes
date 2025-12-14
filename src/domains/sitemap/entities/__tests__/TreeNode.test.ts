import { TreeNode } from '../TreeNode';

describe('TreeNode', () => {
  describe('constructor', () => {
    it('should create a node with basic properties', () => {
      const node = new TreeNode({
        id: '1',
        name: 'Test Node',
        filepath: '/test/path.md'
      });

      expect(node.id).toBe('1');
      expect(node.name).toBe('Test Node');
      expect(node.filepath).toBe('/test/path.md');
      expect(node.children).toEqual([]);
      expect(node.parent).toBeNull();
    });

    it('should set parent references for children', () => {
      const child = new TreeNode({
        id: 'child',
        name: 'Child Node',
        filepath: '/test/child.md'
      });

      const parent = new TreeNode({
        id: 'parent',
        name: 'Parent Node',
        filepath: '/test/parent.md',
        children: [child]
      });

      expect(child.parent).toBe(parent);
    });
  });

  describe('toJSON', () => {
    it('should serialize node without children', () => {
      const node = new TreeNode({
        id: '1',
        name: 'Test Node',
        filepath: '/test/path.md'
      });

      expect(node.toJSON()).toEqual({
        id: '1',
        name: 'Test Node',
        filepath: '/test/path.md',
        children: []
      });
    });

    it('should serialize node with children', () => {
      const child = new TreeNode({
        id: 'child',
        name: 'Child Node',
        filepath: '/test/child.md'
      });

      const parent = new TreeNode({
        id: 'parent',
        name: 'Parent Node',
        filepath: '/test/parent.md',
        children: [child]
      });

      expect(parent.toJSON()).toEqual({
        id: 'parent',
        name: 'Parent Node',
        filepath: '/test/parent.md',
        children: [{
          id: 'child',
          name: 'Child Node',
          filepath: '/test/child.md',
          children: []
        }]
      });
    });
  });

  describe('fromJSON', () => {
    it('should deserialize node without children', () => {
      const json = {
        id: '1',
        name: 'Test Node',
        filepath: '/test/path.md',
        children: []
      };

      const node = TreeNode.fromJSON(json);

      expect(node.id).toBe('1');
      expect(node.name).toBe('Test Node');
      expect(node.filepath).toBe('/test/path.md');
      expect(node.children).toEqual([]);
      expect(node.parent).toBeNull();
    });

    it('should deserialize node with children', () => {
      const json = {
        id: 'parent',
        name: 'Parent Node',
        filepath: '/test/parent.md',
        children: [{
          id: 'child',
          name: 'Child Node',
          filepath: '/test/child.md',
          children: []
        }]
      };

      const node = TreeNode.fromJSON(json);

      expect(node.id).toBe('parent');
      expect(node.children).toHaveLength(1);
      expect(node.children[0].id).toBe('child');
      expect(node.children[0].parent).toBe(node);
    });

    it('should maintain parent references in nested structure', () => {
      const json = {
        id: 'root',
        name: 'Root',
        filepath: '/root.md',
        children: [{
          id: 'parent',
          name: 'Parent',
          filepath: '/parent.md',
          children: [{
            id: 'child',
            name: 'Child',
            filepath: '/child.md',
            children: []
          }]
        }]
      };

      const root = TreeNode.fromJSON(json);
      const parent = root.children[0];
      const child = parent.children[0];

      expect(child.parent).toBe(parent);
      expect(parent.parent).toBe(root);
      expect(root.parent).toBeNull();
    });
  });

  describe('flatten', () => {
    it('should return empty array for root node with no children', () => {
      const root = new TreeNode({
        id: 'root',
        name: 'root',
        filepath: '',
        parent: null,
      });

      const flattened = root.flatten();

      expect(flattened).toEqual([]);
    });

    it('should return only children for root node (not the root itself)', () => {
      const child1 = new TreeNode({
        id: 'child1',
        name: 'Child 1',
        filepath: '/child1.md',
      });

      const child2 = new TreeNode({
        id: 'child2',
        name: 'Child 2',
        filepath: '/child2.md',
      });

      const root = new TreeNode({
        id: 'root',
        name: 'root',
        filepath: '',
        parent: null,
        children: [child1, child2],
      });

      const flattened = root.flatten();

      expect(flattened).toHaveLength(2);
      expect(flattened[0]).toBe(child1);
      expect(flattened[1]).toBe(child2);
      expect(flattened).not.toContain(root);
    });

    it('should return node itself plus flattened children for non-root node', () => {
      const grandchild = new TreeNode({
        id: 'grandchild',
        name: 'Grandchild',
        filepath: '/parent/child/grandchild.md',
      });

      const child = new TreeNode({
        id: 'child',
        name: 'Child',
        filepath: '/parent/child.md',
        children: [grandchild],
      });

      const parent = new TreeNode({
        id: 'parent',
        name: 'Parent',
        filepath: '/parent.md',
        children: [child],
      });

      // Set up a root node
      const root = new TreeNode({
        id: 'root',
        name: 'root',
        filepath: '',
        parent: null,
        children: [parent],
      });

      const flattened = child.flatten();

      expect(flattened).toHaveLength(2);
      expect(flattened[0]).toBe(child);
      expect(flattened[1]).toBe(grandchild);
    });

    it('should recursively flatten nested children', () => {
      const level3 = new TreeNode({
        id: 'level3',
        name: 'Level 3',
        filepath: '/level1/level2/level3.md',
      });

      const level2 = new TreeNode({
        id: 'level2',
        name: 'Level 2',
        filepath: '/level1/level2.md',
        children: [level3],
      });

      const level1 = new TreeNode({
        id: 'level1',
        name: 'Level 1',
        filepath: '/level1.md',
        children: [level2],
      });

      const root = new TreeNode({
        id: 'root',
        name: 'root',
        filepath: '',
        parent: null,
        children: [level1],
      });

      const flattened = level1.flatten();

      expect(flattened).toHaveLength(3);
      expect(flattened[0]).toBe(level1);
      expect(flattened[1]).toBe(level2);
      expect(flattened[2]).toBe(level3);
    });

    it('should handle multiple children at the same level', () => {
      const child1 = new TreeNode({
        id: 'child1',
        name: 'Child 1',
        filepath: '/parent/child1.md',
      });

      const child2 = new TreeNode({
        id: 'child2',
        name: 'Child 2',
        filepath: '/parent/child2.md',
      });

      const parent = new TreeNode({
        id: 'parent',
        name: 'Parent',
        filepath: '/parent.md',
        children: [child1, child2],
      });

      const root = new TreeNode({
        id: 'root',
        name: 'root',
        filepath: '',
        parent: null,
        children: [parent],
      });

      const flattened = parent.flatten();

      expect(flattened).toHaveLength(3);
      expect(flattened[0]).toBe(parent);
      expect(flattened[1]).toBe(child1);
      expect(flattened[2]).toBe(child2);
    });
  });
}); 