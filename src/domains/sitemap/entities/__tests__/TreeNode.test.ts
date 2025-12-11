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
}); 