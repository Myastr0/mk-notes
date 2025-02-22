# Implementation Details

## Sitemap Implementation

This document provides technical details about the sitemap implementation in MK Notes, intended for contributors who want to understand or modify the codebase.

### Core Classes

#### TreeNode Class

The `TreeNode` class is the fundamental building block of the sitemap structure:

```typescript
class TreeNode {
  id: string; // Unique identifier
  name: string; // Display name
  filepath: string; // Associated file path
  children: TreeNode[]; // Child nodes
  parent: TreeNode | null; // Parent reference
}
```

#### SiteMap Class

The `SiteMap` class manages the tree construction and optimization:

### Tree Construction Process

1. **Initial Tree Building**

   ```typescript
   for (const filepath of sortedFilePaths) {
     const parts = filepath.split(path.sep);
     let currentNode = siteMap._root;

     for (const part of parts) {
       // Create or find child nodes
       // Update parent-child relationships
     }
   }
   ```

2. **Tree Optimization**
   ```typescript
   siteMap._updateTree();
   ```
   - Applies the index.md and first-file rules
   - Flattens unnecessary directory levels
   - Updates parent-child relationships

### Serialization Implementation

The sitemap implements JSON serialization for persistence and debugging:

```typescript
// Serialize to JSON
const json = siteMap.toJSON();

// Reconstruct from JSON
const reconstructed = SiteMap.fromJSON(json);
```

### Tree Update Rules Implementation

The `_updateTree` method implements two main optimization strategies:

1. **Directory Flattening**

   - Removes unnecessary nesting levels
   - Implemented in `removeUselessNodesTree`

2. **Content Assignment**
   - Handles index.md priority
   - Implements first-file fallback
   - Manages parent-child relationship updates
   - Implemented in `traverseAndUpdate`
